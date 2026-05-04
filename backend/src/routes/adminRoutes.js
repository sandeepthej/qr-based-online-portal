import express from 'express';
import { User, Complaint, Refund, AdminLog } from '../db.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Fetch Admin Statistics & Real-Time Dashboard Summary
router.get('/stats', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const totalUsers = await User.find();
    const totalComplaints = await Complaint.find();
    const totalRefunds = await Refund.find();

    const stats = {
      counts: {
        passengers: totalUsers.filter(u => u.role === 'passenger').length,
        drivers: totalUsers.filter(u => u.role === 'driver').length,
        complaints: totalComplaints.length,
        refunds: totalRefunds.length
      },
      statusDistribution: {
        Submitted: totalComplaints.filter(c => c.status === 'Submitted').length,
        UnderReview: totalComplaints.filter(c => c.status === 'Under Review').length,
        Verified: totalComplaints.filter(c => c.status === 'Verified').length,
        DriverNotified: totalComplaints.filter(c => c.status === 'Driver Notified').length,
        RefundInitiated: totalComplaints.filter(c => c.status === 'Refund Initiated').length,
        RefundCompleted: totalComplaints.filter(c => c.status === 'Refund Completed').length,
        Fraudulent: totalComplaints.filter(c => c.status === 'Fraudulent').length
      },
      earningsRecovered: totalRefunds.reduce((sum, r) => sum + (r.amount || 0), 0),
      recentActivity: await AdminLog.find()
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// View all users
router.get('/users', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find();
    // Exclude hashed passwords for security
    const sanitized = users.map(({ password, ...u }) => u);
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user status (Ban / Unban)
router.put('/users/ban/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      isBanned: !!isBanned,
      banReason: banReason || ''
    });

    await AdminLog.create({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
      details: `${user.username} was ${isBanned ? 'banned' : 'unbanned'}.`
    });

    res.json({ message: `User successfully ${isBanned ? 'banned' : 'unbanned'}`, user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
