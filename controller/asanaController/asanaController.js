const { getTaskDataFromAsana } = require('../../services/asanaService');
const TaskData = require("../../model/asanaModel/taskSchema");
const CommentData = require("../../model/asanaModel/commentSchema");
// Workspace and Project IDs
const workspaceId = '1209047105922798';
const projectId = '1209047157633629';
const fetchTaskDetails = async (req, res) => {
    console.log("Fetching task details for workspace:", workspaceId, "and project:", projectId);

    try {
        // First, store the tasks and comments automatically (in case they haven't been stored yet)
        const storeResponse = await storeTask(req, res);

        // If storing tasks was unsuccessful, handle the error
        if (storeResponse.error) {
            return res.status(500).json({ error: storeResponse.error });
        }

        // Now, fetch all tasks from the database and their associated details
        const tasksWithDetails = [];
        const tasks = await TaskData.find().populate('assignee').exec();

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ error: 'No tasks found.' });
        }

        // Fetch comments for each task
        for (let taskData of tasks) {
            const comments = await CommentData.find({ task: taskData.gid }).populate('user').exec();
            console.log("Comments for task:", taskData.gid, comments);
            tasksWithDetails.push({ task: taskData, comments });
        }

        console.log("store2", storeResponse);  // This should now be printed after fetching tasks

        return res.status(200).json({ tasks: tasksWithDetails });

    } catch (error) {
        console.error("Error in fetchTaskDetails:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
};

const storeTask = async (req, res) => {
    try {
        const taskDataList = await getTaskDataFromAsana(workspaceId, projectId);
        console.log("taskDataList", taskDataList);

        if (!Array.isArray(taskDataList) || taskDataList.length === 0) {
            throw new Error('No tasks found in the Asana response');
        }

        // Store tasks and comments
        for (let task of taskDataList) {
            const taskData = task.taskData;
            const commentsData = task.commentsData;
            console.log("taskData", taskData);

            // Store task
            const newTask = new TaskData({
                gid: taskData.gid,
                name: taskData.name,
                assignee: taskData.assignee ? taskData.assignee.gid : null,  // Assignee's gid
                due_on: taskData.due_on,
                notes: taskData.notes,
                project: taskData.projects[0].gid,
                workspace: taskData.workspace.gid,
            });

            await newTask.save();

            // Store comments
            for (let comment of commentsData.data) {
                const newComment = new CommentData({
                    text: comment.text,
                    created_at: comment.created_at,
                    task: taskData.gid,  // Task gid as string
                    created_by: comment.created_by.gid,  // User's gid as string
                });
                await newComment.save();
            }
        }

        console.log('Tasks and comments stored successfully.');
        return { message: 'Tasks and comments stored successfully.' };

    } catch (error) {
        console.error("Error in storeTask:", error);
        return { error: error.message };  // Return error message to be handled in fetchTaskDetails
    }
};


module.exports = { fetchTaskDetails, storeTask };













// const { getTaskDataFromAsana } = require('../../services/asanaService');
// const TaskData = require("../../model/asanaModel/taskSchema");
// const UserData = require("../../model/asanaModel/userSchema");
// const CommentData = require("../../model/asanaModel/commentSchema");

// // Workspace and Project IDs
// const workspaceId = '1209047105922798';
// const projectId = '1209047157633629';
// const fetchTaskDetails = async (req, res) => {
//     console.log("Fetching task details for workspace:", workspaceId, "and project:", projectId);

//     try {
//         // First, store the tasks and comments automatically (in case they haven't been stored yet)
//         const store = await storeTask(req, res);
//         // if (!store || store.length === 0) {
//         //     console.log("No tasks found in storeTask response");
//         // } else {
//         //     console.log("store1", store);
//         // }

//         // Now, fetch all tasks from the database and their associated details
//         const tasksWithDetails = [];
//         const tasks = await TaskData.find().populate('assignee').exec();

//         if (!tasks || tasks.length === 0) {
//             return res.status(404).json({ error: 'No tasks found.' });
//         }

//         // Fetch comments for each task
//         for (let taskData of tasks) {
//             const comments = await CommentData.find({ task: taskData.gid }).populate('user').exec();
//             console.log("Comments for task:", taskData.gid, comments);
//             tasksWithDetails.push({ task: taskData, comments });
//         }

//         console.log("store2", store);  // This should now be printed after fetching tasks

//         return res.status(200).json({ tasks: tasksWithDetails });

//     } catch (error) {
//         console.error("Error in fetchTaskDetails:", error);
//         if (!res.headersSent) {
//             res.status(500).json({ error: error.message });
//         }
//     }
// };

// const storeTask = async (req, res) => {
//     try {
//         const tasks = await getTaskDataFromAsana(null, workspaceId, projectId);
        
//         // Ensure tasks is an array before proceeding
//         // if (Array.isArray(tasks) && tasks.length > 0) {
//             for (let task of tasks) {
//                 const taskData = task.taskData; // Assuming taskData holds the task info
//                 const commentsData = task.commentsData; // Assuming commentsData holds the comments

//                 // Store the task in the database
//                 const newTask = new TaskData({
//                     gid: taskData.gid,
//                     name: taskData.name,
//                     assignee: taskData.assignee ? taskData.assignee.gid : null,
//                     due_on: taskData.due_on,
//                     notes: taskData.notes,
//                     project: taskData.projects[0].gid,  // Example: Assuming it's stored in the first project
//                     workspace: taskData.workspace.gid,
//                 });
//                 await newTask.save();

//                 // Now store the comments for the task
//                 for (let comment of commentsData.data) {
//                     const newComment = new CommentData({
//                         text: comment.text,
//                         created_at: comment.created_at,
//                         task: taskData.gid,
//                         created_by: comment.created_by.gid,
//                     });
//                     await newComment.save();
//                 }
//             }
//             console.log('Tasks and comments stored successfully.');
//             return res.status(200).json({ message: 'Tasks and comments stored successfully.' });
//         // } else {
//             // throw new Error('No tasks found in the response');
//         // }
//     } catch (error) {
//         console.error("Error in storeTask:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };





// module.exports = { fetchTaskDetails, storeTask };
