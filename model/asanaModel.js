const asana = require('asana');
require('dotenv').config();
const Task = require('./taskModel');
const ASANA_PAT = process.env.ASANA_PAT; // Your Asana Personal Access Token
const client = asana.Client.create().useAccessToken(ASANA_PAT);

// Your Workspace ID and Project ID
const workspaceId = '1209047105922798'; // Replace with your actual workspace ID

// Function to create a task in a specific project and workspace
const createTask = async (projectId,taskData) => {
    try {
        // Verifying task data before making API call
        console.log('Creating task with data:', taskData);

        // Create task in the "Test Project"
        const createdTask = await client.tasks.create({
            name: taskData.name,
            notes: taskData.notes,
            projects: [projectId],  // "Test Project" ID
            workspace: workspaceId,  // "My workspace" ID
        });

        console.log('Task created successfully:', createdTask);
        return createdTask;
    } catch (error) {
        // Handle error during task creation
        console.error('Error during task creation:', error.response ? error.response.body : error.message);
        throw new Error('Error during task creation: ' + (error.response ? error.response.body : error.message));
    }
};


// Function to retrieve tasks from a single project
const retrieveTasksFromProject = async (workspaceId, projectId) => {
    try {
        const tasks = [];
        let page = await client.tasks.findAll({
            project: projectId  // Use the project ID to filter tasks
        });

        while (page) {
            tasks.push(...page.data);  // Add tasks to the list
            if (page.next_page) {
                page = await client.tasks.getPage(page.next_page);  // Handle pagination
            } else {
                break;
            }
        }

        return tasks;  // Return tasks from the project
    } catch (error) {
        console.error("Error retrieving tasks from project:", error.message);
    }
};

// Function to retrieve tasks from multiple projects
const retrieveTasksFromMultipleProjects = async (workspaceId, projectIds) => {
    try {
        const allTasks = [];

        // Loop through each project and fetch tasks
        for (const projectId of projectIds) {
            const tasks = await retrieveTasksFromProject(workspaceId, projectId);
            allTasks.push(...tasks);  // Add tasks from each project to the main list
        }

        // Store the fetched tasks in the database
        await storeTasksInDatabase(allTasks);
        return allTasks;
    } catch (error) {
        console.error("Error retrieving tasks from multiple projects:", error.message);
    }
};

// Function to fetch projects from a workspace
const fetchProjectsFromWorkspace = async (workspaceId) => {
    try {
        const projectIds = [];
        let page = await client.projects.findAll({
            workspace: workspaceId,
        });
        // Add project IDs to the array
        while (page) {
            page.data.forEach(project => projectIds.push(project.gid));  // Extract project IDs
            if (page.next_page) {
                page = await client.projects.getPage(page.next_page);  // Handle pagination
            } else {
                break;
            }
        }

        return projectIds;  // Return the array of project IDs
    } catch (error) {
        console.error("Error fetching projects:", error.message);
    }
};
const storeTasksInDatabase = async (tasks) => {
    try {
        // Insert tasks into MongoDB
        for (const task of tasks) {
            const existingTask = await Task.findOne({ gid: task.gid });
            if (!existingTask) {
                // Create new task entry if it does not exist
                const newTask = new Task({
                    gid: task.gid,
                    name: task.name,
                    notes: task.notes,
                });
                await newTask.save();
                console.log(`Task with gid ${task.gid} saved to the database.`);
            }
        }
    } catch (error) {
        console.error('Error saving tasks to database:', error);
    }
};

// Example usage
const retrieveTasks = async () => {
    try {
        // Step 1: Fetch projects from the workspace
        const projectIds = await fetchProjectsFromWorkspace(workspaceId);
        
        // Step 2: Retrieve tasks from the fetched projects
        const tasks = await retrieveTasksFromMultipleProjects(workspaceId, projectIds);

        return tasks;
    } catch (error) {
        console.error("Error during fetch and task retrieval:", error.message);
    }
};



// Function to update a task
const updateTask = async (taskId, updateData) => {
    try {
        const updatedTask = await client.tasks.update(taskId, updateData);
        return updatedTask;
    } catch (error) {
        throw new Error('Error updating task: ' + (error.response ? error.response.body : error.message));
    }
};

// Function to delete a task
const deleteTask = async (taskId) => {
    try {
        await client.tasks.delete(taskId);
        return `Task with ID ${taskId} has been deleted.`;
    } catch (error) {
        throw new Error('Error during task deletion: ' + (error.response ? error.response.body : error.message));
    }
};

module.exports = {
    createTask,
    retrieveTasks,
    updateTask,
    deleteTask,
};








// const asana = require('asana');
// require('dotenv').config();

// const ASANA_PAT = process.env.ASANA_PAT; // Your Asana Personal Access Token
// const client = asana.Client.create().useAccessToken(ASANA_PAT);

