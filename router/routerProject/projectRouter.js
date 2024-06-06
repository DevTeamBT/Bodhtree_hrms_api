const express = require('express');
const router = express.Router();


const projectController = require('../../Controller/project/projectController'); 


// api end points
router.post('/projects', projectController.createProject);
router.get('/projects', projectController.getProjects);
router.get('/project/:_id', projectController.getProject);

module.exports = router;
