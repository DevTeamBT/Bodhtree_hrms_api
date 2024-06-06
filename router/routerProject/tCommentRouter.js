const express = require('express');
const router = express.Router();

const taskComments = require('../../Controller/project/tCommentsController');

//api end points
router.post('/add/comment', taskComments.createComment);
router.get('/comment/:id', taskComments.getComment);
router.get('/comments', taskComments.getComments)


module.exports = router;