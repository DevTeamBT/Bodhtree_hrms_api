const mongoose = require('mongoose');

// Define a schema for PDF uploads
const pdfSchema = new mongoose.Schema({
    originalName: { type: String}, // The original file name
    fileName: { type: String},     // The name saved in the system
    filePath: { type: String},     // Path to the uploaded file
    size: { type: Number},         // File size in bytes
    uploadDate: { type: Date, default: Date.now },  // Date when file was uploaded
});

// Create the model from the schema
const PDF = mongoose.model('PDF', pdfSchema);

module.exports = PDF;
