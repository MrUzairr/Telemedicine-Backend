// const taskModel = require('../model/asanaModel');

// const createTaskController = async (req, res) => {
//     try {
//         // Extract projectId, name, and notes from the request body
//         const { projectId, name, notes } = req.body;
//         const taskData = { name, notes };

//         // Ensure that projectId is provided in the request body
//         if (!projectId) {
//             return res.status(400).json({
//                 message: 'Project ID is required',
//             });
//         }

//         console.log('Request Data:', req.body); // Log the incoming request body

//         // Call model function to create the task
//         const createdTask = await taskModel.createTask(projectId, taskData);

//         // Send the response back
//         res.status(201).json({
//             message: 'Task created successfully',
//             data: createdTask,
//         });
//     } catch (error) {
//         console.error('Error:', error);  // Log error for debugging
//         res.status(500).json({ message: error.message });
//     }
// };


// // Controller to handle retrieving tasks from a project
// const retrieveTasksController = async (req, res) => {
//     try {
//         const { projectId } = req.params;
//         const tasks = await taskModel.retrieveTasks(projectId);
//         console.log("tasks",tasks)
//         res.status(200).json({
//             message: 'Tasks retrieved successfully',
//             data: tasks,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Controller to handle task updates
// const updateTaskController = async (req, res) => {
//     try {
//         const { taskId } = req.params;
//         const { name, notes } = req.body;
//         const updateData = { name, notes };

//         const updatedTask = await taskModel.updateTask(taskId, updateData);

//         res.status(200).json({
//             message: 'Task updated successfully',
//             data: updatedTask,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Controller to handle task deletion
// const deleteTaskController = async (req, res) => {
//     try {
//         const { taskId } = req.params;
//         const message = await taskModel.deleteTask(taskId);

//         res.status(200).json({
//             message: message,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports = {
//     createTaskController,
//     retrieveTasksController,
//     updateTaskController,
//     deleteTaskController,
// };



// // const asanaClient = require('../model/asanaModel'); // Import Asana client

// // // Create a new task in Asana
// // async function createTask(req, res) {
// //     const { projectId, name, notes } = req.body; // Extract task data from the request
// //     console.log("Task creation request data:", req.body); // Log the incoming data for debugging

// //     try {
// //         // Set the headers for handling deprecation
// //         const headers = { 
// //             'Asana-Enable': 'new_goal_memberships' // Or 'Asana-Disable' based on your choice
// //         };

// //         console.log("Sending request to Asana API...");

// //         const task = await asanaClient.tasks.create({
// //             name: name,
// //             notes: notes,
// //             projects: [projectId],  // The project where the task will be created
// //             workspace: '1209047157633629', // The workspace ID
// //             headers: headers, // Include the deprecation header
// //         });

// //         console.log("Task created:", task); // Log the created task response

// //         res.status(201).json({ message: 'Task created in Asana', data: task });
// //     } catch (error) {
// //         console.error("Error during task creation:", error.response ? error.response.body : error.message);
// //         res.status(500).json({ message: 'Error creating task in Asana', error: error.response ? error.response.body : error.message });
// //     }
// // }



// // // async function createTask(req, res) {
// // //     const { projectId, name, notes } = req.body; // Extract task data from the request
// // //     try {
// // //         const task = await asanaClient.tasks.create({
// // //             name: name,
// // //             notes: notes,
// // //             projects: [projectId], // The project where the task will be created
// // //         });
// // //         console.log("Sending task data:", task); // Log the data being sent

// // //         res.status(201).json({ message: 'Task created in Asana', data: task });
// // //     } catch (error) {
// // //         res.status(500).json({ message: 'Error creating task in Asana', error: error.message });
// // //     }
// // // }

// // // Get tasks from a specific parent task (including subtasks)
// // async function getSubtasks(req, res) {
// //     const { parentTaskId } = req.params; // Get the parent task ID from the URL

// //     try {
// //         const subtasks = await asanaClient.tasks.subtasks(parentTaskId); // Fetch subtasks
// //         res.status(200).json({ tasks: subtasks });
// //     } catch (error) {
// //         res.status(500).json({ message: 'Error fetching subtasks', error: error.message });
// //     }
// // }

