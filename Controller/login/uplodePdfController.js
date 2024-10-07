const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching files', error: error.message });
    }
};

const downloadPdfById = async (req,res) => {
    const { id } = req.params; // Extract the ID from the request parameters

    try {
        // Find the PDF document by its _id
        const pdfFile = await Pdf.findById(id);

        if (!pdfFile) {
            return res.status(404).json({ message: 'File not found' });
        }

        
        const filePath = path.join(__dirname, '../../', pdfFile.filePath); 
        console.log('File path:', filePath); 

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        // Send the file for download
        res.download(filePath, pdfFile.originalName, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error downloading file', error: err });
            }
        });

    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Export the functions
module.exports = {
    uploadFile,
    getFiles,
    downloadPdfById
};
