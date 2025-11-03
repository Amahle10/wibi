import Admin from '../models/Admin.js';
import Driver from '../models/Driver.js';
import Ride from '../models/Ride.js';
import Payment from '../models/Payment.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

// @desc Register admin
// @route POST /api/admins/register
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const admin = await Admin.create({ name, email, password });

    res.status(201).json({
      token: generateToken(admin._id),
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Login admin
// @route POST /api/admins/login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(admin._id),
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all drivers
// @route GET /api/admins/drivers
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password'); // excludes password
    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc Get rides (optional filter by status)
export const getRides = async (req, res) => {
  const { status } = req.query;
  const rides = await Ride.find(status ? { status } : {})
    .populate('driver', 'name email carModel carPlate')
    .populate('user', 'name email');
  res.json(rides);
};

// @desc Get payments (optional filter by status)
export const getPayments = async (req, res) => {
  const { status } = req.query;
  const payments = await Payment.find(status ? { status } : {});
  res.json(payments);
};

// @desc Process payments (mark pending as completed)
export const processPayments = async (req, res) => {
  const { date } = req.query;
  const cutoff = date ? new Date(date) : new Date();
  const pending = await Payment.find({ status: 'pending', date: { $lte: cutoff } });

  const grouped = {};
  pending.forEach((p) => {
    if (!grouped[p.driverId]) grouped[p.driverId] = [];
    grouped[p.driverId].push(p);
  });

  const results = [];
  for (const driverId in grouped) {
    const driverPayments = grouped[driverId];
    const totalPaid = driverPayments.reduce((sum, p) => sum + p.driverEarnings, 0);
    await Payment.updateMany(
      { _id: { $in: driverPayments.map((p) => p._id) } },
      { status: 'completed' }
    );
    results.push({
      driverId,
      totalPaid,
      ridesPaid: driverPayments.map((p) => p.rideId),
      status: 'completed'
    });
  }

  res.json(results);
};

// @desc Get analytics summary
// @desc Get analytics summary
export const getAnalytics = async (req, res) => {
  const totalDrivers = await Driver.countDocuments();
  const activeRides = await Ride.countDocuments({ status: 'ongoing' });
  const completedRides = await Ride.countDocuments({ status: 'completed' });
  const platformRevenue = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$platformCommission' } } }
  ]);

  res.json({
    totalDrivers,
    activeRides,
    completedRides,
    platformRevenue: platformRevenue[0]?.total || 0
  });
};


// @desc Get pending driver registrations
// @route GET /api/admins/drivers/pending
// @access Private (admin only)
export const getPendingDrivers = async (req, res) => {
  try {
    const pendingDrivers = await Driver.find({ status: 'pending' }).select(
      '-password'
    );
    res.json(pendingDrivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


// @desc Approve a pending driver
// @route PATCH /api/admins/drivers/:id/approve
export const approveDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ msg: 'Driver not found' });
    if (driver.status !== 'pending')
      return res.status(400).json({ msg: `Driver status is already ${driver.status}` });

    driver.status = 'active';
    await driver.save();

    res.json({ msg: 'Driver approved successfully', driver: { id: driver._id, status: driver.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc Reject a pending driver
// @route PATCH /api/admins/drivers/:id/reject
export const rejectDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ msg: 'Driver not found' });
    if (driver.status !== 'pending') return res.status(400).json({ msg: 'Driver already processed' });

    driver.status = 'rejected';
    await driver.save();

    res.json({ msg: 'Driver rejected successfully', driver: { id: driver._id, status: driver.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


// @desc Get a single driver by ID (admin view)
// @route GET /api/admins/drivers/:id
export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select('-password');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
