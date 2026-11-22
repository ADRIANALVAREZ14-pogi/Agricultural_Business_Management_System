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
  authorizeGulayanStaff,
  authorizePrutasanStaff,
  authorizeBabuyanStaff,
};