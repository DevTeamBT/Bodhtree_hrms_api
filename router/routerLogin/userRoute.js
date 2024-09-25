
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Create upload directory if it doesn't exist
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Folder where images will be stored
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Unique filenames
    }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image file.'), false);
    }
};

// Multer middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });







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
const uplodePhoto = userController.uplodePhoto;


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
router.get('/employees/reportsTo/:managerId/:startDate/:endDate', getEmpByManager);

router.post('/uplode/photo/:userId', upload.single('photo'), uplodePhoto);

router.post('/api/login', userLogin);









module.exports = router;
