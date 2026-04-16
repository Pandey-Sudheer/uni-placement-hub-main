const mongoose = require('mongoose');

const DriveSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String },
  package: { type: String }, 
  location: { type: String },
  date: { type: String },
  minCgpa: { type: Number, default: 0 },
  maxBacklogs: { type: Number, default: 10 },
  requiredSkills: [{ type: String }],
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Drive', DriveSchema);
