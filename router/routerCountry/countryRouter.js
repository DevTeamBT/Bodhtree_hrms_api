const express = require('express');
const router = express.Router();




const countryController = require('../../Controller/Country/countryController');
const createCountry = countryController.createCountry;
const getCountry = countryController.getCountry;
const getState = countryController.getState;
const getCountries = countryController.getCountries;


router.post('/country',createCountry);
router.get('/country/:id', getCountry);
router.get('/states/:stateId', getState);
router.get('/countries', getCountries);


module.exports = router;
