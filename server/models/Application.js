const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  studentProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
  status: { type: String, enum: ['Applied', 'Shortlisted', 'Interviewing', 'Offered'], default: 'Applied' },
  appliedAt: { type: Date, default: Date.now }
});

ApplicationSchema.index({ studentProfile: 1, drive: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
