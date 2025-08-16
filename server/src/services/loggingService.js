const UserLog = require('../models/UserLog');
const crypto = require('crypto');
const os = require('os');

// Helper function to get client IP address
const getClientIP = (req) => {
  // Check various headers and properties for the real IP address
  let ip = req.ip || 
           req.headers['x-real-ip'] ||
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.connection?.remoteAddress ||
           req.connection?.socket?.remoteAddress ||
           'Unknown';
  
  // Handle IPv6 loopback addresses
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    const networkInterfaces = os.networkInterfaces();
    
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ip = iface.address;
          break;
        }
      }
      if (ip !== '::1' && ip !== '::ffff:127.0.0.1') break;
    }
  }
  
  ip = ip.replace(/^::ffff:/, '');
  
  return ip;
};

// Helper function to get token identifier
const getTokenId = (token) => {
  if (!token) return crypto.randomBytes(8).toString('hex');
  return token.slice(-8); 
};

// Create login log entry
const logUserLogin = async (user, token, req) => {
  try {
    const userLog = new UserLog({
      userId: user._id,
      userName: user.fullName,
      userEmail: user.email,
      role: user.role,
      action: 'login',
      loginTime: new Date(),
      tokenId: getTokenId(token),
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown'
    });

    await userLog.save();
    return userLog;
  } catch (error) {
    return null;
  }
};

// Create logout log entry and update session duration
const logUserLogout = async (userId, token, req) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return null;
    }

    const tokenId = getTokenId(token);
    
    // Find the corresponding login log to calculate session duratio
    const loginLog = await UserLog.findOne({
      userId: userId,
      tokenId: tokenId,
      action: 'login'
    }).sort({ createdAt: -1 }).limit(1);

    // Calculate session duration if login log exists
    let sessionDuration = null;
    if (loginLog && loginLog.loginTime) {
      const sessionDurationMs = new Date() - loginLog.loginTime;
      sessionDuration = Math.round(sessionDurationMs / (1000 * 60)); // Convert to minutes
    }

    // Create logout log
    const userLog = new UserLog({
      userId: user._id,
      userName: user.fullName,
      userEmail: user.email,
      role: user.role,
      action: 'logout',
      logoutTime: new Date(),
      tokenId: tokenId,
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      sessionDuration: sessionDuration
    });

    await userLog.save();
    return userLog;
  } catch (error) {
    return null;
  }
};


module.exports = {
  logUserLogin,
  logUserLogout
};