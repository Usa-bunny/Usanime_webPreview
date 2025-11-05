// middleware/checkRole.js
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    const userRole = req.session.user.role;
    if (roles.includes(userRole)) {
      next();
    } else {
      res.status(403).send('Akses ditolak: Anda tidak memiliki izin.');
    }
  };
};

module.exports = checkRole;
