import express from 'express';
import jwt from 'jsonwebtoken';
import Ride from '../models/Ride.js';

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

// create ride
router.post('/', auth, async (req, res) => {
  try {
    const { origin, destination, passenger, driver } = req.body;
    const ride = new Ride({ origin, destination, passenger, driver });
    await ride.save();
    res.json(ride);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// list rides for current user
router.get('/', auth, async (req, res) => {
  try {
    const rides = await Ride.find({ $or: [{ passenger: req.user.id }, { driver: req.user.id }] }).sort('-createdAt');
    res.json(rides);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// update ride status
router.patch('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ msg: 'Not found' });
    const { status } = req.body;
    ride.status = status || ride.status;
    await ride.save();
    res.json(ride);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;
