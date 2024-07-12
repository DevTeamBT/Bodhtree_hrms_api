const mongoose = require('mongoose');
const Task = require('../../schema/Project/tasksSchema');
const User = require('../../schema/Employee/userSchema');
// const Project =require('../../schema/Project/projectsSchema');


//create task api
const createTask = async (req, res) => {
    try {
        // Extract task data from request body
        const { tTitle, tDesc, tStatus, tAssignedTo } = req.body;

        // Check if tAssignedTo is an array of valid ObjectId strings
        if (!Array.isArray(tAssignedTo) || !tAssignedTo.every(id => mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: 'Invalid ObjectId format for tAssignedTo' });
        }

        // Fetch the full names from User collection
        const assignedUsers = await User.find({ _id: { $in: tAssignedTo } }).select('fullName');
        if (assignedUsers.length !== tAssignedTo.length) {
            return res.status(404).json({ message: 'One or more assigned users not found' });
        }

        const taskStatus = tStatus || 'pending';

        // Create new task instance
        const newTask = new Task({
            id: Task.length + 1,
            // pId,
            tTitle,
            tDesc,
            tStatus: taskStatus,
            tAssignedTo: assignedUsers.map(user => user.fullName)  
        });

        // Save the task to the database
        const savedTask = await newTask.save();

        // Respond with the saved task
        res.status(201).json(savedTask);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to create task' });
    }
};

const getTask = async (req,res) => {
    try {   
        const task = await Task.findById(req.params.id); 
        res.json(task);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to get task' });
    }
};


const getTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        // Fetch tasks for the current page
        const tasks = await Task.find().skip(startIndex).limit(limit); // Assuming Task is a MongoDB model
        const users = await User.find({}, 'fullName');
        // Count total number of tasks
        const totalTasks = await Task.countDocuments();
        // Calculate total pages
        const totalPages = Math.ceil(totalTasks / limit);
        res.json({ tasks, totalPages , users});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  };

module.exports = {
    createTask:createTask,
    getTask: getTask,
    getTasks: getTasks

}