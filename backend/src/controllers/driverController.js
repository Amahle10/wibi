import Driver from '../models/Driver.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

// ---------------------
// Register driver (status = pending)
// ---------------------
export const registerDriver = async (req, res) => {
  try {
    const {
      name,
      surname,
      email,
      password,
      carModel,
      carPlate,
      driverLicense,
      idNumber,
      planType,
      phoneNumber
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !surname ||
      !email ||
      !password ||
      !carModel ||
      !carPlate ||
      !driverLicense ||
      !idNumber ||
      !phoneNumber
    ) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Check for duplicate email
    const existingEmail = await Driver.findOne({ email });
    if (existingEmail) return res.status(400).json({ msg: 'Email already registered' });

    // Check for duplicate driverLicense
    const existingLicense = await Driver.findOne({ driverLicense });
    if (existingLicense) return res.status(400).json({ msg: 'Driver license already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create driver
    const driver = new Driver({
      name,
      surname,
      email,
      password: hashedPassword,
      carModel,
      carPlate,
      driverLicense,
      idNumber,
      planType,
      phoneNumber,
      status: 'pending' // default status
    });

    await driver.save();

    res.status(201).json({
      msg: 'Driver registered, pending admin approval',
      driver: { id: driver._id, status: driver.status }
    });
  } catch (err) {
    console.error('Register Driver Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ---------------------
// Driver login (only if active)
// ---------------------
export const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    if (driver.status !== 'active') {
      return res.status(403).json({ msg: 'Driver not approved yet' });
    }

    const token = generateToken(driver._id);
    res.json({
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        surname: driver.surname,
        email: driver.email,
        currentStatus: driver.currentStatus,
        status: driver.status
      }
    });
  } catch (err) {
    console.error('Login Driver Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ---------------------
// Get driver profile
// ---------------------
export const getProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id).select('-password');
    if (!driver) return res.status(404).json({ msg: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ---------------------
// Update plan type
// ---------------------
export const updatePlanType = async (req, res) => {
  try {
    const { planType } = req.body;
    const driver = await Driver.findById(req.driver._id);
    if (!driver) return res.status(404).json({ msg: 'Driver not found' });

    driver.planType = planType || driver.planType;
    await driver.save();
    res.json(driver);
  } catch (err) {
    console.error('Update Plan Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ---------------------
// Update location (optional)
// ---------------------
export const updateLocation = async (req, res) => {
  // For future live-tracking
  res.json({ msg: 'Location update endpoint - to be implemented' });
};

// ---------------------
// Update status (online/offline)
// ---------------------
export const updateStatus = async (req, res) => {
  try {
    const { currentStatus } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.driver.id,
      { currentStatus },
      { new: true }
    );

    if (!driver) return res.status(404).json({ msg: 'Driver not found' });

    res.json({ msg: 'Status updated', driver });
  } catch (err) {
    console.error('Update Status Error:', err);
    res.status(500).json({ msg: err.message });
  }
};
