import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['passenger', 'driver', 'admin'], default: 'passenger' },
  driverProfile: {
    vehicleNumber: { type: String },
    isVerified: { type: Boolean, default: false },
    driverReputationScore: { type: Number, default: 100 },
    earnings: { type: Number, default: 0 },
    licenseNumber: { type: String }
  },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Complaint Schema
const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  passenger: { type: String, required: true },
  passengerEmail: { type: String },
  driver: { type: String },
  driverEmail: { type: String },
  vehicleNumber: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  distanceKM: { type: Number, required: true },
  farePaid: { type: Number, required: true },
  expectedFare: { type: Number, required: true },
  screenshotProof: { type: String },
  additionalEvidence: { type: String },
  gpsLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Verified', 'Driver Notified', 'Refund Initiated', 'Refund Completed', 'Fraudulent'],
    default: 'Submitted'
  },
  complaintPriority: { type: String, enum: ['Normal', 'High'], default: 'Normal' },
  penaltyAmount: { type: Number, default: 0 },
  fakeComplaintReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Refund Schema
const refundSchema = new mongoose.Schema({
  refundId: { type: String, required: true, unique: true },
  complaintId: { type: String, required: true },
  amount: { type: Number, required: true },
  passengerEmail: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  transactionId: { type: String },
  bankDetails: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Admin Log Schema
const adminLogSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  adminEmail: { type: String },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Compile models only if not already compiled to avoid testing conflicts
export const UserModel = mongoose.models.users || mongoose.model('users', userSchema);
export const ComplaintModel = mongoose.models.complaints || mongoose.model('complaints', complaintSchema);
export const RefundModel = mongoose.models.refunds || mongoose.model('refunds', refundSchema);
export const NotificationModel = mongoose.models.notifications || mongoose.model('notifications', notificationSchema);
export const AdminLogModel = mongoose.models.adminLogs || mongoose.model('adminLogs', adminLogSchema);
