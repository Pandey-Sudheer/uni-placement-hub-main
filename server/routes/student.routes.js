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

// POST /api/student/resume
const upload = require('../middleware/upload');
router.post('/resume', [auth, upload.single('resume')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        
        // The URL path to fetch the file (served statically)
        const resumeUrl = `/uploads/resumes/${req.file.filename}`;
        
        // Update StudentProfile
        const profile = await StudentProfile.findOneAndUpdate(
            { userId: req.user.id },
            { 
                resumeUrl: resumeUrl, 
                resumeName: req.file.originalname,
                updatedAt: Date.now() 
            },
            { new: true }
        );

        if (!profile) return res.status(404).json({ msg: 'Profile not found' });
        
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

// GET /api/student/applications
router.get('/applications', auth, async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) return res.status(404).json({ msg: 'Profile not found' });

        const applications = await Application.find({ studentProfile: profile._id })
            .populate('drive')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/student/notifications
router.get('/notifications', auth, async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/student/notifications/:id/read
router.put('/notifications/:id/read', auth, async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { new: true }
        );
        res.json(notification);
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

        // Profile Completeness Check removed per user request

        const drive = await Drive.findById(req.params.driveId);
        if (!drive) return res.status(404).json({ msg: 'Drive not found' });

        // Backend Eligibility Check
        if (profile.cgpa < drive.minCgpa) {
            return res.status(400).json({ msg: `Ineligible: Requires a minimum CGPA of ${drive.minCgpa}` });
        }
        if (profile.backlogs > drive.maxBacklogs) {
            return res.status(400).json({ msg: `Ineligible: Allows a maximum of ${drive.maxBacklogs} active backlogs` });
        }

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
