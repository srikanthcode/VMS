const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');
const { isValidPhone, normalizePhone } = require('../utils/phoneValidator');

const resetTokens = {};
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    pass: process.env.GMAIL_PASS || 'your-app-password'
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'VMS - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #e94560; margin-bottom: 20px;">Vehicle Management System</h1>
          <h2 style="color: #ffffff; margin-bottom: 20px;">Password Reset OTP</h2>
          <div style="background: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="color: #333; font-size: 16px;">Your OTP for password reset is:</p>
            <h1 style="color: #e94560; font-size: 48px; letter-spacing: 10px; margin: 20px 0;">${otp}</h1>
            <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes.</p>
          </div>
          <p style="color: #b8c5d6; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email and password are required' });
    }

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const cc = req.body.countryCode || '';
    if (!isValidPhone(phone, cc)) {
      const expected = (cc && require('../utils/phoneValidator').COUNTRY_PHONE_LENGTHS[String(cc).replace(/\D/g, '')]) || 10;
      return res.status(400).json({ success: false, message: `Phone number must be exactly ${expected} digits` });
    }
    const normalizedPhone = normalizePhone(phone, cc);

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login instead.' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken. Please choose another.' });
    }

    const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Phone number already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      name: username,
      email,
      phone: normalizedPhone,
      password: hashedPassword,
      role: 'CUSTOMER'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      return res.status(400).json({ success: false, message: `This ${field} is already registered.` });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const identifier = String(username).trim();
    if (!identifier || identifier.includes('@')) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please enter your username.' });
    }

    const user = await User.findOne({
      where: { username: identifier }
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) {
      if (!isValidPhone(phone)) {
        return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
      }
      updateData.phone = normalizePhone(phone);
    }

    await user.update(updateData);

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new passwords are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'No account found with this email address' });
    }

    const otp = generateOTP();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 600000,
      verified: false,
      attempts: 0
    };

    try {
      await sendOTPEmail(email, otp);
      res.json({ success: true, message: 'OTP sent to your email', data: { email } });
    } catch (emailError) {
      console.error('Email error:', emailError);
      res.json({
        success: true,
        message: 'OTP generated (email service not configured)',
        data: { email, otp: process.env.NODE_ENV === 'production' ? undefined : otp }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const otpData = otpStore[email];
    if (!otpData) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
    }

    if (otpData.expiresAt < Date.now()) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    if ((otpData.attempts || 0) >= 5) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }

    if (String(otpData.otp) !== String(otp)) {
      otpData.attempts = (otpData.attempts || 0) + 1;
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    otpStore[email].verified = true;

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const otpData = otpStore[email];
    if (!otpData || !otpData.verified) {
      return res.status(400).json({ success: false, message: 'Please verify OTP first' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { email } });

    delete otpStore[email];

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOTP,
  resetPassword
};
