const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const poppler = require('pdf-poppler');
const { ObjectId } = mongoose.Types;
const Pdf = require('../../schema/Employee/pdfSchema'); 

// Function to upload a file
const uploadFile = async (req, res) => {
    try {
        const file = req.file;

        // Create a new PDF document and save to the database
        const newPDF = new Pdf({
            originalName: file.originalname,
            fileName: file.filename,
            filePath: file.path,
            size: file.size,
        });

        await newPDF.save();

        res.status(200).json({ message: 'File uploaded successfully', file: newPDF });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
};

// Function to fetch all uploaded files
const getFiles = async (req, res) => {
    try {
        const files = await Pdf.find();  // Fetch all files from the database
        res.status(200).json({message:'get all files uploded by HR policies etc.', files});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching files', error: error.message });
    }
};

// const downloadPdfById = async (req, res) => {
//     const { id } = req.params; // Extract the ID from the request parameters

//     try {
//         // Find the PDF document by its _id
//         const pdfFile = await Pdf.findById(id);

//         if (!pdfFile) {
//             return res.status(404).json({ message: 'File not found' });
//         }

//         const filePath = path.join(__dirname, '../../', pdfFile.filePath); 
//         console.log('File path:', filePath); 

//         // Check if the file exists
//         if (!fs.existsSync(filePath)) {
//             return res.status(404).json({ message: 'File not found on server' });
//         }

//         // Set headers to display the PDF inline in the browser
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `inline; filename="${pdfFile.originalName}"`);

//         // Stream the file for viewing
//         const fileStream = fs.createReadStream(filePath);
//         fileStream.pipe(res);

//     } catch (error) {
//         console.error('Error displaying file:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };


// 


const convertPdfToImage = async (pdfFilePath) => {
    const outputDir = path.join(__dirname, '../../images');
    
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const opts = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: path.basename(pdfFilePath, path.extname(pdfFilePath)),
        page: null // Convert all pages
    };

    try {
        await poppler.convert(pdfFilePath, opts);
        console.log('PDF converted to images successfully');
    } catch (error) {
        console.error('Error converting PDF to image:', error);
        throw new Error('Could not convert PDF to image');
    }

    return [
        path.join(outputDir, opts.out_prefix + '-1.png'), 
        path.join(outputDir, opts.out_prefix + '-2.png')
    ];
};

const displayPdfAsImage = async (req, res) => {
    const { id } = req.params; // Extract the ID from the request parameters

    try {
        // Find the PDF document by its _id
        const pdfFile = await Pdf.findById(id);

        if (!pdfFile) {
            return res.status(404).json({ message: 'File not found' });
        }

        const pdfFilePath = path.join(__dirname, '../../', pdfFile.filePath);

        // Check if the file exists
        if (!fs.existsSync(pdfFilePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        // Convert the PDF to an image
        const imagePath = await convertPdfToImage(pdfFilePath);

        // Serve the image
        res.status(200).json({message:'successful get single pdf' ,images: imagePath });

    } catch (error) {
        console.error('Error displaying PDF as image:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Export the functions
module.exports = {
    uploadFile,
    getFiles,
    // downloadPdfById
    displayPdfAsImage
};
