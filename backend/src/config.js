import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5001;
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fare_refund_key';
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qr_auto_fare';
