const mongoose = require('mongoose');

const department = mongoose.Schema({
    department: {type: String, required: true},
})


const empDepartment = mongoose.model('empDepartment', department);
module.exports = empDepartment;