import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { User, AdminLog } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, vehicleNumber, licenseNumber } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All mandatory fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserPayload = {
      username,
      email,
      password: hashedPassword,
      role,
      isBanned: false
    };

    if (role === 'driver') {
      newUserPayload.driverProfile = {
        vehicleNumber: vehicleNumber || '',
        licenseNumber: licenseNumber || '',
        isVerified: false,
        driverReputationScore: 100,
        earnings: 0
      };
    }

    const createdUser = await User.create(newUserPayload);

    // Create log for Admin
    await AdminLog.create({
      adminId: 'System',
      adminEmail: 'system@auto-fare.gov',
      action: 'USER_REGISTERED',
      details: `${role.toUpperCase()} ${username} registered.`
    });

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Both Email and Password are required' });
    }

    // Default seeded admin login for testing
    if (email === 'admin@auto-fare.gov' && password === 'admin123') {
      let admin = await User.findOne({ email });
      if (!admin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        admin = await User.create({
          username: 'Master Admin',
          email: 'admin@auto-fare.gov',
          password: hashedPassword,
          role: 'admin',
          isBanned: false
        });
      }

      const token = jwt.sign({ id: admin._id || admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: {
          id: admin._id || admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: `Access denied. Account is banned. Reason: ${user.banReason || 'Fraudulent activity detected.'}` });
    }

    const token = jwt.sign({ id: user._id || user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        driverProfile: user.driverProfile
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, vehicleNumber, licenseNumber } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateFields = { username };

    if (user.role === 'driver' && user.driverProfile) {
      updateFields.driverProfile = {
        ...user.driverProfile,
        vehicleNumber: vehicleNumber || user.driverProfile.vehicleNumber,
        licenseNumber: licenseNumber || user.driverProfile.licenseNumber
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateFields);
    res.json({ message: 'Profile updated successfully!', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
