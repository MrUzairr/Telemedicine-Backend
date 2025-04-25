const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.ASANA_PAT);

const getTaskDataFromAsana = async (workspaceId, projectId) => {
    console.log("Fetching task data for project:", projectId);

    if (!workspaceId || !projectId) {
        throw new Error('Invalid parameters: workspaceId and projectId are required');
    }

    try {
        const tasks = await client.tasks.findByProject(projectId);
        console.log("Tasks fetched:", tasks);

        if (!tasks.data || tasks.data.length === 0) {
            throw new Error("No tasks found in the Asana project");
        }

        // Fetch data for each task concurrently
        const taskDetailsPromises = tasks.data.map(async (task) => {
            const taskId = task.gid;

            // Fetch task details, comments, subtasks, and assignee data concurrently
            const [taskData, commentsData, subtasksData] = await Promise.all([
                client.tasks.getTask(taskId),
                client.stories.findByTask(taskId),
                client.tasks.subtasks(taskId),
            ]);

            const assignee = taskData.assignee || null;

            return { taskData, commentsData, subtasksData, assignee };
        });

        // Resolve all promises and return results
        const result = await Promise.all(taskDetailsPromises);
        return result;
    } catch (error) {
        console.error("Error fetching tasks by project:", error.message);
        throw new Error('Failed to fetch tasks for the project');
    }
};

module.exports = { getTaskDataFromAsana };






// const asana = require('asana');
// const client = asana.Client.create().useAccessToken(process.env.ASANA_PAT);

// const getTaskDataFromAsana = async (workspaceId, projectId) => {
//     console.log("Fetching task data for project:", projectId);

//     if (workspaceId && projectId) {
//         try {
//             const tasks = await client.tasks.findByProject(projectId);
//             console.log("tasks",tasks)
//             if (!tasks.data || tasks.data.length === 0) {
//                 throw new Error("No tasks found in Asana project");
//             }

//             const result = [];
//             for (let task of tasks.data) {
//                 const taskId = task.gid;
//                 const taskData = await client.tasks.getTask(taskId);
//                 const commentsData = await client.stories.findByTask(taskId);
//                 const subtasksData = await client.tasks.subtasks(taskId);

//                 // Fetch assignee data (if any)
//                 const assignee = taskData.assignee ? taskData.assignee : null;

//                 result.push({ taskData, commentsData, subtasksData, assignee });
//             }

//             return result;
//         } catch (error) {
//             console.error("Error fetching tasks by project:", error);
//             throw new Error('Failed to fetch tasks for the project');
//         }
//     } else {
//         throw new Error('Invalid parameters: either taskId or workspaceId/projectId must be provided');
//     }
// };

// module.exports = { getTaskDataFromAsana };





// const axios = require('axios');
// const { Pool } = require('pg'); // Import PostgreSQL client
// const asanaToken = "2/1209047105921212/1209051797006048:d23edb718ba0e754216e3ffa8bda11ca";
// const projectId = "1209047157633629";
// const workspaceId = "1209047105922798";

// // PostgreSQL Pool
// const pool = new Pool({
//   user: 'your_db_user',
//   host: 'localhost',
//   database: 'your_db_name',
//   password: 'your_db_password',
//   port: 5432,
// });

// // Fetch tasks from Asana
// const getTasksFromAsana = async () => {
//   const response = await axios.get(`https://app.asana.com/api/1.0/projects/${projectId}/tasks`, {
//     headers: { Authorization: `Bearer ${asanaToken}` },
//     params: { workspace: workspaceId },
//   });

//   const tasks = response.data.data;

//   for (const task of tasks) {
//     const query = `
//       INSERT INTO tasks (gid, name, due_on, notes)
//       VALUES ($1, $2, $3, $4)
//       ON CONFLICT (gid) DO UPDATE
//       SET name = EXCLUDED.name, due_on = EXCLUDED.due_on, notes = EXCLUDED.notes;
//     `;
//     const values = [task.gid, task.name, task.due_on, task.notes];
//     await pool.query(query, values);
//   }

//   return tasks;
// };

// // Fetch subtasks for a given task ID
// const getSubtasksForTask = async (taskId) => {
//   const response = await axios.get(`https://app.asana.com/api/1.0/tasks/${taskId}/subtasks`, {
//     headers: { Authorization: `Bearer ${asanaToken}` },
//   });

//   const subtasks = response.data.data;

//   for (const subtask of subtasks) {
//     const query = `
//       INSERT INTO subtasks (gid, name, taskId, due_on)
//       VALUES ($1, $2, $3, $4)
//       ON CONFLICT (gid) DO UPDATE
//       SET name = EXCLUDED.name, taskId = EXCLUDED.taskId, due_on = EXCLUDED.due_on;
//     `;
//     const values = [subtask.gid, subtask.name, taskId, subtask.due_on];
//     await pool.query(query, values);
//   }

//   return subtasks;
// };

// // Fetch comments for a given task ID
// const getCommentsForTask = async (taskId) => {
//   const response = await axios.get(`https://app.asana.com/api/1.0/tasks/${taskId}/stories`, {
//     headers: { Authorization: `Bearer ${asanaToken}` },
//   });

