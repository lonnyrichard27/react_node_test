// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// // General Authentication Middleware
// const protect = (req, res, next) => {
//     const token = req.header("Authorization");
//     if (!token) return res.status(401).json({ message: "Unauthorized access" });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: "Invalid token" });
//     }
// };

// // Admin Authorization Middleware
// const adminOnly = (req, res, next) => {
//     if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
//     next();
// };

// module.exports = { protect, adminOnly };

const jwt = require('jsonwebtoken');
require('dotenv').config();

// General Authentication Middleware
const protect = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Access denied. No token provided." 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Add token to request for logging purposes
    req.token = token;
    req.tokenId = decoded.tokenId || 'unknown';
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid token." 
    });
  }
};

// Admin Authorization Middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required." 
    });
  }

  next();
};

// Optional: User or Admin middleware
const userOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required." 
    });
  }

  if (req.user.role !== "user" && req.user.role !== "admin") {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Invalid user role." 
    });
  }
  
  next();
};

module.exports = { protect, adminOnly, userOrAdmin };