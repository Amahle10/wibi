import User from '../models/User.js';

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}

export async function listUsers(req, res) {
  try {
    const me = await User.findById(req.user.id);
    if (!me || me.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}

export default { getMe, listUsers };
