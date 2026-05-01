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
      name: "Sudheer Pandey",
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

    const drive7 = new Drive({
        company: "Apple", role: "Hardware Engineer", description: "Silicon design and validation.",
        package: "38 LPA", location: "Bangalore", date: "Jan 12, 2027", minCgpa: 8.5, maxBacklogs: 0,
        requiredSkills: ["Verilog", "C", "Hardware"], status: "Upcoming"
    });
    const drive8 = new Drive({
        company: "Meta", role: "Product Manager", description: "Driving strategy for Facebook app family.",
        package: "35 LPA", location: "Remote", date: "Feb 05, 2027", minCgpa: 8.0, maxBacklogs: 0,
        requiredSkills: ["Product Strategy", "Data Analysis", "Communication"], status: "Upcoming"
    });
    const drive9 = new Drive({
        company: "Netflix", role: "Backend Engineer", description: "High availability streaming architecture.",
        package: "45 LPA", location: "Remote", date: "Mar 15, 2027", minCgpa: 9.0, maxBacklogs: 0,
        requiredSkills: ["Node.js", "Microservices", "System Design"], status: "Upcoming"
    });
    const drive10 = new Drive({
        company: "IBM", role: "Data Scientist", description: "AI & ML Enterprise Solutions.",
        package: "18 LPA", location: "Pune", date: "Nov 20, 2026", minCgpa: 8.0, maxBacklogs: 1,
        requiredSkills: ["Python", "TensorFlow", "SQL"], status: "Ongoing"
    });
    const drive11 = new Drive({
        company: "Oracle", role: "Database Administrator", description: "Oracle Cloud Infrastructure.",
        package: "20 LPA", location: "Hyderabad", date: "Dec 01, 2026", minCgpa: 7.5, maxBacklogs: 1,
        requiredSkills: ["SQL", "Oracle DB", "Linux"], status: "Upcoming"
    });
    const drive12 = new Drive({
        company: "Cisco", role: "Network Engineer", description: "Enterprise Networking.",
        package: "16 LPA", location: "Bangalore", date: "Jan 25, 2027", minCgpa: 7.0, maxBacklogs: 2,
        requiredSkills: ["Networking", "CCNA", "Python"], status: "Upcoming"
    });
    const drive13 = new Drive({
        company: "Goldman Sachs", role: "Quantitative Analyst", description: "Risk and pricing models.",
        package: "30 LPA", location: "Bangalore", date: "Oct 25, 2026", minCgpa: 8.0, maxBacklogs: 0,
        requiredSkills: ["C++", "Mathematics", "Python"], status: "Upcoming"
    });
    const drive14 = new Drive({
        company: "JP Morgan", role: "Tech Analyst", description: "Global technology infrastructure.",
        package: "22 LPA", location: "Mumbai", date: "Nov 30, 2026", minCgpa: 7.5, maxBacklogs: 0,
        requiredSkills: ["Java", "Spring Boot", "SQL"], status: "Upcoming"
    });
    const drive15 = new Drive({
        company: "Adobe", role: "UI/UX Designer", description: "Creative Cloud UX Team.",
        package: "25 LPA", location: "Noida", date: "Feb 14, 2027", minCgpa: 7.0, maxBacklogs: 0,
        requiredSkills: ["Figma", "Design Thinking", "React"], status: "Upcoming"
    });
    const drive16 = new Drive({
        company: "Salesforce", role: "Solutions Engineer", description: "CRM technical sales and integration.",
        package: "26 LPA", location: "Hyderabad", date: "Jan 10, 2027", minCgpa: 8.0, maxBacklogs: 1,
        requiredSkills: ["Java", "CRM", "Communication"], status: "Ongoing"
    });
    const drive17 = new Drive({
        company: "Uber", role: "Operations Intern", description: "Mobility operations scaling.",
        package: "10 LPA", location: "Gurugram", date: "Mar 01, 2027", minCgpa: 6.5, maxBacklogs: 3,
        requiredSkills: ["Data Analysis", "SQL", "Excel"], status: "Upcoming"
    });

    await Drive.insertMany([drive1, drive2, drive3, drive4, drive5, drive6, drive7, drive8, drive9, drive10, drive11, drive12, drive13, drive14, drive15, drive16, drive17]);

    res.json({ msg: 'Database Seeded!', student: 'student@uni.edu', admin: 'admin@uni.edu', password: 'password123' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
