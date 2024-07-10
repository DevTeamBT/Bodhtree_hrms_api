// routes/index.js
const express = require('express');
const router = express.Router();

router.use('/auth', require('../routerLogin/userRoute')); 
module.exports = router;
