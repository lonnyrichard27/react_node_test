const Task = require('../models/Task');

// Get all tasks for a user
const getTasks = async (req, res) => {
  try {
    const { status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;
    const userId = req.user.userId;

    const filter = { userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const tasks = await Task.find(filter).sort(sortObj);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.user.userId;

    if (!title || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and due date are required'
      });
    }

    const task = new Task({
      title,
      description,
      status: status || 'incomplete',
      priority: priority || 'medium',
      dueDate,
      userId
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.user.userId;

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await Task.findOneAndDelete({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    });
  }
};

// Toggle task status (complete/incomplete)
const toggleTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.status = task.status === 'complete' ? 'incomplete' : 'complete';
    await task.save();

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Toggle task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task status'
    });
  }
};


module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
};