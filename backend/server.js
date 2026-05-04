import express from 'express';
import cors from 'cors';
import { PORT } from './src/config.js';
import { connectDB } from './src/db.js';

// Routers
import authRoutes from './src/routes/authRoutes.js';
import complaintRoutes from './src/routes/complaintRoutes.js';
import refundRoutes from './src/routes/refundRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/admin', adminRoutes);

// Add health check/welcome route
app.get('/', (req, res) => {
  res.send('QR Auto Complaint API is active and fully functional.');
});

// Establish Mongo DB connection & start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Express API Server listening on port ${PORT}`);
  });
};

startServer();
