import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Ensure required fields exist
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // ❌ Prevent unauthorized roles
    if (role === 'adminuser' || role === 'driver') {
      return res.status(403).json({ msg: 'Not allowed to register this type of user here' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Save as normal user
    const user = new User({
      name,
      email,
      password: hash,
      role: 'user', // force role = user
    });

    await user.save();

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
}

export default { register, login };
