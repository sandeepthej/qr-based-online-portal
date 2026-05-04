import express from 'express';
import { Complaint, User, Refund, AdminLog } from '../db.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Generate unique ID
const generateId = (prefix = 'CMP') => {
  return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Passenger creates complaint
router.post('/', authMiddleware, authorizeRoles('passenger'), async (req, res) => {
  try {
    const {
      vehicleNumber,
      pickupLocation,
      dropLocation,
      distanceKM,
      farePaid,
      expectedFare,
      screenshotProof,
      additionalEvidence,
      gpsLocation,
      description
    } = req.body;

    if (!vehicleNumber || !pickupLocation || !dropLocation || !distanceKM || !farePaid || !expectedFare || !description) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    // AI-based Fake detection check
    let isLikelyFraud = false;
    let autoDetectionMessage = 'AI Risk Analysis: Verified';
    let complaintPriority = 'Normal';

    // Rule: Fare paid is less than expected fare
    if (parseFloat(farePaid) < parseFloat(expectedFare)) {
      isLikelyFraud = true;
      autoDetectionMessage = 'AI Risk: Fare paid is reported as lower than standard expected fare.';
    }

    // Rule: Distance-fare discrepancy
    const minimumBaseFare = 30;
    const standardRate = minimumBaseFare + (distanceKM * 15);
    // If user's reported expected fare is wildly inaccurate compared to the calculated standard
    if (Math.abs(expectedFare - standardRate) > standardRate * 0.5) {
      autoDetectionMessage += ' Alert: Calculated standard fare varies significantly from user expected fare.';
    }

    // If genuine overcharging is extremely high, raise priority
    if (farePaid - expectedFare > 100) {
      complaintPriority = 'High';
    }

    // Attempt to locate driver by vehicle number
    const driver = await User.findOne({ 'driverProfile.vehicleNumber': vehicleNumber });

    const newComplaint = await Complaint.create({
      complaintId: generateId(),
      passenger: req.user.username,
      passengerEmail: req.user.email,
      driver: driver ? driver.username : 'Unknown Driver',
      driverEmail: driver ? driver.email : 'Unknown',
      vehicleNumber: vehicleNumber.toUpperCase(),
      pickupLocation,
      dropLocation,
      distanceKM: parseFloat(distanceKM),
      farePaid: parseFloat(farePaid),
      expectedFare: parseFloat(expectedFare),
      screenshotProof: screenshotProof || '',
      additionalEvidence: additionalEvidence || '',
      gpsLocation: gpsLocation || { lat: 12.9716, lng: 77.5946 },
      description,
      status: isLikelyFraud ? 'Under Review' : 'Submitted',
      complaintPriority,
      fakeComplaintReason: isLikelyFraud ? autoDetectionMessage : '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      message: 'Complaint submitted successfully!',
      complaint: newComplaint,
      aiAnalysis: autoDetectionMessage
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get passenger's complaints
router.get('/passenger', authMiddleware, authorizeRoles('passenger'), async (req, res) => {
  try {
    const complaints = await Complaint.find({ passengerEmail: req.user.email });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get complaints against the driver
router.get('/driver', authMiddleware, authorizeRoles('driver'), async (req, res) => {
  try {
    const complaints = await Complaint.find({ driverEmail: req.user.email });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Respond to complaint by driver
router.put('/driver/respond/:id', authMiddleware, authorizeRoles('driver'), async (req, res) => {
  try {
    const { driverResponse } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.driverEmail !== req.user.email) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(req.params.id, {
      driverResponse,
      status: 'Under Review',
      updatedAt: new Date()
    });

    res.json({ message: 'Response submitted successfully!', complaint: updatedComplaint });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin lists all complaints with search & filters
router.get('/admin/all', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin updates status (e.g. Verified, Driver Notified, Refund Initiated, Refund Completed, Fraudulent)
router.put('/admin/status/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status, fakeComplaintReason, penaltyAmount } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const updatedComplaint = await Complaint.findByIdAndUpdate(req.params.id, {
      status,
      fakeComplaintReason: fakeComplaintReason !== undefined ? fakeComplaintReason : complaint.fakeComplaintReason,
      penaltyAmount: penaltyAmount !== undefined ? penaltyAmount : complaint.penaltyAmount,
      updatedAt: new Date()
    }, { new: true });

    // If marked as Fraudulent/Fake, admin can ban user
    if (status === 'Fraudulent') {
      const passengerUser = await User.findOne({ email: complaint.passengerEmail });
      if (passengerUser) {
        await User.findByIdAndUpdate(passengerUser._id || passengerUser.id, {
          isBanned: true,
          banReason: `Fraudulent complaint raised (ID: ${complaint.complaintId})`
        });
      }
    }

    // Generate refund record if Refund Initiated
    if (status === 'Refund Initiated') {
      const excessMoney = complaint.farePaid - complaint.expectedFare;
      const refundId = `REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await Refund.create({
        refundId,
        complaintId: complaint.complaintId,
        amount: excessMoney > 0 ? excessMoney : 0,
        passengerEmail: complaint.passengerEmail,
        status: 'Pending',
        createdAt: new Date()
      });
    }

    await AdminLog.create({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'UPDATE_COMPLAINT_STATUS',
      details: `Complaint ${complaint.complaintId} changed to ${status}.`
    });

    res.json({ message: `Complaint marked as ${status} successfully`, complaint: updatedComplaint });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
