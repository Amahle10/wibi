import express from 'express';
import { registerAdmin, loginAdmin, getAllDrivers, getRides, getPayments, processPayments, getAnalytics, getPendingDrivers, approveDriver, rejectDriver, getDriverById } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Auth
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes
router.get('/drivers', protectAdmin, getAllDrivers);
router.get('/rides', protectAdmin, getRides);
router.get('/payments', protectAdmin, getPayments);
router.patch('/payments/process', protectAdmin, processPayments);
router.get('/analytics', protectAdmin, getAnalytics);
// Get pending drivers
router.get('/drivers/pending', protectAdmin, getPendingDrivers);
// Approve driver
router.patch('/drivers/:id/approve', protectAdmin, approveDriver);
// Reject a pending driver
router.patch('/drivers/:id/reject', protectAdmin, rejectDriver);
// Get a single driver by ID
router.get('/drivers/:id', protectAdmin, getDriverById);

export default router;
