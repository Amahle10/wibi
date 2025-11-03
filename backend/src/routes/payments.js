import express from 'express';
import {
  createSubscription,
  processCommission,
  getPaymentHistory,
  updatePaymentStatus
} from '../controllers/paymentController.js';
import { authDriver } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require driver authentication)
router.use(authDriver);
router.post('/subscribe', createSubscription);
router.post('/commission', processCommission);
router.get('/history', getPaymentHistory);

// Webhook endpoint (protected by separate auth)
router.post('/webhook', updatePaymentStatus); // TODO: Add webhook authentication middleware

export default router;