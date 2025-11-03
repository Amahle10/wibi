import Payment from '../models/Payment.js';
import Driver from '../models/Driver.js';
import Settings from '../models/Settings.js';

// Process subscription payment
export const createSubscription = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const driverId = req.driver.id;

    // Get active settings for subscription fee
    const settings = await Settings.getActive();
    const { monthly: subscriptionFee } = settings.subscriptionFee;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Calculate subscription period
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Create payment record
    const payment = new Payment({
      driverId,
      type: 'subscription',
      amount: subscriptionFee,
      paymentMethod,
      subscriptionPeriod: {
        start: startDate,
        end: endDate
      },
      status: 'pending' // Will be updated by payment webhook
    });

    await payment.save();

    // Update driver's subscription status
    driver.planType = 'subscription';
    driver.subscriptionStatus = {
      isActive: true, // Will be set to true after payment confirmation
      currentPeriod: {
        start: startDate,
        end: endDate
      },
      lastPayment: {
        amount: subscriptionFee,
        date: new Date()
      }
    };

    await driver.save();

    res.status(201).json({
      message: 'Subscription payment initiated',
      payment: payment,
      subscriptionStatus: driver.subscriptionStatus
    });
  } catch (error) {
    console.error('Subscription payment error:', error);
    res.status(500).json({ message: 'Subscription payment failed', error: error.message });
  }
};

// Process ride commission
export const processCommission = async (req, res) => {
  try {
    const { rideId, rideFare } = req.body;
    const driverId = req.driver.id;

    // Get active settings for commission rate
    const settings = await Settings.getActive();
    const commissionRate = settings.commissionRate;

    // Create commission payment record
    const payment = new Payment({
      driverId,
      type: 'commission',
      rideId,
      rideFare,
      commissionRate,
      amount: rideFare * commissionRate,
      status: 'completed', // Commissions are deducted automatically
      paymentMethod: 'automatic',
      processedAt: new Date()
    });

    await payment.save();

    res.json({
      message: 'Commission processed',
      payment: payment
    });
  } catch (error) {
    console.error('Commission processing error:', error);
    res.status(500).json({ message: 'Commission processing failed', error: error.message });
  }
};

// Get driver's payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const driverId = req.driver.id;

    // Build query
    const query = { driverId };
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate totals
    const totals = await Payment.aggregate([
      { $match: query },
      { $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      payments,
      totals: totals.reduce((acc, curr) => {
        acc[curr._id] = {
          total: curr.total,
          count: curr.count
        };
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment history', error: error.message });
  }
};

// Webhook handler for payment status updates
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, status, transactionId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = status;
    payment.transactionId = transactionId;
    payment.processedAt = new Date();

    if (status === 'completed' && payment.type === 'subscription') {
      // Activate driver's subscription
      await Driver.findByIdAndUpdate(payment.driverId, {
        'subscriptionStatus.isActive': true
      });
    }

    await payment.save();

    res.json({ message: 'Payment status updated', payment });
  } catch (error) {
    console.error('Payment status update error:', error);
    res.status(500).json({ message: 'Payment status update failed', error: error.message });
  }
};