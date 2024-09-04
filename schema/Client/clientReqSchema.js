const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    firstName: {type:"string"},
    lastName: {type:"string"},
    jobTitle: {type:"string"},
    department: {type:"string"},
    country: {type: mongoose.Schema.Types.String, ref:'Company'},
    state: {type: mongoose.Schema.Types.String, ref:'Company'},
    city: {type: mongoose.Schema.Types.String, ref:'Company'},
    email: {type:"string"},
    mobile: {type:"string"},
    linkedIn: {type:"string"},
    selectSource: {type:"string"},
    selectClient: {type:"string"},
    selectContact: {type:"string"},
    title: {type:"string"},
    priority: {type:"string"},
    skillSet: {type:"string"},
    mustHave: {type:"string"},
    goodToHave: {type:"string"},
    rangeMin: {type:"string"},
    rangeMax: {type:"string"},
    budgetMin: {type:"string"},
    budgetMax: {type:"string"},
    noOfPositions: {type:"string"},
    location: {type:"string"},
    hireType: {type:"string"},
    workType: {type:"string"},
    recruiter: {type:"string"},
    accManager: {type:"string"}
});

const ClientReq = mongoose.model('ClientReq', clientSchema);

module.exports = ClientReq;