// // // Create or update a subtask
// // async function createOrUpdateSubtask(req, res) {
// //     const { parentTaskId, subtaskName, subtaskNotes, subtaskId } = req.body;

// //     try {
// //         let subtask;

// //         if (subtaskId) {
// //             // Update existing subtask
// //             subtask = await asanaClient.tasks.update(subtaskId, {
// //                 name: subtaskName,
// //                 notes: subtaskNotes,
// //                 parent: parentTaskId, // Ensure the subtask is linked to the parent task
// //             });
// //         } else {
// //             // Create new subtask
// //             subtask = await asanaClient.tasks.create({
// //                 name: subtaskName,
// //                 notes: subtaskNotes,
// //                 parent: parentTaskId, // Link the new subtask to the parent task
// //             });
// //         }

// //         res.status(200).json({ message: 'Subtask created/updated successfully', data: subtask });
// //     } catch (error) {
// //         res.status(500).json({ message: 'Error creating/updating subtask in Asana', error: error.message });
// //     }
// // }

// // module.exports = { createTask, createOrUpdateSubtask, getSubtasks };




// // const asanaClient = require('./asanaClient'); // Import Asana client

// // // Create a new task in Asana
// // async function createTask(req, res) {
// //     const { projectId, name, notes } = req.body; // Extract task data from the request

// //     try {
// //         const task = await asanaClient.tasks.create({
// //             name: name,
// //             notes: notes,
// //             projects: [projectId], // The project where the task will be created
// //         });
// //         res.status(201).json({ message: 'Task created in Asana', data: task });
// //     } catch (error) {
// //         res.status(500).json({ message: 'Error creating task in Asana', error: error.message });
// //     }
// // }

// // // Get tasks from a specific project
// // async function getTasks(req, res) {
// //     const { projectId } = req.params; // Get the project ID from the URL

// //     try {
// //         const tasks = await asanaClient.tasks.findByProject(projectId);
// //         res.status(200).json({ tasks: tasks });
// //     } catch (error) {
// //         res.status(500).json({ message: 'Error fetching tasks', error: error.message });
// //     }
// // }

// // // Update task with additional data
// // async function updateTask(req, res) {
// //     const { taskId, additionalData } = req.body; // Extract task ID and data from request

// //     try {
// //         const updatedTask = await asanaClient.tasks.update(taskId, additionalData);
// //         res.status(200).json({ message: 'Task updated in Asana', data: updatedTask });
// //     } catch (error) {
// //         res.status(500).json({ message: 'Error updating task in Asana', error: error.message });
// //     }
// // }

// // module.exports = { createTask, getTasks, updateTask };





// // // const asanaClient = require('./asanaClient'); // Import Asana client

// // // // Create Task in Asana
// // // async function createTask(req, res) {
// // //     const { name, notes, projectId, dueDate } = req.body; // Extract data from the request
// // //     try {
// // //         // Create the task in the selected Asana project
// // //         const result = await asanaClient.tasks.create({
// // //             name, // Task name
// // //             notes, // Task description
// // //             projects: [projectId], // Asana project ID where the task will be created
// // //             due_on: dueDate, // Optional: Set due date if provided
// // //         });

// // //         res.status(201).json({ message: 'Task created in Asana', data: result });
// // //     } catch (error) {
// // //         console.error('Error creating task:', error.response ? error.response.body : error.message);
// // //         res.status(500).json({ message: 'Error creating task in Asana', error: error.message });
// // //     }
// // // };

// // // // Get All Projects from Asana
// // // async function getTask(req, res) {
// // //     try {
// // //         // Fetch all projects in the specified workspace
// // //         const projects = await asanaClient.projects.findByWorkspace('1209047108121978'); // Replace with your workspace ID
// // //         res.status(200).json(projects);
// // //     } catch (error) {
// // //         console.error('Error fetching projects:', error.response ? error.response.body : error.message);
// // //         res.status(500).json({ message: 'Error fetching projects', error: error.message });
// // //     }
// // // };

// // // module.exports = { createTask, getTask };
