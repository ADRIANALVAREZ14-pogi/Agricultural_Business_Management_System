// Role-based access check for Gulayan Staff (referencing 4.1 & 4.2)
const authorizeGulayanStaff = (req, res, next) => {
  if (req.user?.role !== 'Gulayan Staff') {
    return res.status(403).json({ message: 'Access restricted to Gulayan Staff interface only.' });
  }
  next();
};

module.exports = { authorizeGulayanStaff };