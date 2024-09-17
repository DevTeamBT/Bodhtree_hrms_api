const express = require('express');
const router = express.Router();


const attendenceController = require('../../Controller/login/attendenceController');

const signIn = attendenceController.signIn;
const signOut= attendenceController.signOut
// const getAttendence = attendenceController.getAttendence;
// const getAttendenceByDate = attendenceController.getAttendenceByDate;
// const editAttendence = attendenceController.editAttendence;
// const deleteAttendence = attendenceController.deleteAttendence;


router.post('/add/signIn', signIn);
router.post('/add/signOut', signOut);

module.exports = router;