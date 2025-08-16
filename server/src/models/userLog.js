const mongoose = require('mongoose');

const UserLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    required: true
  },
  action: {
    type: String,
    enum: ["login", "logout"],
    required: true
  },
  loginTime: {
    type: Date,
    required: function() { return this.action === 'login'; }
  },
  logoutTime: {
    type: Date,
    required: function() { return this.action === 'logout'; }
  },
  tokenId: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: false,
    default: 'Unknown'
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('UserLog', UserLogSchema);