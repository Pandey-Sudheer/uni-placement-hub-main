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
        const students = await StudentProfile.find().sort({ createdAt: -1 });
        const apps = await Application.find();
        
        const studentsWithStatus = students.map(s => {
            const studentApps = apps.filter(a => a.studentProfile.toString() === s._id.toString());
            let status = "Unplaced";
            if (studentApps.some(a => a.status === "Offered")) status = "Placed";
            else if (studentApps.some(a => a.status === "Shortlisted" || a.status === "Interviewing")) status = "Shortlisted";
            return { ...s.toObject(), status, id: s._id };
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

// GET /api/admin/applications (Kanban Board Data)
router.get('/applications', [auth, isTPO], async (req, res) => {
    try {
        // Fetch all applications and populate student and drive info
        const applications = await Application.find()
            .populate('studentProfile', 'name department cgpa backlogs skills resumeUrl')
            .populate('drive', 'company role');
        
        res.json(applications);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// PUT /api/admin/applications/:id/status
router.put('/applications/:id/status', [auth, isTPO], async (req, res) => {
    try {
        const { status } = req.body;
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ msg: 'Application not found' });
        
        app.status = status;
        await app.save();
        res.json(app);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
