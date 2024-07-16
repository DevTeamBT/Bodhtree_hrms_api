const mongoose = require('mongoose');

const taskCommentsSchema = new mongoose.Schema({
    // pId:{type: mongoose.Schema.Types.String, ref:'Project'},
    tId:{type: mongoose.Schema.Types.String, ref:'Task'},
    tcDesc: { type: String, required: true},
    tcCreatedOn: { type: Date, default: Date.now},
    tcAssignedTo: { type: mongoose.Schema.Types.String, ref: 'User'},
});

const taskComments = mongoose.model('taskComments', taskCommentsSchema);

module.exports = taskComments;