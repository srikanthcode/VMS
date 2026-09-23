const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');

let io = null;

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

    socket.on('location:update', (payload) => {
      if (!payload || typeof payload.latitude !== 'number' || typeof payload.longitude !== 'number') return;
      io.to('admins').emit('location:updated', {
        userId: user.id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        lastLocationUpdate: new Date().toISOString()
      });
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
  emitBroadcast
};
