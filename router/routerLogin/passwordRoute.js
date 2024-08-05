const express = require('express');
const router = express.Router();

const passwordController = require('../../Controller/login/passwordController');


const forgotPassword = passwordController.forgotPassword;
const resetPassword = passwordController.resetPassword;
router.post('/forgot-password',forgotPassword);
router.post('/reset-password/:token',resetPassword);

module.exports = router;