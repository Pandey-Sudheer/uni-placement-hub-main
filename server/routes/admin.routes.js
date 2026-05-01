const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');

// Middleware to verify TPO role
const isTPO = (req, res, next) => {
    if (req.user.role !== 'tpo') return res.status(403).json({ msg: 'Access denied: TPO only' });
    next();
};

// GET /api/admin/students
router.get('/students', [auth, isTPO], async (req, res) => {
    try {
        const students = await StudentProfile.find().populate('userId', 'email').sort({ createdAt: -1 });
        const apps = await Application.find();
        
        const studentsWithStatus = students.map(s => {
            const studentApps = apps.filter(a => a.studentProfile.toString() === s._id.toString());
            let status = "Unplaced";
            if (studentApps.some(a => a.status === "Offered")) status = "Placed";
            else if (studentApps.some(a => a.status === "Shortlisted" || a.status === "Interviewing")) status = "Shortlisted";
            
            return { 
                ...s.toObject(), 
                status, 
                id: s._id,
                email: s.userId ? s.userId.email : "No Email"
            };
        });
        res.json(studentsWithStatus);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// GET /api/admin/drives
router.get('/drives', [auth, isTPO], async (req, res) => {
    try {
        const drives = await Drive.find().sort({ createdAt: -1 });
        res.json(drives);
    } catch (err) {
         res.status(500).send('Server Error');
    }
});

// POST /api/admin/drives
router.post('/drives', [auth, isTPO], async (req, res) => {
    try {
        const newDrive = new Drive(req.body);
        const drive = await newDrive.save();
        res.json(drive);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/admin/drives/:id
router.put('/drives/:id', [auth, isTPO], async (req, res) => {
    try {
        const drive = await Drive.findByIdAndUpdate(
            req.params.id,
            { $set: req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!drive) return res.status(404).json({ msg: 'Drive not found' });
        res.json(drive);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/admin/drives/:id
router.delete('/drives/:id', [auth, isTPO], async (req, res) => {
    try {
        const drive = await Drive.findById(req.params.id);
        if (!drive) return res.status(404).json({ msg: 'Drive not found' });

        await drive.deleteOne();
        
        // Also delete all applications tied to this drive
        await Application.deleteMany({ drive: req.params.id });

        res.json({ msg: 'Drive and associated applications removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/admin/applications (Kanban Board Data)
router.get('/applications', [auth, isTPO], async (req, res) => {
    try {
        // Fetch all applications and populate student and drive info
        const applications = await Application.find()
            .populate('studentProfile', 'name department cgpa backlogs skills resumeUrl')
            .populate('drive', 'company role minCgpa requiredSkills');
        
        // Calculate AI Match Score for each application
        const appsWithScore = applications.map(app => {
            const appObj = app.toObject();
            let matchScore = 0;
            const profile = appObj.studentProfile;
            const drive = appObj.drive;

            if (profile && drive) {
                let baseScore = 30; // base score for simply applying
                
                // 1. Skill Overlap (up to 50 points)
                let skillScore = 0;
                if (drive.requiredSkills && drive.requiredSkills.length > 0 && profile.skills && profile.skills.length > 0) {
                    const studentSkillsLower = profile.skills.map(s => s.toLowerCase());
                    const requiredSkillsLower = drive.requiredSkills.map(s => s.toLowerCase());
                    const matchCount = requiredSkillsLower.filter(reqSkill => 
                        studentSkillsLower.some(stuSkill => stuSkill.includes(reqSkill) || reqSkill.includes(stuSkill))
                    ).length;
                    
                    skillScore = Math.round((matchCount / requiredSkillsLower.length) * 50);
                } else if (!drive.requiredSkills || drive.requiredSkills.length === 0) {
                    skillScore = 50; // free points if drive has no specific skills
                }

                // 2. CGPA Bonus (up to 20 points)
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

// PUT /api/admin/applications/:id/status
router.put('/applications/:id/status', [auth, isTPO], async (req, res) => {
    try {
        const { status } = req.body;
        const app = await Application.findById(req.params.id)
            .populate('studentProfile')
            .populate('drive', 'company role');
        
        if (!app) return res.status(404).json({ msg: 'Application not found' });
        
        app.status = status;
        await app.save();

        // Create a Notification for the student
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
