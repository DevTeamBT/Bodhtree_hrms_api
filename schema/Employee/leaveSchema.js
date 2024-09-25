const mongoose = require('mongoose');

// Define the Leave schema
const leaveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: { type: String, enum: ['annualLeave', 'casualLeave', 'sickLeave','maternityLeave','paternity leave'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedDate: { type: Date, default: Date.now },
    reason: {type:String}
});

module.exports = mongoose.model('Leave', leaveSchema);