// // Function to create a task
// const createTask = async (projectId, taskData) => {
//     try {
//         const createdTask = await client.tasks.create({
//             name: taskData.name,
//             notes: taskData.notes,
//             projects: [projectId],
//         });

//         return createdTask;
//     } catch (error) {
//         throw new Error('Error during task creation: ' + (error.response ? error.response.body : error.message));
//     }
// };

// // Function to retrieve tasks from a project
// const retrieveTasks = async (projectId) => {
//     try {
//         const tasks = [];
//         let page = await client.tasks.findByProject(projectId);

//         while (page) {
//             tasks.push(...page.data);
//             if (page.next_page) {
//                 page = await client.tasks.getPage(page.next_page);
//             } else {
//                 break;
//             }
//         }

//         return tasks;
//     } catch (error) {
//         throw new Error('Error retrieving tasks: ' + (error.response ? error.response.body : error.message));
//     }
// };

// // Function to update a task
// const updateTask = async (taskId, updateData) => {
//     try {
//         const updatedTask = await client.tasks.update(taskId, updateData);
//         return updatedTask;
//     } catch (error) {
//         throw new Error('Error updating task: ' + (error.response ? error.response.body : error.message));
//     }
// };

// // Function to delete a task
// const deleteTask = async (taskId) => {
//     try {
//         await client.tasks.delete(taskId);
//         return `Task with ID ${taskId} has been deleted.`;
//     } catch (error) {
//         throw new Error('Error during task deletion: ' + (error.response ? error.response.body : error.message));
//     }
// };

// module.exports = {
//     createTask,
//     retrieveTasks,
//     updateTask,
//     deleteTask,
// };




// const asana = require('asana');
// require('dotenv').config();

// const ASANA_PAT = process.env.ASANA_PAT; // Your Asana Personal Access Token
// const client = asana.Client.create().useAccessToken(ASANA_PAT);

// // Existing project ID where the tasks are located
// const projectId = '1209047157633629'; // Replace with your actual project ID

// // Function to delete tasks in a project
// const deleteTasksInProject = async (projectId) => {
//     try {
//         // Fetch tasks in a paginated manner
//         const tasks = [];
//         let page = await client.tasks.findByProject(projectId);

//         // Collect all tasks across pages (if there are multiple pages)
//         while (page) {
//             tasks.push(...page.data);
//             if (page.next_page) {
//                 page = await client.tasks.getPage(page.next_page);
//             } else {
//                 break;
//             }
//         }

//         if (tasks.length === 0) {
//             console.log('No tasks found in the project.');
//             return;
//         }

//         // Loop through all tasks and delete them
//         for (const task of tasks) {
//             await client.tasks.delete(task.gid);
//             console.log(`Task with ID ${task.gid} has been deleted.`);
//         }

//     } catch (error) {
//         console.error('Error during task deletion:', error.response ? error.response.body : error.message);
//     }
// };

// // Delete all tasks in the specified project
// deleteTasksInProject(projectId);




// const asana = require('asana');
// require('dotenv').config();

// const ASANA_PAT = process.env.ASANA_PAT; // Your Asana Personal Access Token
// const client = asana.Client.create().useAccessToken(ASANA_PAT);

// // Existing project ID where you want to add tasks
// const projectId = '1209047157633629'; // Replace with your actual project ID
// const workspaceId = '1209047105922798'; // Replace with your actual workspace ID

// // Dummy user data (replace with actual Asana user IDs for each role)
// const users = {
//     user: '1209047105921212',  // Replace with the Asana user ID for "user"
//     doctor: '1209047105921213',  // Replace with the Asana user ID for "doctor"
//     admin: '1209047105921214'   // Replace with the Asana user ID for "admin"
// };

// // Dummy task data for testing
// const dummyTasks = [
//     { name: 'Task 1', notes: 'This is the first task for the user role.', assigneeRole: 'user', roleData: 'User specific task: Complete your daily report.' },
//     { name: 'Task 2', notes: 'This is the second task for the doctor role.', assigneeRole: 'doctor', roleData: 'Doctor specific task: Review the medical records of patients.' },
//     { name: 'Task 3', notes: 'This is the third task for the admin role.', assigneeRole: 'admin', roleData: 'Admin specific task: Oversee the project progress and allocate resources.' }
// ];

// // Function to create task and add content
// const createTaskAndAddContent = async (taskData) => {
//     try {
//         // Create the task in the project
//         const createdTask = await client.tasks.create({
//             name: taskData.name,
//             notes: taskData.notes,
//             projects: [projectId],
//             workspace: workspaceId,
//         });

//         console.log(`Task created: ${createdTask.name}, Task ID: ${createdTask.gid}`);

