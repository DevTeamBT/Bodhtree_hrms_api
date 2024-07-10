const mongoose = require('mongoose');
const Task = require('../../schema/Project/tasksSchema');
const User = require('../../schema/Employee/userSchema');
// const Project =require('../../schema/Project/projectsSchema');


//create task api
const createTask = async (req,res) => {
    try {
        // Extract task data from request body
        const { tTitle, tDesc, tStatus, tAssignedTo } = req.body;
        // Check if pId and tAssignedTo are valid ObjectId strings
        // !mongoose.Types.ObjectId.isValid(pId) ||
        // if ( !mongoose.Types.ObjectId.isValid(tAssignedTo)) {
        //     return res.status(400).json({ message: 'Invalid ObjectId format for pId or tAssignedTo' });
        // }
        // Fetch the pTitle from Project collection
        // const projectTitle = await Project.findById(pId);
        // if (!projectTitle) {
        //     return res.status(404).json({ message: 'project title not found' });
        // }
        // Fetch the fullName from User collection
        // const assignedUser = await User.findById(tAssignedTo);
        // if (!assignedUser) {
        //     return res.status(404).json({ message: 'Assigned user not found' });
        // }
        const taskStatus = tStatus || 'pending';
        // Create new task instance
        const newTask = new Task({
            id: Task.length + 1,
            // pId,
            tTitle,
            tDesc,
            tStatus : taskStatus,
            // tAssignedTo: assignedUser.fullName
        });
        // Save the task to the database
        const savedTask = await newTask.save();
        // Respond with the saved task
        res.status(201).json(savedTask);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to create tasks' });
    }
};

const getTask = async (req,res) => {
    try {   
        const task = await Task.findOne(); 
        res.json(task);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to get task' });
    }
};


const getTasks = async (req,res) => {
    try {
        const task = await Task.find();
        res.json(task);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to get all tasks' });
    }
};


module.exports = {
    createTask:createTask,
    getTask: getTask,
    getTasks: getTasks

}