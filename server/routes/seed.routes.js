const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');

router.post('/', async (req, res) => {
  try {
    // Clear existing
    await User.deleteMany();
    await StudentProfile.deleteMany();
    await Drive.deleteMany();
    await Application.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Create Admin
    const tpoUser = new User({ email: 'admin@uni.edu', password, role: 'tpo' });
    await tpoUser.save();

    // Create Student
    const studentUser = new User({ email: 'student@uni.edu', password, role: 'student' });
    await studentUser.save();

    const profile = new StudentProfile({
      userId: studentUser._id,
      name: "Aaditya Roy",
      department: "Computer Science",
      cgpa: 8.9,
      backlogs: 0,
      skills: ["React", "Node.js", "MongoDB"],
      graduationYear: 2026
    });
    await profile.save();
    
    // Seed some mock drives
    const drive1 = new Drive({
        company: "Google", role: "Software Engineer", description: "Campus hiring for SWE 2026",
        package: "32 LPA", location: "Bangalore", date: "Aug 15, 2026", minCgpa: 8.5, maxBacklogs: 0,
        requiredSkills: ["C++", "DSA"], status: "Upcoming"
    });
    const drive2 = new Drive({
        company: "Atlassian", role: "Frontend Dev", description: "React heavy engineering team.",
        package: "28 LPA", location: "Remote", date: "Sep 01, 2026", minCgpa: 8.0, maxBacklogs: 1,
        requiredSkills: ["React", "Javascript"], status: "Ongoing"
    });
    const drive3 = new Drive({
        company: "Microsoft", role: "Cloud Solutions Architect", description: "Azure ecosystem development.",
        package: "40 LPA", location: "Hyderabad", date: "Oct 10, 2026", minCgpa: 9.0, maxBacklogs: 0,
        requiredSkills: ["System Design", "Cloud", "Azure"], status: "Upcoming"
    });
    const drive4 = new Drive({
        company: "Amazon", role: "SDE 1", description: "AWS Core Infrastructure Team.",
        package: "24 LPA", location: "Bangalore", date: "Nov 05, 2026", minCgpa: 7.5, maxBacklogs: 2,
        requiredSkills: ["Java", "AWS", "DSA"], status: "Upcoming"
    });
    const drive5 = new Drive({
        company: "TCS Digital", role: "Systems Engineer", description: "Mass digital hiring for freshers.",
        package: "7.5 LPA", location: "Pan India", date: "Jul 20, 2026", minCgpa: 6.5, maxBacklogs: 4,
        requiredSkills: ["C", "Java", "SQL"], status: "Ongoing"
    });
    const drive6 = new Drive({
        company: "Deloitte", role: "Risk Analyst", description: "Tech risk & consulting.",
        package: "12 LPA", location: "Gurugram", date: "Oct 01, 2026", minCgpa: 7.0, maxBacklogs: 1,
        requiredSkills: ["Python", "Data Analysis"], status: "Upcoming"
    });

    await Drive.insertMany([drive1, drive2, drive3, drive4, drive5, drive6]);

    res.json({ msg: 'Database Seeded!', student: 'student@uni.edu', admin: 'admin@uni.edu', password: 'password123' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
