import express from 'express';
import { Refund, AdminLog } from '../db.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all refunds (for Admin)
router.get('/admin/all', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const refunds = await Refund.find();
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update refund status (for Admin)
router.put('/admin/complete/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { transactionId, bankDetails } = req.body;
    const refund = await Refund.findById(req.params.id);

    if (!refund) return res.status(404).json({ message: 'Refund record not found' });

    const updatedRefund = await Refund.findByIdAndUpdate(req.params.id, {
      status: 'Completed',
      transactionId: transactionId || `TXN-${Date.now()}`,
      bankDetails: bankDetails || 'Digital Transfer'
    });

    await AdminLog.create({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'REFUND_COMPLETED',
      details: `Refund ID ${refund.refundId} processed successfully.`
    });

    res.json({ message: 'Refund successfully completed!', refund: updatedRefund });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Passenger views their own refunds
router.get('/passenger', authMiddleware, authorizeRoles('passenger'), async (req, res) => {
  try {
    const refunds = await Refund.find({ passengerEmail: req.user.email });
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
