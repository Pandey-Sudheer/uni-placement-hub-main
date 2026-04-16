const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudentProfile = require('../models/StudentProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');

// GET /api/student/profile
router.get('/profile', auth, async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) return res.status(404).json({ msg: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/student/profile
router.put('/profile', auth, async (req, res) => {
    try {
        let profile = await StudentProfile.findOneAndUpdate(
            { userId: req.user.id },
            { $set: req.body, updatedAt: Date.now() },
            { new: true }
        );
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/student/drives
// Fetch all ongoing/upcoming drives that student hasn't applied to (or fetch all and mark status)
router.get('/drives', auth, async (req, res) => {
    try {
        const drives = await Drive.find().sort({ createdAt: -1 });
        
        // Find what the student applied to
        const profile = await StudentProfile.findOne({ userId: req.user.id });
        if(!profile) return res.json({ drives, applications: [] });

        const applications = await Application.find({ studentProfile: profile._id });
        const appliedDriveIds = applications.map(app => app.drive.toString());
        
        // Return drives but attach a boolean if applied
        const drivesWithStatus = drives.map(drive => ({
            ...drive.toObject(),
            hasApplied: appliedDriveIds.includes(drive._id.toString())
        }));

        res.json(drivesWithStatus);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/student/apply/:driveId
router.post('/apply/:driveId', auth, async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) return res.status(400).json({ msg: 'Please complete your profile first' });

        const newApplication = new Application({
            studentProfile: profile._id,
            drive: req.params.driveId,
            status: 'Applied'
        });

        await newApplication.save();
        res.json(newApplication);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) return res.status(400).json({ msg: 'Already applied' });
        res.status(500).send('Server Error');
    }
});

module.exports = router;
