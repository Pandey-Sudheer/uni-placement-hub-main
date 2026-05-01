const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: "" },
  department: { type: String, default: "Engineering" },
  cgpa: { type: Number, default: 0 },
  tenthMarks: { type: Number },
  twelfthMarks: { type: Number },
  backlogs: { type: Number, default: 0 },
  skills: [{ type: String }],
  resumeUrl: { type: String, default: "" },
  resumeName: { type: String, default: "" },
  graduationYear: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
