const mongoose = require('mongoose');

const taskCommentsSchema = new mongoose.Schema({
    // pId:{type: mongoose.Schema.Types.String, ref:'Project'},
    tId:{type: mongoose.Schema.Types.String, ref:'Task'},
    tDesc:{type: mongoose.Schema.Types.String, ref:'Task'},
    tComments: { type: String, required: true},
    tcCreatedOn: { type: Date, default: Date.now},
    tcAssignedTo: { type: mongoose.Schema.Types.String, ref: 'User'},
    duration:{ type: Number }
});

const taskComments = mongoose.model('taskComments', taskCommentsSchema);

module.exports = taskComments;