require('dotenv').config();
const mongoose = require('mongoose');
const StudentProfile = require('./models/StudentProfile');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await StudentProfile.updateMany({}, { $set: { name: 'Sudheer Pandey' } });
    console.log('Successfully updated name in database!');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
