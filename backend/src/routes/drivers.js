import express from 'express';
import {
  registerDriver,
  loginDriver,
  getProfile,
  updatePlanType,
  updateLocation,
  updateStatus
} from '../controllers/driverController.js';
import { authDriver } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerDriver);   // Driver registration (pending approval)
router.post('/login', loginDriver);         // Driver login (only active drivers)

// Protected routes (require driver authentication)
router.use(authDriver);                     // All routes below require JWT auth
router.get('/profile', getProfile);
router.patch('/plan', updatePlanType);
router.patch('/location', updateLocation);
router.patch('/status', updateStatus);


export default router;
