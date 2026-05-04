# QR-Based Auto Fare Complaint & Refund Management System

An advanced, smart city, full-stack transportation resolution portal. Passengers scan an auto driver's dynamic QR code to log overcharging, while administrators review operations, verify evidence, automatically calculate excess fare, and track refunds.

---

## Technical Architecture Overview

- **Frontend**: React.js 19 + Tailwind CSS + Framer Motion + Lucide React + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (via Mongoose) with smart Local JSON Persistence Fallback
- **Security**: JSON Web Tokens (JWT) for authentication & role-based route authorization.

---

## Primary System Functionality

### 1. Account Roles & Security
- **Passenger**: Raise instances of overcharging, view histories, track compensations.
- **Driver**: View complaint logs raised against their vehicle, submit defense responses.
- **Admin**: Master console viewing analytics, complete complaint management, unban/ban malicious accounts.

### 2. QR Code Resolution Framework
- Auto Drivers view their unique, dynamic QR code. 
- Scanning the QR redirects immediately to the complaint logging page with the vehicle details auto-populated.

### 3. Smart Analytics & Dynamic Heatmap
- Advanced AI-supported risk assessment for complaints.
- Real-time heatmaps outlining resolution statuses.
- Full Audit Trail actions ledger.

---

## Fast Startup & Installation

### 1. Start the Backend API Server
Navigate to the `backend/` folder and run dependencies installation:
```bash
cd backend
npm install
npm run dev
```
*The backend connects to MongoDB at `mongodb://127.0.0.1:27017/qr_auto_fare`. If MongoDB is not present, it gracefully persists locally via the fallback `data.json` database.*

### 2. Start the Frontend Dev Server
Navigate to the `frontend/` folder and launch the interactive development client:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) to launch the app.

---

## Credentials for Instant Testing

To review full administrative functionalities instantly, use the pre-seeded admin profile:
- **Email**: `admin@auto-fare.gov`
- **Password**: `admin123`
