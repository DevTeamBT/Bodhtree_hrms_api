const express = require('express');
const router = express.Router();




const companyController = require('../../Controller/Client/clientController');
const createCompany = companyController.createCompany;
const getCompany = companyController.getCompany;
const getCompanies = companyController.getCompanies;


router.post('/company',createCompany);
router.get('/company/:id', getCompany);
router.get('/companies',getCompanies);



module.exports = router;
