
const mongoose = require('mongoose');
const Project = require('../../schema/Project/projectsSchema');
const User = require('../../schema/Employee/userSchema');

const createProject = async (req, res) => {
            try {
                // Extract project data from request body
                const { pTitle, pDesc, pStatus, pCreatedBy, pUpdatedBy } = req.body;
                // Check if pCreatedBy and pUpdatedBy are valid ObjectId strings
                if (!mongoose.Types.ObjectId.isValid(pCreatedBy) || !mongoose.Types.ObjectId.isValid(pUpdatedBy)) {
                    return res.status(400).json({ message: 'Invalid ObjectId format for createdBy or updatedBy' });
                }
                // Fetch user's fullName from User collection
                const user = await User.findById(pCreatedBy && pUpdatedBy);
                if (!user) {
                    return res.status(404).json({ message: 'User not found for createdBy' });
                }
                const projectStatus = pStatus || 'pending';
                // Create new project instance
                const newProject = new Project({
                    pTitle,
                    pDesc,
                    pStatus: projectStatus,
                    pCreatedBy: user.fullName, 
                    pUpdatedBy: user.fullName
                });
                // Save the project to the database
                const savedProject = await newProject.save();
                // Respond with the saved project
                res.json(savedProject);
            } catch (error) {
                // Handle errors
                console.error(error);
                res.status(500).json({ message: 'Failed to create project' });
            }
        };

    //getall projects
    const getProjects = async (req,res) => {
        try {
            const projects = await Project.find(); 
            res.json(projects);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to fetch projects' });
        }
    };

    //getall project by _id
    const getProject = async (req,res) => {
        try {
            const projects = await Project.findOne(); 
            res.json(projects);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to fetch projects' });
        }
    };



module.exports = {
    createProject: createProject,
    getProjects: getProjects,
    getProject: getProject
};