//         // Assign the task based on the specified role
//         const assignee = users[taskData.assigneeRole];
//         if (assignee) {
//             await client.tasks.update(createdTask.gid, {
//                 assignee: assignee,
//             });
//             console.log(`Task assigned to: ${taskData.assigneeRole}`);
//         } else {
//             console.log('No assignee found for this task.');
//         }

//         // Add role-specific data to the task
//         await client.tasks.update(createdTask.gid, {
//             notes: `${taskData.notes}\nRole-specific Data: ${taskData.roleData}`,  // Add role-specific content to the task notes
//         });

//         console.log(`Role-specific data added to task: ${taskData.roleData}`);

//         // Add subtask to the created task
//         const subtask = await client.tasks.create({
//             name: `Subtask for ${createdTask.name}`,
//             parent: createdTask.gid, // Link the subtask to the created task
//             workspace: workspaceId,
//         });
//         console.log(`Subtask created: ${subtask.name}, Subtask ID: ${subtask.gid}`);

//         // Assign the subtask based on the specified role
//         if (assignee) {
//             await client.tasks.update(subtask.gid, {
//                 assignee: assignee,
//             });
//             console.log(`Subtask assigned to: ${taskData.assigneeRole}`);
//         }

//         // Add role-specific data to the subtask
//         await client.tasks.update(subtask.gid, {
//             notes: `Subtask Notes: Complete the subtask for ${createdTask.name}.\nRole-specific Data: ${taskData.roleData}`,  // Add role-specific content to the subtask
//         });

//         console.log(`Role-specific data added to subtask: ${taskData.roleData}`);

//         // Add comment to the created task
//         const comment = await client.tasks.addComment(createdTask.gid, {
//             text: `This is a comment on the task: ${createdTask.name}`,
//         });
//         console.log(`Comment added: ${comment.text}`);

//         // Add an attachment to the created task (example URL)
//         const attachment = await client.tasks.addAttachment({
//             task: createdTask.gid,
//             file_url: 'https://example.com/your-attachment.png', // Use an actual file URL
//         });
//         console.log(`Attachment added: ${attachment.name}`);

//     } catch (error) {
//         console.error('Error during task creation or adding content:', error.response ? error.response.body : error.message);
//     }
// };

// // Create tasks and add content to each task
// dummyTasks.forEach(task => {
//     createTaskAndAddContent(task);
// });



// const asana = require('asana');
// require('dotenv').config();

// const ASANA_PAT = process.env.ASANA_PAT; // Your Asana Personal Access Token
// const client = asana.Client.create().useAccessToken(ASANA_PAT);

// // Existing project ID where you want to add tasks
// const projectId = '1209047157633629'; // Replace with your actual project ID
// const workspaceId = '1209047105922798'; // Replace with your actual workspace ID

// // Dummy task data for testing
// const dummyTasks = [
//     { name: 'Task 1', notes: 'This is the first task.' },
//     { name: 'Task 2', notes: 'This is the second task.' },
//     { name: 'Task 3', notes: 'This is the third task.' }
// ];

// // Create tasks in the specified project
// dummyTasks.forEach(task => {
//     client.tasks.create({
//         name: task.name,
//         notes: task.notes,
//         projects: [projectId], // The project where the task will be created
//         workspace: workspaceId, // Ensure the task is created in your workspace
//     })
//     .then((createdTask) => {
//         console.log(`Task created: ${createdTask.name}, Task ID: ${createdTask.gid}`);
//     })
//     .catch((error) => {
//         console.error('Error creating task:', error.response ? error.response.body : error.message);
//     });
// });



// const asana = require('asana');
// require('dotenv').config();

// const ASANA_PAT = process.env.ASANA_PAT; // Your Asana Personal Access Token
// const client = asana.Client.create().useAccessToken(ASANA_PAT);

// // Workspace ID where you want to add the projects
// const workspaceId = '1209047105922798'; // Replace with your actual workspace ID

// // Dummy project data for testing
// const dummyProjects = [
//     { name: 'Project Alpha' },
//     { name: 'Project Beta' },
//     { name: 'Project Gamma' }
// ];

// // Create projects in Asana
// dummyProjects.forEach(project => {
//     client.projects.create({
//         name: project.name,
//         workspace: workspaceId, // Ensure the project is created in your workspace
//     })
//     .then((createdProject) => {
//         console.log(`Project created: ${createdProject.name}, Project ID: ${createdProject.gid}`);
//     })
//     .catch((error) => {
//         console.error('Error creating project:', error.response ? error.response.body : error.message);
//     });
// });



// const asana = require('asana');
// const ASANA_PAT = process.env.ASANA_PAT;
// const asanaClient = asana.Client.create().useAccessToken(ASANA_PAT);

// module.exports = asanaClient;
