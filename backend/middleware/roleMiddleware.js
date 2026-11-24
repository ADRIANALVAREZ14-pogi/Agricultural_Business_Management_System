const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ==========================================
// 4.2 ROLE-BASED ACCESS SUMMARY MATRIX
// ==========================================
const RBAC_PERMISSIONS = {
  Admin: [
    'manage_users',
    'gulayan:full',
    'prutasan:full',
    'babuyan:full',
    'expenses:manage',
    'profit:view',
    'reports:view',
    'analytics:view',
    'audit:view',
  ],
  'Gulayan Staff': [
    'gulayan:view_inventory',
    'gulayan:add_sales',
  ],
  'Prutasan Staff': [
    'prutasan:view_inventory',
    'prutasan:add_sales',
  ],
  'Babuyan Staff': [
    'babuyan:view_inventory',
    'babuyan:record_usage',
    'babuyan:edit_usage',
    'babuyan:growth_health',
  ],
};

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

    const [rows] = await db.query(
      SELECT id, username, department, role, status FROM users WHERE id = ? LIMIT 1,
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
    return res.status(403).json({ message: 'Access restricted to Administrator only.' });
  }
  next();
};

// ==========================================
// 4.2 MODULE ACCESS-CHECK FUNCTIONS (USED BY EVERY MODULE)
// ==========================================
const hasPermission = (role, requiredPermission) => {
  if (role === 'Admin') return true;
  const allowed = RBAC_PERMISSIONS[role] || [];
  return allowed.includes(requiredPermission);
};

const checkModuleAccess = (requiredPermission, requiredDepartment = null) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user || user.status !== 'active') {
      return res.status(403).json({ message: 'Inactive or unauthorized account.' });
    }

    // Administrator has full access across all departments and modules
    if (user.role === 'Admin') {
      return next();
    }

    // Enforce department isolation for staff roles
    if (requiredDepartment && user.department !== requiredDepartment) {
      return res.status(403).json({
        message: Access denied. Restricted to ${requiredDepartment} department.,
      });
    }

    // Enforce permission rule from Role-Based Access Summary
    if (!hasPermission(user.role, requiredPermission)) {
      return res.status(403).json({
        message: Access denied. Role '${user.role}' lacks '${requiredPermission}' permission.,
      });
    }

    next();
  };
};

// ==========================================
// 1.11, 2.11, 3.9 STAFF ROLE MIDDLEWARES
// ==========================================
const authorizeGulayanStaff = (req, res, next) => {
  if (req.user?.role !== 'Gulayan Staff') {
    return res.status(403).json({ message: 'Access restricted to Gulayan Staff interface only.' });
  }
  next();
};

const authorizePrutasanStaff = (req, res, next) => {
  if (req.user?.role !== 'Prutasan Staff') {
    return res.status(403).json({ message: 'Access restricted to Prutasan Staff interface only.' });
  }
  next();
};

const authorizeBabuyanStaff = (req, res, next) => {
  if (req.user?.role !== 'Babuyan Staff') {
    return res.status(403).json({ message: 'Access restricted to Babuyan Staff interface only.' });
  }
  next();
};

module.exports = {
  RBAC_PERMISSIONS,
  authenticateSession,
  authorizeAdmin,
  hasPermission,
  checkModuleAccess,
  authorizeGulayanStaff,
  authorizePrutasanStaff,
  authorizeBabuyanStaff,
};