const mongoose = require('mongoose');

const role = mongoose.Schema({
    roleName: {type: String},
})


const empRole = mongoose.model('empRole', role);
module.exports = empRole;