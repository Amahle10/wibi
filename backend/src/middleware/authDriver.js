import jwt from 'jsonwebtoken';
import Driver from '../models/Driver.js';

export const authDriver = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No authentication token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const driver = await Driver.findById(decoded.id).select('-password');
    if (!driver) return res.status(401).json({ message: 'Invalid token' });
    if (driver.status === 'suspended') return res.status(403).json({ message: 'Account suspended' });

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


export const canAcceptRides = async (req, res, next) => {
  const driver = await Driver.findById(req.driver.id);
  if (!driver.canAcceptRides()) {
    return res.status(403).json({ message: 'Cannot accept rides' });
  }
  next();
};
