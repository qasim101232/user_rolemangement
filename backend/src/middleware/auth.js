const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false,
        message: 'Token has expired' 
      });
    }
    return res.status(403).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// Middleware to authorize specific roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    // Check if user has any of the allowed roles
    const userRoles = req.user.roles || [];
    const hasRole = userRoles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ 
        success: false,
        message: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`,
        your_roles: userRoles
      });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };