const express = require('express');
const router = express.Router();




const companyReqController = require('../../Controller/Client/clientReqController');
const createCompanyReq = companyReqController.createCompanyReq;
const getCompanyReq = companyReqController.getCompanyReq;
const getCompaniesReq = companyReqController.getCompaniesReq;


router.post('/company/req',createCompanyReq);
router.get('/company/req/:id',getCompanyReq);
router.get('/companies/req',getCompaniesReq);



module.exports = router;
