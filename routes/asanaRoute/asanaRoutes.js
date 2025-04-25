const express = require('express');
const router = express.Router();
const { fetchTaskDetails, storeTask } = require('../../controller/asanaController/asanaController');

// Route to fetch all tasks with their details and comments
router.get('/tasks', fetchTaskDetails); // No taskId parameter needed

// Route to store tasks and comments into the database
// router.post('/tasks', storeTask); // Store all tasks and comments for the specified project and workspace

// Route to fetch all tasks for a specific project (workspaceId and projectId are fixed in the controller)

module.exports = router;
