const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Drive = require('../models/Drive');
const Application = require('../models/Application');

// Middleware to verify Recruiter role
const isRecruiter = (req, res, next) => {
    if (req.user.role !== 'recruiter') return res.status(403).json({ msg: 'Access denied: Recruiter only' });
    next();
};

// GET /api/recruiter/drives
router.get('/drives', [auth, isRecruiter], async (req, res) => {
    try {
        const drives = await Drive.find({ recruiterId: req.user.id }).sort({ createdAt: -1 });
        res.json(drives);
    } catch (err) {
         res.status(500).send('Server Error');
    }
});

// POST /api/recruiter/drives
router.post('/drives', [auth, isRecruiter], async (req, res) => {
    try {
        const newDrive = new Drive({
            ...req.body,
            recruiterId: req.user.id
        });
        const drive = await newDrive.save();
        res.json(drive);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/recruiter/applications
// Only fetch applications attached to drives owned by this recruiter
router.get('/applications', [auth, isRecruiter], async (req, res) => {
    try {
        // Find all drives posted by this recruiter
        const myDrives = await Drive.find({ recruiterId: req.user.id }).select('_id');
        const myDriveIds = myDrives.map(d => d._id);

        // Fetch applications for those specific drives
        const applications = await Application.find({ drive: { $in: myDriveIds } })
            .populate('studentProfile', 'name department cgpa backlogs skills resumeUrl')
            .populate('drive', 'company role minCgpa requiredSkills');
        
        // Calculate AI Match Score 
        const appsWithScore = applications.map(app => {
            const appObj = app.toObject();
            let matchScore = 0;
            const profile = appObj.studentProfile;
            const drive = appObj.drive;

            if (profile && drive) {
                let baseScore = 30; 
                let skillScore = 0;
                if (drive.requiredSkills && drive.requiredSkills.length > 0 && profile.skills && profile.skills.length > 0) {
                    const studentSkillsLower = profile.skills.map(s => s.toLowerCase());
                    const requiredSkillsLower = drive.requiredSkills.map(s => s.toLowerCase());
                    const matchCount = requiredSkillsLower.filter(reqSkill => 
                        studentSkillsLower.some(stuSkill => stuSkill.includes(reqSkill) || reqSkill.includes(stuSkill))
                    ).length;
                    skillScore = Math.round((matchCount / requiredSkillsLower.length) * 50);
                } else if (!drive.requiredSkills || drive.requiredSkills.length === 0) {
                    skillScore = 50; 
                }

                let cgpaScore = 0;
                if (profile.cgpa) {
                    const minCgpa = drive.minCgpa || 6.0;
                    if (profile.cgpa >= minCgpa) {
                        cgpaScore = Math.min(((profile.cgpa - minCgpa) / (10 - minCgpa)) * 20, 20);
                    }
                }
                matchScore = Math.min(Math.round(baseScore + skillScore + cgpaScore), 100);
            }
            appObj.matchScore = matchScore;
            return appObj;
        });

        res.json(appsWithScore);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// PUT /api/recruiter/applications/:id/status
router.put('/applications/:id/status', [auth, isRecruiter], async (req, res) => {
    try {
        const { status } = req.body;
        // Verify this application belongs to a drive owned by the recruiter
        const app = await Application.findById(req.params.id)
            .populate('drive', 'recruiterId company role')
            .populate('studentProfile');
            
        if (!app) return res.status(404).json({ msg: 'Application not found' });
        
        // Security Check
        if (app.drive.recruiterId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to update this pipeline' });
        }
        
        app.status = status;
        await app.save();

        const Notification = require('../models/Notification');
        let notifType = 'info';
        if (status === 'Offered') notifType = 'success';
        else if (status === 'Shortlisted' || status === 'Interviewing') notifType = 'warning';

        const newNotification = new Notification({
            user: app.studentProfile.userId,
            title: `Application Update: ${app.drive.company}`,
            message: `Your application for ${app.drive.role} at ${app.drive.company} has been marked as ${status}.`,
            type: notifType
        });
        await newNotification.save();

        res.json(app);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
