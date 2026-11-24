const bcrypt = require('bcryptjs');
const db = require('../config/db');

const VALID_ROLES = ['Admin', 'Gulayan Staff', 'Prutasan Staff', 'Babuyan Staff'];
const VALID_DEPARTMENTS = ['All', 'Gulayan', 'Prutasan', 'Babuyan'];

// ==========================================
// 4.2 USER ACCOUNT AND ROLE-BASED ACCESS (ADMIN)
// ==========================================

// Retrieve all user accounts
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, full_name, department, role, status, created_at
       FROM users
       ORDER BY id DESC`
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user accounts.', error: error.message });
  }
};

// Admin creates a new user account with assigned department and role
exports.createUser = async (req, res) => {
  const { username, password, full_name, department, role } = req.body;

  if (!username || !password || !full_name || !department || !role) {
    return res.status(400).json({ message: 'All fields (username, password, full name, department, role) are required.' });
  }

  if (!VALID_ROLES.includes(role) || !VALID_DEPARTMENTS.includes(department)) {
    return res.status(400).json({ message: 'Invalid department or role assignment.' });
  }

  try {
    const [existing] = await db.query(SELECT id FROM users WHERE username = ?, [username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (username, password_hash, full_name, department, role, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [username, passwordHash, full_name, department, role]
    );

    res.status(201).json({
      id: result.insertId,
      username,
      full_name,
      department,
      role,
      status: 'active',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user account.', error: error.message });
  }
};

// Admin edits user details, department, role, and optional password reset
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, full_name, department, role, password } = req.body;

  if (!VALID_ROLES.includes(role) || !VALID_DEPARTMENTS.includes(department)) {
    return res.status(400).json({ message: 'Invalid department or role assignment.' });
  }

  try {
    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      await db.query(
        `UPDATE users
         SET username = ?, full_name = ?, department = ?, role = ?, password_hash = ?
         WHERE id = ?`,
        [username, full_name, department, role, passwordHash, id]
      );
    } else {
      await db.query(
        `UPDATE users
         SET username = ?, full_name = ?, department = ?, role = ?
         WHERE id = ?`,
        [username, full_name, department, role, id]
      );
    }

    res.status(200).json({ message: 'User account updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user account.', error: error.message });
  }
};

// Admin deactivates or reactivates a user account
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' or 'deactivated'

  if (!['active', 'deactivated'].includes(status)) {
    return res.status(400).json({ message: 'Invalid account status.' });
  }

  // Prevent Admin from deactivating their own currently logged-in account
  if (Number(id) === Number(req.user.id) && status === 'deactivated') {
    return res.status(400).json({ message: 'You cannot deactivate your own active Admin account.' });
  }

  try {
    await db.query(UPDATE users SET status = ? WHERE id = ?, [status, id]);
    res.status(200).json({ message: User account ${status}. });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status.', error: error.message });
  }
};