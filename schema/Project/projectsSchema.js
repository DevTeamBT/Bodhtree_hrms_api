const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    pTitle: {type: String,required: true},
    pDesc: { type: String, required: true},
    pStatus: { type: String, enum: ["pending", "working", "onhold", "completed"], default: "pending"},
    pCreatedOn: { type: Date, default: Date.now},
    pCreatedBy: { type: mongoose.Schema.Types.String, ref: 'User'},
    pUpdatedOn: { type: Date, default: Date.now },
    pUpdatedBy: { type: mongoose.Schema.Types.String, ref: 'User'}
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
