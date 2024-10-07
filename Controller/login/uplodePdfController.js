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





// Export the functions
module.exports = {
    uploadFile,
    getFiles
};
