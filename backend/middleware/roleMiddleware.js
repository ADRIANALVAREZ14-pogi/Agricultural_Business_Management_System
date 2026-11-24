const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ==========================================
// 4.1 SESSION AUTHENTICATION & ADMIN GUARD
// ==========================================
const authenticateSession = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'farm_management_secret_key'
    );

    // Ensure account has not been deactivated mid-session
    const [rows] = await db.query(
      SELECT id, username, role, status FROM users WHERE id = ? LIMIT 1,
      [decoded.id]
    );

    if (rows.length === 0 || rows[0].status !== 'active') {
      return res.status(403).json({ message: 'Account is deactivated or does not exist.' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Access restricted to Admin full menu only.' });
  }
  next();
};

// ==========================================
// 1.11 GULAYAN STAFF ROLE MIDDLEWARE
// ==========================================
const authorizeGulayanStaff = (req, res, next) => {
  if (req.user?.role !== 'Gulayan Staff') {
    return res.status(403).json({ message: 'Access restricted to Gulayan Staff interface only.' });
  }
  next();
};

// ==========================================
// 2.11 PRUTASAN STAFF ROLE MIDDLEWARE
// ==========================================
const authorizePrutasanStaff = (req, res, next) => {
  if (req.user?.role !== 'Prutasan Staff') {
    return res.status(403).json({ message: 'Access restricted to Prutasan Staff interface only.' });
  }
  next();
};

// ==========================================
// 3.9 BABUYAN STAFF ROLE MIDDLEWARE
// ==========================================
const authorizeBabuyanStaff = (req, res, next) => {
  if (req.user?.role !== 'Babuyan Staff') {
    return res.status(403).json({ message: 'Access restricted to Babuyan Staff interface only.' });
  }
  next();
};

module.exports = {
  authenticateSession,
  authorizeAdmin,
  authorizeGulayanStaff,
  authorizePrutasanStaff,
  authorizeBabuyanStaff,
};