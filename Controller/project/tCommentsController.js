const mongoose = require('mongoose');
const Comment = require('../../schema/Project/taskCommentsSchema');
const Task = require('../../schema/Project/tasksSchema');
const User = require('../../schema/Employee/userSchema');


const createComment = async (req, res) => {
    const { taskId } = req.params;
    const { tcDesc, tcAssignedTo } = req.body;
  
    if (!taskId || !tcDesc || !tcAssignedTo) {
      return res.status(400).send({ error: 'Task ID, comment description, and assigned user are required' });
    }
  
    try {
      // Check if the task exists
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).send({ error: 'Task not found' });
      }
  
      // Check if the user exists and validate the user ID
      if (!mongoose.Types.ObjectId.isValid(tcAssignedTo)) {
        return res.status(400).send({ error: 'Invalid ObjectId format for tcAssignedTo' });
      }
      const user = await User.findById(tcAssignedTo);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      // Create and save the comment
      const comment = new Comment({
        tId: taskId,
        tcDesc,
        tcAssignedTo: user.fullName,
      });
  
      await comment.save();
      res.status(201).send(comment);
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  };
  




const getComment = async (req,res) => {
    try {   
        const comment = await Comment.findById(req.params.id); 
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

const getTcomments = async (req,res) => {
    const { taskId } = req.params;
  
    if (!taskId) {
      return res.status(400).send({ error: 'Task ID is required' });
    }
  
    try {
      // Check if the task exists
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).send({ error: 'Task not found' });
      }
  
      // Fetch comments for the task
      const comments = await Comment.find({ tId: taskId });
  
      res.status(200).send(comments);
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  };

module.exports = {
    createComment:createComment,
    getComment:getComment,
    getComments:getComments,
    getTcomments:getTcomments
}