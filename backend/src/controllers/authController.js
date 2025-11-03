import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js'; // import your Admin model

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: 'Missing fields' });

    if (role === 'adminuser') {
      // Check if admin already exists
      let admin = await Admin.findOne({ email });
      if (admin)
        return res.status(400).json({ msg: 'Admin already exists' });

      const hash = await bcrypt.hash(password, 10);

      admin = new Admin({ name, email, password: hash });
      await admin.save();

      const token = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: { id: admin._id, name: admin.name, email: admin.email, role: 'adminuser' },
      });
    } else {
      // Default: normal user
      let user = await User.findOne({ email });
      if (user)
        return res.status(400).json({ msg: 'User already exists' });

      const hash = await bcrypt.hash(password, 10);

      user = new User({ name, email, password: hash, role: 'user' });
      await user.save();

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: 'user' },
      });
    }
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: 'Missing fields' });

    let account;
    if (role === 'adminuser') {
      account = await Admin.findOne({ email });
      if (!account) return res.status(400).json({ msg: 'Invalid credentials' });
    } else {
      account = await User.findOne({ email });
      if (!account) return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: account._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    return res.json({
      token,
      user: { id: account._id, name: account.name, email: account.email, role: role || 'user' },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
}

export default { register, login };
