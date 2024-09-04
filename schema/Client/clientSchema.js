const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyName: {type:"string"},
    url: {type:"string"},
    address1: {type:"string"},
    address2: {type:"string"},
    country: {type: mongoose.Schema.Types.String, ref:'Country'},
    state: {type: mongoose.Schema.Types.String, ref:'Country'},
    city: {type: mongoose.Schema.Types.String, ref:'Country'},
    zip: {type:"string"},
    industry: {type:"string"},
    companySize: {type:"string"},
    linkedIn: {type:"string"},
    networth: {type:"string"}
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;