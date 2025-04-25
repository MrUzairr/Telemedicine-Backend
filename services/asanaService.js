const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.ASANA_PAT);

const getTaskDataFromAsana = async (workspaceId, projectId) => {
    console.log("Fetching task data for project:", projectId);

    if (workspaceId && projectId) {
        try {
            const tasks = await client.tasks.findByProject(projectId);

            if (!tasks.data || tasks.data.length === 0) {
                throw new Error("No tasks found in Asana project");
            }

            const result = [];
            for (let task of tasks.data) {
                const taskId = task.gid;
                const taskData = await client.tasks.getTask(taskId);
                const commentsData = await client.stories.findByTask(taskId);

                result.push({ taskData, commentsData });
            }

            return result;
        } catch (error) {
            console.error("Error fetching tasks by project:", error);
            throw new Error('Failed to fetch tasks for the project');
        }
    } else {
        throw new Error('Invalid parameters: either taskId or workspaceId/projectId must be provided');
    }
};

// const getTaskDataFromAsana = async (taskId, workspaceId, projectId) => {
//     console.log("Fetching task data for project:", projectId);

//     if (workspaceId && projectId) {
//         try {
//             const tasks = await client.tasks.findByProject(projectId);
//             // console.log("Fetched tasks:", tasks);
            
//             if (!tasks.data || tasks.data.length === 0) {
//                 throw new Error("No tasks found in Asana project");
//             }

//             // Continue with fetching task details
//             taskId = tasks.data[2].gid;

//             if (taskId) {
//                 const taskData = await client.tasks.getTask(taskId);
//                 const commentsData = await client.stories.findByTask(taskId);
//                 return { taskData, commentsData };
//             }

//             return tasks.data;
//         } catch (error) {
//             console.error("Error fetching tasks by project:", error);
//             throw new Error('Failed to fetch tasks for the project');
//         }
//     } else {
//         throw new Error('Invalid parameters: either taskId or workspaceId/projectId must be provided');
//     }
// };

module.exports = { getTaskDataFromAsana };




// const asana = require('asana');
// const client = asana.Client.create().useAccessToken(process.env.ASANA_PAT);

// const getTaskDataFromAsana = async (taskId, workspaceId, projectId) => {
//     console.log("Fetching task data");
//     // If workspaceId and projectId are provided, fetch all tasks for the project
//     if (workspaceId && projectId) {
//         try {
//             const tasks = await client.tasks.findByProject(projectId);
//             console.log("tasks", tasks);
//             taskId = tasks.data[0].gid
//             console.log("taskId", taskId);

//               // If taskId is provided, get specific task details
//             if (taskId) {
//                 try {
//                     const taskData = await client.tasks.getTask(taskId);
//                     const commentsData = await client.tasks.getStories(taskId);
//                     console.log("taskData", taskData);
//                     return { taskData, commentsData };
//                 } catch (error) {
//                     console.error("Error fetching task data:", error);
//                     throw new Error('Failed to fetch task data');
//                 }
//             } 
//             // Ensure tasks is an array
//             return Array.isArray(tasks) ? tasks : [];
//         } catch (error) {
//             console.error("Error fetching tasks by project:", error);
//             throw new Error('Failed to fetch tasks for the project');
//         }
//     }

//     // If neither taskId nor valid workspaceId/projectId is provided, throw an error
//     else {
//         throw new Error('Invalid parameters: either taskId or workspaceId/projectId must be provided');
//     }
// };


// module.exports = { getTaskDataFromAsana };
