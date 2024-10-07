const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../../middleware/auth');
const pdfController = require('../../Controller/login/uplodePdfController');


 
 // Multer setup for file storage
 const storage = multer.diskStorage({
     destination: './uploads/',  // Directory where files will be stored
     filename: (req, file, cb) => {
         cb(null, Date.now() + path.extname(file.originalname));  // Append timestamp to avoid conflicts
     }
 });
 
 const upload = multer({ storage: storage });
 
 // Route to upload a file 
 router.post('/upload', upload.single('pdfFile'), authMiddleware, pdfController.uploadFile);
 
 // Route to get all uploaded files
 router.get('/files', pdfController.getFiles);

 //Route to downlode files
 router.get('/download/:id', pdfController.downloadPdfById);
 
 module.exports = router;
 