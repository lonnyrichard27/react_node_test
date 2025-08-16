const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { logUserLogin, logUserLogout } = require("../services/loggingService");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({ fullName, email, password: hashedPassword, role: role || "user" });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        logUserLogin(user, token, req)
        res.json({ 
            message: "Login successful", 
            token, 
            role: user.role,
            userId: user._id,
            fullName: user.fullName
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// Logout Route
router.post("/logout", protect, async (req, res) => {
    try {
        const { userId } = req.user;
        const token = req.token;
        logUserLogout(userId, token, req)
        res.json({ 
            success: true,
            message: "Logged out successfully" 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false,
            message: "Server error during logout" 
        });
    }
});

module.exports = router;