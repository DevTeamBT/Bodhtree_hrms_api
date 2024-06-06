const mongoose = require('mongoose');
const Comment = require('../../schema/Project/taskCommentsSchema');
const Task = require('../../schema/Project/tasksSchema');
const User = require('../../schema/Employee/userSchema');


const createComment = async (req, res) => {
    try {
        const { pId, tId, tcDesc, tcStatus } = req.body;
        if (!mongoose.Types.ObjectId.isValid(pId) || !mongoose.Types.ObjectId.isValid(tId)) {
            return res.status(400).json({ message: 'Invalid ObjectId format for pId or tId' });
        }
        else {
            const { pId, tId, tcDesc, tcStatus} = req.body;
            // Find the task to get the assignTo field
            const task = await Task.findById(tId);
            if (!task) {
            return res.status(404).json({ error: 'Task not found' });
            }
            // Create the comment with the tcAssignedTo field dynamically set
            const newComment = new Comment({
            pId,
            tId,
            tcDesc,
            tcStatus,
            tcAssignedTo: task.tAssignedTo 
            });
            // Save the comment to the database
            const savedComment = await newComment.save();
            res.status(201).json(savedComment);
        }
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to create Comment' });
    }
};

const getComment = async (req,res) => {
    try {   
        const comment = await Comment.findOne(); 
        res.json(comment);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to get Comment' });
    }
};

const getComments = async (req,res) => {
    try {
        const comment = await Comment.find();
        res.json(comment);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to get all Comments' });
    }
};


module.exports = {
    createComment:createComment,
    getComment:getComment,
    getComments:getComments
}