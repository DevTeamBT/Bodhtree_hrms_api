const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    // pId:{type: mongoose.Schema.Types.String, ref:'Project'},
    tTitle: {type: String,required: true},
    tDesc: { type: String, required: true},
    tStatus: { type: String, enum: ["pending", "working", "onhold", "completed"], default: "pending"},
    priority: {type: String, enum:["low", "medium", "high"],require:true},
    tCreatedOn: { type: Date, default: Date.now},
    tUpdateOn: {type: Date, default: Date.now},
    tAssignedTo: [{ type: mongoose.Schema.Types.String, ref: 'User' }],
    active: { type: Boolean, default: true }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;