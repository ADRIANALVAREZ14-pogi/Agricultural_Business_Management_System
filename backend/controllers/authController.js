const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper: Determine target route per role
const getRedirectRouteByRole = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin';
    case 'Gulayan Staff':
      return '/gulayan-staff';
    case 'Prutasan Staff':
      return '/prutasan-staff';
    case 'Babuyan Staff':
      return '/babuyan-staff';
    default:
      return '/login';
  }
};

// ==========================================
// 4.1 LOGIN AND ROLE-BASED ROUTING
// ==========================================
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const [users] = await db.query(
      `SELECT id, username, password_hash, full_name, role, status
       FROM users
       WHERE username = ?
       LIMIT 1`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = users[0];

    // Reject deactivated accounts
    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact the Admin.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
      process.env.JWT_SECRET || 'farm_management_secret_key',
      { expiresIn: '8h' }
    );

    const redirectTo = getRedirectRouteByRole(user.role);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
      },
      redirectTo,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

// Validate active session & current user role
exports.getSession = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, full_name, role, status
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (users.length === 0 || users[0].status !== 'active') {
      return res.status(403).json({ message: 'Session invalid or account deactivated.' });
    }

    res.status(200).json({
      user: users[0],
      redirectTo: getRedirectRouteByRole(users[0].role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify session.', error: error.message });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully.' });
};