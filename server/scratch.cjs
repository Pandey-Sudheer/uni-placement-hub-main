const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Application = require('./models/Application');
const StudentProfile = require('./models/StudentProfile');
const Drive = require('./models/Drive');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const apps = await Application.find()
        .populate('studentProfile')
        .populate('drive');
    console.log("Current Applications:", JSON.stringify(apps, null, 2));
    
    // Also log profiles and drives count for context
    const profiles = await StudentProfile.countDocuments();
    const drives = await Drive.countDocuments();
    console.log(`Totals -> Profiles: ${profiles}, Drives: ${drives}`);
    
    process.exit(0);
}).catch(console.error);