//   const comments = response.data.data.filter((story) => story.type === 'comment');

//   for (const comment of comments) {
//     const query = `
//       INSERT INTO comments (id, text, created_at, taskId, userId)
//       VALUES ($1, $2, $3, $4, $5)
//       ON CONFLICT (id) DO UPDATE
//       SET text = EXCLUDED.text, created_at = EXCLUDED.created_at, taskId = EXCLUDED.taskId, userId = EXCLUDED.userId;
//     `;
//     const values = [comment.id, comment.text, comment.created_at, taskId, comment.created_by.gid];
//     await pool.query(query, values);
//   }

//   return comments;
// };

// // Fetch user details by user ID
// const getUserDetailsById = async (userId) => {
//   const response = await axios.get(`https://app.asana.com/api/1.0/users/${userId}`, {
//     headers: { Authorization: `Bearer ${asanaToken}` },
//   });

//   const user = response.data.data;

//   const query = `
//     INSERT INTO users (gid, name, email, photo, workspace)
//     VALUES ($1, $2, $3, $4, $5)
//     ON CONFLICT (gid) DO UPDATE
//     SET name = EXCLUDED.name, email = EXCLUDED.email, photo = EXCLUDED.photo, workspace = EXCLUDED.workspace;
//   `;
//   const values = [user.gid, user.name, user.email, user.photo, user.workspace];
//   await pool.query(query, values);

//   return user;
// };

// // Fetch tasks with user details
// const getTasksWithUserDetails = async () => {
//   const tasks = await getTasksFromAsana();
//   const tasksWithDetails = [];

//   for (const task of tasks) {
//     const taskId = task.gid;

//     const subtasks = await getSubtasksForTask(taskId);
//     const comments = await getCommentsForTask(taskId);

//     const assignee = task.assignee ? await getUserDetailsById(task.assignee.gid) : null;

//     tasksWithDetails.push({
//       taskData: task,
//       subtasks,
//       comments,
//       assignee,
//     });
//   }

//   return tasksWithDetails;
// };

// module.exports = {
//   getTasksFromAsana,
//   getSubtasksForTask,
//   getCommentsForTask,
//   getUserDetailsById,
//   getTasksWithUserDetails,
// };



// const axios = require('axios');
// const asanaToken = "2/1209047105921212/1209051797006048:d23edb718ba0e754216e3ffa8bda11ca";
// const projectId = "1209047157633629"
// const workspaceId = "1209047105922798"
// // Fetch tasks from Asana
// const getTasksFromAsana = async () => {
//   const response = await axios.get(`https://app.asana.com/api/1.0/projects/${projectId}/tasks`, {
//     headers: {
//       'Authorization': `Bearer ${asanaToken}`,
//     },
//     params: {
//       workspace: workspaceId,
//     },
//   });
//   return response.data.data;
// };

// // Fetch subtasks for a given task ID
// const getSubtasksForTask = async (taskId) => {
//   const response = await axios.get(`https://app.asana.com/api/1.0/tasks/${taskId}/subtasks`, {
//     headers: {
//       'Authorization': `Bearer ${asanaToken}`,
//     },
//   });
//   return response.data.data;
// };

// // Fetch comments for a given task ID
// const getCommentsForTask = async (taskId) => {
//   const response = await axios.get(`https://app.asana.com/api/1.0/tasks/${taskId}/stories`, {
//     headers: {
//       'Authorization': `Bearer ${asanaToken}`,
//     },
//   });
//   return response.data.data.filter(story => story.type === 'comment');
// };

// // Fetch user details by user ID (for assignee, commenter, etc.)
// const getUserDetailsById = async (userId) => {
//   const response = await axios.get(`https://app.asana.com/api/1.0/users/${userId}`, {
//     headers: {
//       'Authorization': `Bearer ${asanaToken}`,
//     },
//   });
//   return response.data.data;
// };

// // Fetch tasks with user details (assignee, comment creator, etc.)
// const getTasksWithUserDetails = async () => {
//   const tasks = await getTasksFromAsana();
//   const tasksWithUserDetails = [];

//   for (let task of tasks) {
//     const taskId = task.gid;

//     // Fetch task subtasks and comments
//     const subtasks = await getSubtasksForTask(taskId);
//     const comments = await getCommentsForTask(taskId);

//     // Fetch user details for assignee and comment creators
//     const assignee = task.assignee ? await getUserDetailsById(task.assignee.gid) : null;
//     const commentCreators = await Promise.all(
//       comments.map(async (comment) => {
//         return await getUserDetailsById(comment.created_by.gid);
//       })
//     );

//     tasksWithUserDetails.push({
//       taskData: task,
//       subtasks,
//       comments,
//       assignee,
//       commentCreators,
//     });
//   }

//   return tasksWithUserDetails;
// };

// module.exports = {
//   getTasksFromAsana,
//   getSubtasksForTask,
//   getCommentsForTask,
//   getUserDetailsById,
//   getTasksWithUserDetails,
// };
