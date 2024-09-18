const mongoose = require('mongoose');
const moment = require('moment-timezone');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: {type: Date, required: true, default: moment().tz('Asia/Kolkata').toDate()},
      signInTime: { type: Date, default: null }, 
      signOutTime: { type: Date, default: null } ,
    status: { type: String, enum: ['inOffice', 'inClientLocation', 'workFromHome'], required: true }
});

// Create the Attendance model
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
