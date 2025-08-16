require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require("body-parser");
const authRoutes = require('./routes/authRoutes');
const forgotPassRoutes = require("./routes/forgetPasswordRoute");
const adminRoutes = require("./routes/admindash");
const adminRoute = require("./routes/adminRoute");
const userLogRoutes = require('./routes/userLogRoutes')
const taskRoutes = require("./routes/task");

const app = express();

// Trust proxy to get real IP addresses
app.set('trust proxy', true);

// Enhanced CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Handle CORS preflight requests
app.options('*', cors(corsOptions));

// Logging middleware (place early to log all requests)
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use("/api", forgotPassRoutes);
app.use("/admin", adminRoutes);
app.use("/admin", adminRoute);
app.use("/api/tasks", taskRoutes);
app.use('/admin/logs', userLogRoutes); 

// Basic route
app.get("/", (req, res) => {
  res.send("hello worldji!!")
});

// Server setup
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error(" MONGO_URI is not defined. Check your .env file!");
  process.exit(1);
}

// Start server
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log(" Connected to MongoDB!"))
  .catch(err => console.error(" Database connection failed:", err));
  