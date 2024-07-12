const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    pId:{type: mongoose.Schema.Types.String, ref:'Project'},
    tTitle: {type: String,required: true},
    tDesc: { type: String, required: true},
    tStatus: { type: String, enum: ["pending", "working", "onhold", "completed"], default: "pending"},
    tCreatedOn: { type: Date, default: Date.now},
    tAssignedTo: [{ type: mongoose.Schema.Types.String, ref: 'User' }],
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;