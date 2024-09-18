const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // date: { type: Date, default: Date.now, required: true },
    date: {type: Date, default: Date.now},
    signInTime: { type: Date, default: Date.now },
    signOutTime: { type: Date},
    status: { type: String, enum: ['inOffice', 'inClientLocation', 'workFromHome'], required: true }
});

// Create the Attendance model
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
