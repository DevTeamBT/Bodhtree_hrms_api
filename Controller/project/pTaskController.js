const mongoose = require('mongoose');
const Task = require('../../schema/Project/tasksSchema');
const User = require('../../schema/Employee/userSchema');
// const Project =require('../../schema/Project/projectsSchema');


//create task api
const createTask = async (req, res) => {
    try {
        // Extract task data from request body
        const { tTitle, tDesc, tStatus, tAssignedTo, active } = req.body;

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
            active , 
            tStatus: taskStatus,
            tAssignedTo: assignedUsers.map(user => user.fullName),
           
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
        // Fetch only active tasks for the current page
        const tasks = await Task.find({ active: true })
            .skip(startIndex)
            .limit(limit);
        // Fetch all users' full names
        const users = await User.find({}, 'fullName');
        // Count total number of active tasks
        const totalTasks = await Task.countDocuments({ active: true });
        // Calculate total pages
        const totalPages = Math.ceil(totalTasks / limit);
        res.json({ tasks, totalPages, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  };


//   const deleteAllTask = async (req,res) => {
//     try {
//         // Fetch only active tasks
//         const activeTasks = await Task.find({ active: true });
//         res.status(200).json(activeTasks);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching tasks', error });
//     }
//   };


  const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Task.findByIdAndUpdate(
            id,
            { active: false },
            { new: true } // Return the updated document
        );
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task set to inactive successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
  }



module.exports = {
    createTask:createTask,
    getTask: getTask,
    getTasks: getTasks,
    // deleteAllTask:deleteAllTask,
    deleteTask:deleteTask

}