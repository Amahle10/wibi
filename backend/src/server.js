import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import ridesRoutes from './routes/rides.js';
import adminRoutes from './routes/admin.js';
import driverRoutes from './routes/drivers.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/admins', adminRoutes);
// keep legacy singular path used by tests
app.use('/api/admin', adminRoutes);
app.use('/api/drivers', driverRoutes);

// Root route
app.get('/', (req, res) => res.send({ ok: true, message: 'Wibi backend running' }));

// Start the app after DB connects
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB, exiting...', err.message);
    process.exit(1);
  }
};

// Export the app for testing. Only start the server when not running tests.
export default app;

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
