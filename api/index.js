import express from 'express';
import cors from 'cors';
import { PORT } from '../backend/src/config.js';
import { connectDB } from '../backend/src/db.js';

// Routers
import authRoutes from '../backend/src/routes/authRoutes.js';
import complaintRoutes from '../backend/src/routes/complaintRoutes.js';
import refundRoutes from '../backend/src/routes/refundRoutes.js';
import adminRoutes from '../backend/src/routes/adminRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('QR Auto Complaint API is active and fully functional.');
});

export default async (req, res) => {
  await connectDB();
  return app(req, res);
};
