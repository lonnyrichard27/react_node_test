const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus
} = require('../controller/taskController');

const router = express.Router();

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
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ 
      success: false, 
      message: "Invalid token." 
    });
  }
};

// Apply authentication middleware to all routes
router.use(protect);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTaskStatus);
router.delete('/:id', deleteTask);

module.exports = router;