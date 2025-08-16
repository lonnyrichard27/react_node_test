// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const bcrypt = require('bcryptjs');

// Create new admin (only existing admins can create new admins)
router.post('/create-admin', protect, adminOnly, async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin user
        const newAdmin = new User({
            fullName,
            email,
            password: hashedPassword,
            role: "admin"
        });

        await newAdmin.save();

        res.status(201).json({ 
            message: "Admin created successfully",
            admin: {
                id: newAdmin._id,
                fullName: newAdmin.fullName,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });

    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all admins
router.get('/admins', protect, adminOnly, async (req, res) => {
    try {
        const admins = await User.find({ role: "admin" }).select('-password');
        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// Admin dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalAdmins = await User.countDocuments({ role: "admin" });
        
        res.json({
            totalUsers,
            totalAdmins,
            totalAllUsers: totalUsers + totalAdmins
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all users (protected, admin only)
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); 
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user by email (protected, admin only)
router.delete("/users/:email", protect, adminOnly, async (req, res) => {
  try {
    const { email } = req.params;

    const result = await User.deleteOne({ email });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Update user by email (protected, admin only)
router.put("/users/:email", protect, adminOnly, async (req, res) => {
  try {
    const { email } = req.params;
    const { fullName, role } = req.body;
    
    console.log("Received Update:", { fullName, role });

    const user = await User.findOneAndUpdate(
      { email },
      { fullName, role },
      { new: true } // Ensure it returns updated data
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

module.exports = router;