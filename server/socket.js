const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');
const { User } = require('./models');

let io = null;

const locationPayloadFromUser = (user) => ({
  userId: user.id,
  id: user.id,
  name: user.name,
  role: user.role,
  avatar: user.avatar || null,
  latitude: user.latitude != null ? parseFloat(user.latitude) : null,
  longitude: user.longitude != null ? parseFloat(user.longitude) : null,
  lastLocationUpdate: user.lastLocationUpdate
    ? new Date(user.lastLocationUpdate).toISOString()
    : new Date().toISOString()
});

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = { id: decoded.id, role: decoded.role };
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    socket.join(`user:${user.id}`);
    socket.join(`role:${user.role}`);
    if (user.role === 'ADMIN') socket.join('admins');
    if (user.role === 'MECHANIC') socket.join('mechanics');
    if (user.role === 'CUSTOMER') socket.join('customers');

    socket.on('location:update', async (payload) => {
      if (!payload || typeof payload.latitude !== 'number' || typeof payload.longitude !== 'number') return;
      if (Math.abs(payload.latitude) > 90 || Math.abs(payload.longitude) > 180) return;

      try {
        await User.update(
          {
            latitude: payload.latitude,
            longitude: payload.longitude,
            lastLocationUpdate: new Date()
          },
          { where: { id: user.id } }
        );

        const dbUser = await User.findByPk(user.id, {
          attributes: ['id', 'name', 'role', 'latitude', 'longitude', 'lastLocationUpdate', 'avatar']
        });
        if (!dbUser) return;

        const data = locationPayloadFromUser(dbUser);
        if (payload.bookingId) data.bookingId = payload.bookingId;

        io.to('admins').emit('location:updated', data);
        io.to('mechanics').emit('location:updated', data);
        if (user.role === 'CUSTOMER') {
          io.to('admins').emit('customer:location', data);
          io.to('mechanics').emit('customer:location', data);
        }
      } catch (err) {
        console.error('location:update error:', err.message);
      }
    });

    socket.on('location:subscribe', (userId) => {
      if (!userId) return;
      const role = socket.user.role;
      if (role === 'ADMIN' || role === 'MECHANIC' || Number(userId) === Number(socket.user.id)) {
        socket.join(`watch:user:${userId}`);
      }
    });

    socket.on('location:unsubscribe', (userId) => {
      if (!userId) return;
      socket.leave(`watch:user:${userId}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => io;

const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

const emitToRole = (role, event, data) => {
  if (!io) return;
  io.to(`role:${role}`).emit(event, data);
};

const emitToAdmins = (event, data) => {
  if (!io) return;
  io.to('admins').emit(event, data);
};

const emitToMechanics = (event, data) => {
  if (!io) return;
  io.to('mechanics').emit(event, data);
};

const emitLocationUpdate = (data) => {
  if (!io) return;
  io.to('admins').emit('location:updated', data);
  io.to('mechanics').emit('location:updated', data);
  if (data?.userId) {
    io.to(`watch:user:${data.userId}`).emit('location:updated', data);
  }
};

const emitBroadcast = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToAdmins,
  emitToMechanics,
  emitLocationUpdate,
  emitBroadcast
};
