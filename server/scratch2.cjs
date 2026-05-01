const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const StudentProfile = require('./models/StudentProfile');
const Application = require('./models/Application');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
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
                email: s.userId && s.userId.email ? s.userId.email : "No Email"
            };
        });
        console.log("Students Response JSON:");
        console.log(JSON.stringify(studentsWithStatus, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
