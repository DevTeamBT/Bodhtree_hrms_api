
const express = require('express');
const router = express.Router();

const loginController = require('../../Controller/login/loginController');
const userController   = require('../../Controller/login/userEmpController'); 
const authMiddleware = require('../../middleware/auth');

const createUser = userController.createUser;
const getUsers = userController.getUsers;
const getUser = userController.getUser;
const addRole = userController.addRole;
const getRoles = userController.getRoles;
const createDept = userController.createDept;
const getAllDept = userController.getAllDept;
const updateEmp = userController.updateEmp;
const getEmpByManager = userController.getEmpByManager;


const userLogin = loginController.userLogin;

// router.post('/api/users', authMiddleware,createUser);
router.post('/api/users',createUser);
router.get('/api/users', getUsers);
router.get('/api/users/:id', getUser);
router.post('/api/role', addRole);
router.get('/roles', getRoles);
router.post('/api/derpement', createDept);
router.get('/api/dept', getAllDept);
router.put('/user/:_id', updateEmp);
router.get('/employees/reportsTo/:managerId', getEmpByManager);


router.post('/api/login', userLogin);



module.exports = router;
