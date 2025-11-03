import jwt from 'jsonwebtoken';
import Driver from '../models/Driver.js';

export const authDriver = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get driver (exclude password)
    const driver = await Driver.findById(decoded.id).select('-password');
    if (!driver) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if driver is suspended
    if (driver.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended' });
    }

    // Add driver to request
    req.driver = {
      id: driver._id,
      email: driver.email,
      planType: driver.planType,
      status: driver.status
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Middleware to check if subscription is active
export const checkSubscription = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.driver.id);
    
    if (driver.planType === 'subscription' && !driver.isSubscriptionActive()) {
      return res.status(403).json({
        message: 'Subscription expired',
        subscriptionStatus: driver.subscriptionStatus
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Subscription check failed' });
  }
};

// Middleware to validate driver can accept rides
export const canAcceptRides = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.driver.id);
    
    if (!driver.canAcceptRides()) {
      return res.status(403).json({
        message: 'Cannot accept rides',
        reason: driver.planType === 'subscription' ? 'Subscription inactive' : 'Account inactive'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Ride acceptance check failed' });
  }
};