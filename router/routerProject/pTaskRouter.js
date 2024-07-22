const express = require('express');
const router = express.Router();

const pTaskController = require('../../Controller/project/pTaskController');


//api end points
router.post('/add/task', pTaskController.createTask);
router.get('/task/:id', pTaskController.getTask);
router.get('/tasks', pTaskController.getTasks);
// router.delete('/delete/task', pTaskController.deleteAllTask);
router.delete('/task/:id', pTaskController.deleteTask);
router.put('/edit/task/:id', pTaskController.updateTask);


module.exports = router;