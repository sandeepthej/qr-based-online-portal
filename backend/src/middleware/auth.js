import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { User } from '../db.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: `Access denied. Account is banned. Reason: ${user.banReason || 'N/A'}` });
    }

    req.user = {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      username: user.username
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permission denied for this action.' });
    }
    next();
  };
};
