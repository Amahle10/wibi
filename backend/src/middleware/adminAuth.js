import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js'; // <-- use Admin collection

export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Look in Admin collection
      const admin = await Admin.findById(decoded.id).select('-password');

      if (!admin) {
        return res.status(401).json({ message: 'Not authorized', error: 'Admin not found' });
      }

      req.admin = admin; // attach admin to request
      next();
    } catch (err) {
      res.status(401).json({ message: 'Not authorized', error: err.message });
    }
  } else {
    res.status(401).json({ message: 'No token, not authorized' });
  }
};
