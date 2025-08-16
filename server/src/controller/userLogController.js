const UserLog = require('../models/UserLog');

// Get all user logs with filtering and pagination
const getAllUserLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const filter = {};

    const logs = await UserLog.find(filter)
      .sort({ createdAt: -1 }) 
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await UserLog.countDocuments(filter);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalLogs: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user logs'
    });
  }
};


// Delete a specific user log
const deleteUserLog = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLog = await UserLog.findByIdAndDelete(id);

    if (!deletedLog) {
      return res.status(404).json({
        success: false,
        message: 'User log not found'
      });
    }

    res.json({
      success: true,
      message: 'User log deleted successfully'
    });
  } catch (error) {
    console.error('Delete user log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user log'
    });
  }
};

module.exports = {
  getAllUserLogs,
  deleteUserLog
};