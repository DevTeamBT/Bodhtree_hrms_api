const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');


const attendenceController = require('../../Controller/login/attendenceController');

const signIn = attendenceController.signIn;
const signOut= attendenceController.signOut
const getAttendences = attendenceController.getAttendences;
// const getAttendenceByDate = attendenceController.getAttendenceByDate;
// const editAttendence = attendenceController.editAttendence;
// const deleteAttendence = attendenceController.deleteAttendence;
const applyLeave = attendenceController.applyLeave;
const addLeaves = attendenceController.addLeaves;
const getAllLeaves = attendenceController.getAllLeaves;


router.post('/add/signIn', signIn);
router.post('/add/signOut', signOut);
router.post('/apply/leave', applyLeave);
router.get('/emp/attendence', getAttendences);
router.post('/add/leaves', authMiddleware, addLeaves);
router.get('/allEmp/leaves', getAllLeaves);

module.exports = router;