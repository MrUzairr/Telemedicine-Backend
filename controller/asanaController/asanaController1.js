const { getTaskDataFromAsana } = require("../../services/asanaService1");
const { insertData, fetchData } = require("../../database/postgres"); // Import PostgreSQL functions


const workspaceId = "5346996849245";
const projectId = "455611946112906";

// Store task data into all related tables
const storeTaskData = async (req, res) => {
  try {
    const tasksWithDetails = await getTaskDataFromAsana(workspaceId, projectId);

    for (let taskDetails of tasksWithDetails) {
      const { taskData, assignee } = taskDetails;
      const subtasksDataArray = taskDetails.subtasksData?.data || [];
      const commentDataArray = taskDetails.commentsData?.data || [];
      const customFieldsData = taskData.custom_fields || [];
      const followersData = taskData.followers || [];
      const projectsData = taskData.projects || [];
      const membershipsData = taskData.memberships || [];
      const workspaceData = taskData.workspace;

      // console.log("Processing Task:", taskData.gid);
      console.log("commentDataArray:", commentDataArray);

      // **Tasks Table**
      await insertData(
        "tasks",
        {
          gid: taskData.gid,
          name: taskData.name,
          notes: taskData.notes,
          permalink_url: taskData.permalink_url,
          completed: taskData.completed,
          completed_at: taskData.completed_at,
          created_at: taskData.created_at,
          modified_at: taskData.modified_at,
          due_at: taskData.due_at,
          due_on: taskData.due_on,
          start_at: taskData.start_at,
          start_on: taskData.start_on,
          num_hearts: taskData.num_hearts,
          num_likes: taskData.num_likes,
          assignee_status: taskData.assignee_status,
          custom_type: taskData.custom_type,
          resource_type: taskData.resource_type,
          resource_subtype: taskData.resource_subtype,
        },
        "gid"
      );

      // **Custom Fields Table**
      for (let customField of customFieldsData) {
        await insertData(
          "custom_fields",
          {
            gid: customField.gid,
            task_gid: taskData.gid,
            name: customField.name,
            description: customField.description,
            display_value: customField.display_value,
            resource_subtype: customField.resource_subtype,
            type: customField.type,
            is_formula_field: customField.is_formula_field,
            is_value_read_only: customField.is_value_read_only,
          },
          "gid"
        );
      }

      // **Followers Table**
      for (let follower of followersData) {
        await insertData(
          "followers",
          {
            gid: follower.gid,
            task_gid: taskData.gid,
            name: follower.name,
            resource_type: follower.resource_type,
          },
          "gid"
        );
      }

      // **Projects Table**
      for (let project of projectsData) {
        await insertData(
          "projects",
          {
            gid: project.gid,
            task_gid: taskData.gid,
            name: project.name,
            resource_type: project.resource_type,
          },
          "gid"
        );
      }

      // **Memberships Table**
      for (let membership of membershipsData) {
        await insertData(
          "memberships",
          {
            task_gid: taskData.gid,
            project_gid: membership.project?.gid,
            section_gid: membership.section?.gid,
          },
          "task_gid"
        );
      }

      // **Workspace Table**
      if (workspaceData) {
        await insertData(
          "workspace",
          {
            gid: workspaceData.gid,
            name: workspaceData.name,
            resource_type: workspaceData.resource_type,
          },
          "gid"
        );

        // **Task-Workspace Relationship**
        await insertData(
          "task_workspace",
          {
            task_gid: taskData.gid,
            workspace_gid: workspaceData.gid,
          },
          "task_gid"
        );
      }

      // **Subtasks Table**
      for (let subtask of subtasksDataArray) {
        await insertData(
          "subtasks",
          {
            gid: subtask.gid,
            name: subtask.name,
            task_gid: taskData.gid, // Linking subtask to the task
          },
          "gid"
        );
      }

      // **Assignee (Users Table)**
      if (assignee) {
        await insertData(
          "users",
          {
            gid: assignee.gid,
            name: assignee.name,
            email: assignee.email || null,
            photo: assignee.photo || null,
            workspace: workspaceId,
          },
          "gid"
        );

        // **Task-Assignee Relationship**
        await insertData(
          "task_assignees",
          {
            task_gid: taskData.gid,
            assignee_gid: assignee.gid,
          },
          "task_gid"
        );
      }

      for (let comment of commentDataArray) {
        // Insert user who created the comment
        const createdBy = comment.created_by;
        if (createdBy) {
          await insertData(
            "users",
            {
              gid: createdBy.gid,
              name: createdBy.name,
              email: createdBy.email || null,
              photo: createdBy.photo || null,
              workspace: workspaceId,
            },
            "gid" // Ensure conflict resolution based on the gid field
          );
        }
      
        // Insert comment with task_gid
        await insertData(
          "comments",
          {
            gid: comment.gid,
            created_at: comment.created_at,
            text: comment.text,
            user_gid: createdBy?.gid || null, // Reference to the user who created the comment
            created_by_gid: createdBy?.gid || null, // Aligning with the new schema
            created_by_name: createdBy?.name || null,
            created_by_resource_type: createdBy?.resource_type || null,
            resource_type: comment.resource_type,
            type: comment.type,
            resource_subtype: comment.resource_subtype,
            task_gid: taskData.gid, // Associating the comment with its task
          },
          "gid" // Conflict resolution based on the primary key gid
        );
      }
      
      // for (let comment of commentDataArray) {
      //   // Insert user who created the comment
      //   const createdBy = comment.created_by;
      //   if (createdBy) {
      //     await insertData(
      //       "users",
      //       {
      //         gid: createdBy.gid,
      //         name: createdBy.name,
      //         email: createdBy.email || null,
      //         photo: createdBy.photo || null,
      //         workspace: workspaceId,
      //       },
      //       "gid" // Ensure conflict resolution based on the gid field
      //     );
      //   }
      
      //   // Insert comment
      //   await insertData(
      //     "comments",
      //     {
      //       gid: comment.gid,
      //       created_at: comment.created_at,
      //       text: comment.text,
      //       user_gid: createdBy?.gid || null, // Reference to the user who created the comment
      //       created_by_gid: createdBy?.gid || null, // Aligning with the new schema
      //       created_by_name: createdBy?.name || null,
      //       created_by_resource_type: createdBy?.resource_type || null,
      //       resource_type: comment.resource_type,
      //       type: comment.type,
      //       resource_subtype: comment.resource_subtype,
      //     },
      //     "gid" // Conflict resolution based on the primary key gid
      //   );
      // }
      
      // **Comments Table**
      // for (let comment of commentDataArray) {
      //   // Insert user who created the comment
      //   const createdBy = comment.created_by;
      //   if (createdBy) {
      //     await insertData(
      //       "users",
      //       {
      //         gid: createdBy.gid,
      //         name: createdBy.name,
      //         email: createdBy.email || null,
      //         photo: createdBy.photo || null,
      //         workspace: workspaceId,
      //       },
      //       "gid"
      //     );
      //   }

      //   // Insert comment
      //   await insertData(
      //     "comments",
      //     {
      //       gid: comment.gid,
      //       text: comment.text,
      //       created_at: comment.created_at,
      //       task_gid: taskData.gid,
      //       user_gid: createdBy?.gid || null,
      //     },
      //     "text"
      //   );
      // }
    }

    console.log("Data stored successfully.");
    return res.status(200).json({
      message: "Tasks, subtasks, comments, users, and related data stored successfully.",
    });
  } catch (error) {
    console.error("Error storing task data:", error);
    return res.status(500).json({
      error: "An error occurred while storing task data.",
      details: error.message,
    });
  }
};




// const { getTaskDataFromAsana } = require("../../services/asanaService1");
// const { insertData, fetchData } = require("../../database/postgres"); // Import PostgreSQL functions

// const workspaceId = "5346996849245";
// // const workspaceId = "1209047105922798";
// const projectId = "455611946112906";
// // const projectId = "1209047157633629";

// // Store tasks, subtasks, comments, and users from Asana to the database
// const storeTaskData = async (req, res) => {
//   try {
//     const tasksWithDetails = await getTaskDataFromAsana(workspaceId, projectId);
//     for (let taskDetails of tasksWithDetails) {
//       const taskData = taskDetails.taskData;
//       const subtasksData = Array.isArray(taskDetails.subtasks)
//         ? taskDetails.subtasks
//         : [];
//       const commentsData = Array.isArray(taskDetails.comments)
//         ? taskDetails.comments
//         : [];

//         const commentDataArray = taskDetails.commentsData.data;
//         const subtasksDataArray = taskDetails.subtasksData.data;
//       const assignee = taskDetails.assignee;

//     console.log("taskData",taskData)
//     // console.log("assignee",assignee)
//     // console.log("commentDataArray",commentDataArray)

//       // Upsert task
//       await insertData(
//         "tasks",
//         {
//           gid: taskData.gid,
//           name: taskData.name,
//           due_on: taskData.due_on,
//           notes: taskData.notes,
//         },
//         "gid"
//       );

//       // Upsert subtasks
//       if (subtasksDataArray.length > 0) {
//         for (let subtask of subtasksDataArray) {
//           // Ensure the subtask is upserted with the correct task_gid reference
//           await insertData(
//             "subtasks",
//             {
//               gid: subtask.gid,
//               name: subtask.name,
//               task_gid: taskData.gid, // Linking subtask to the task
//             },
//             "gid"
//           );
//         }
//       }

//       // Upsert assignee (user for the task)
//       // Upsert assignee (user for the task)
//       if (assignee) {
//         await insertData(
//           "users",
//           {
//             gid: assignee.gid,
//             name: assignee.name,
//             email: assignee.email || null,
//             photo: assignee.photo || null,
//             workspace: workspaceId,
//           },
//           "gid"
//         );

//         // Upsert task-assignee link
//         await insertData(
//           "task_assignees",
//           {
//             task_gid: taskData.gid, // Linking task to the assignee
//             assignee_gid: assignee.gid, // Correct column name for assignee ID
//           },
//           "task_gid"
//         );
//       }
//     //   console.log("commentsData.length",commentsData.length)
//       // Upsert comments and their creators (users)
//       if (commentDataArray.length > 0) {
//         for (let comment of commentDataArray) {
//             // console.log("comment",comment)
//           // Ensure the user who created the comment is stored
//           await insertData(
//             "users",
//             {
//               gid: comment.created_by.gid,
//               name: comment.created_by.name,
//               email: comment.created_by.email || null,
//               photo: comment.created_by.photo || null,
//               workspace: workspaceId,
//             },
//             "gid"
//           );
//           // Upsert the comment
//           await insertData(
//             "comments",
//             {
//               text: comment.text,
//               created_at: comment.created_at,
//               task_gid: taskData.gid,
//               user_gid: comment.created_by.gid, // Linking comment to the user who created it
//             },
//             "text"
//           );
//         }
//       }
//     }

//     //   for (let taskDetails of tasksWithDetails) {
//     //     const taskData = taskDetails.taskData;
//     //     const subtasksData = Array.isArray(taskDetails.subtasks) ? taskDetails.subtasks : [];
//     //     const commentsData = Array.isArray(taskDetails.comments) ? taskDetails.comments : [];
//     //     const assignee = taskDetails.assignee;

//     //     // Upsert task
//     //     await insertData(
//     //       "tasks",
//     //       {
//     //         gid: taskData.gid,
//     //         name: taskData.name,
//     //         due_on: taskData.due_on,
//     //         notes: taskData.notes,
//     //       },
//     //       "gid"
//     //     );

//     //     // Upsert subtasks
//     //     if (subtasksData.length > 0) {
//     //       for (let subtask of subtasksData) {
//     //         await insertData(
//     //           "subtasks",
//     //           {
//     //             gid: subtask.gid,
//     //             name: subtask.name,
//     //             task_gid: taskData.gid, // Linking subtask to the task
//     //           },
//     //           "gid"
//     //         );
//     //       }
//     //     }

//     //     // Upsert assignee (user for the task)
//     //     if (assignee) {
//     //       await insertData(
//     //         "users",
//     //         {
//     //           gid: assignee.gid,
//     //           name: assignee.name,
//     //           email: assignee.email || null,
//     //           photo: assignee.photo || null,
//     //           workspace: workspaceId,
//     //         },
//     //         "gid"
//     //       );

//     //       // Upsert task-assignee link
//     //       await insertData(
//     //         "task_assignees",
//     //         {
//     //           task_gid: taskData.gid,
//     //           user_gid: assignee.gid,
//     //         },
//     //         "task_gid"
//     //       );
//     //     }

//     //     // Upsert comments and their creators (users)
//     //     if (commentsData.length > 0) {
//     //       for (let comment of commentsData) {
//     //         // Ensure the user who created the comment is stored
//     //         await insertData(
//     //           "users",
//     //           {
//     //             gid: comment.created_by.gid,
//     //             name: comment.created_by.name,
//     //             email: comment.created_by.email || null,
//     //             photo: comment.created_by.photo || null,
//     //             workspace: workspaceId,
//     //           },
//     //           "gid"
//     //         );

//     //         // Upsert the comment
//     //         await insertData(
//     //           "comments",
//     //           {
//     //             text: comment.text,
//     //             created_at: comment.created_at,
//     //             task_gid: taskData.gid,
//     //             user_gid: comment.created_by.gid, // Linking comment to the user who created it
//     //           },
//     //           "text"
//     //         );
//     //       }
//     //     }
//     //   }

//     console.log("Data stored successfully.");
//     return res
//       .status(200)
//       .json({
//         message: "Tasks, subtasks, comments, and users stored successfully.",
//       });
//   } catch (error) {
//     console.error("Error storing task data:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };




// Sir's Code Updation 

// const storeTaskData = async (req, res) => {
//     try {
//       const tasksWithDetails = await getTaskDataFromAsana(workspaceId, projectId);
//       console.log("Fetched tasks with details:", tasksWithDetails);

//       for (let taskDetails of tasksWithDetails) {
//         const taskData = taskDetails.taskData;
//         const subtasksData = Array.isArray(taskDetails.subtasks) ? taskDetails.subtasks : [];
//         const commentsData = Array.isArray(taskDetails.comments) ? taskDetails.comments : [];
//         console.log("commentsData",commentsData)
//         const assignee = taskDetails.assignee;

//         // Upsert task
//         await insertData(
//           "tasks",
//           {
//             gid: taskData.gid,
//             name: taskData.name,
//             due_on: taskData.due_on,
//             notes: taskData.notes,
//           },
//           "gid"
//         );

//         // Upsert subtasks
//         for (let subtask of subtasksData) {
//           await insertData(
//             "subtasks",
//             {
//               gid: subtask.gid,
//               name: subtask.name,
//               task_gid: taskData.gid, // Linking subtask to the task
//             },
//             "gid"
//           );
//         }

//         // Upsert assignee (user for the task)
//         if (assignee) {
//           await insertData(
//             "users",
//             {
//               gid: assignee.gid,
//               name: assignee.name,
//               email: assignee.email || null,
//               photo: assignee.photo || null,
//               workspace: workspaceId,
//             },
//             "gid"
//           );

//           // Upsert task-assignee link
//           await insertData(
//             "task_assignees",
//             {
//               task_gid: taskData.gid,
//               user_gid: assignee.gid,
//             },
//             "task_gid"
//           );
//         }

//         // Upsert comments and their creators (users)
//         for (let comment of commentsData) {
//           await insertData(
//             "users",
//             {
//               gid: comment.created_by.gid,
//               name: comment.created_by.name,
//               email: comment.created_by.email || null,
//               photo: comment.created_by.photo || null,
//               workspace: workspaceId,
//             },
//             "gid"
//           );

//           await insertData(
//             "comments",
//             {
//               text: comment.text,
//               created_at: comment.created_at,
//               task_gid: taskData.gid,
//               user_gid: comment.created_by.gid, // Linking comment to the user who created it
//             },
//             "text"
//           );
//         }
//       }

//       console.log("Data stored successfully.");
//       return res.status(200).json({ message: "Tasks, subtasks, comments, and users stored successfully." });

//     } catch (error) {
//       console.error("Error storing task data:", error);
//       return res.status(500).json({ error: error.message });
//     }
//   };

// const storeTaskData = async (req, res) => {
//   try {
//     const tasksWithDetails = await getTaskDataFromAsana(workspaceId, projectId);
//     console.log("tasksWithDetails", tasksWithDetails);

//     for (let taskDetails of tasksWithDetails) {
//       const taskData = taskDetails.taskData;
//       const subtasksData = taskDetails.subtasks;
//       const commentsData = taskDetails.comments;
//       const assignee = taskDetails.assignee;

//       // Upsert task
//       await insertData('tasks', {
//         gid: taskData.gid,
//         name: taskData.name,
//         due_on: taskData.due_on,
//         notes: taskData.notes,
//       }, 'gid');

//       // Upsert subtasks
//       for (let subtask of subtasksData) {
//         await insertData('subtasks', {
//           gid: subtask.gid,
//           name: subtask.name,
//           task_gid: taskData.gid, // Linking subtask to the task
//         }, 'gid');
//       }

//       // Upsert assignee (user for the task)
//       if (assignee) {
//         await insertData('users', {
//           gid: assignee.gid,
//           name: assignee.name,
//           email: assignee.email || null,
//           photo: assignee.photo || null,
//           workspace: workspaceId,
//         }, 'gid');

//         // Upsert task assignee link
//         await insertData('task_assignees', {
//           task_gid: taskData.gid,
//           user_gid: assignee.gid,
//         }, 'task_gid');
//       }

//       // Upsert comments and their creators (users)
//       for (let comment of commentsData) {
//         await insertData('users', {
//           gid: comment.created_by.gid,
//           name: comment.created_by.name,
//           email: comment.created_by.email || null,
//           photo: comment.created_by.photo || null,
//           workspace: workspaceId,
//         }, 'gid');

//         await insertData('comments', {
//           text: comment.text,
//           created_at: comment.created_at,
//           task_gid: taskData.gid,
//           user_gid: comment.created_by.gid, // Linking comment to the user who created it
//         }, 'text');
//       }
//     }

//     console.log('Tasks, subtasks, comments, and users stored successfully.');
//     return res.status(200).json({ message: 'Tasks, subtasks, comments, and users stored successfully.' });

//   } catch (error) {
//     console.error("Error storing task data:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };

// Fetch task details with user and comment info from the database
const fetchTaskData = async (req, res) => {
  try {
    // Prevent caching
    res.setHeader("Cache-Control", "no-store");

    // Store tasks
    await storeTaskData(req, res);

    // Fetch tasks and their details
    const tasksWithDetails = [];
    const tasks = await fetchData("tasks", {});

    if (!tasks || tasks.length === 0) {
      if (!res.headersSent) {
        return res.status(404).json({ error: "No tasks found." });
      }
    }

    // Fetch additional details for each task
    for (let task of tasks) {
      const subtasks = await fetchData("subtasks", { task_gid: task.gid });
      const comments = await fetchData("comments", { task_gid: task.gid });
      const assignee = await fetchData("task_assignees", {
        task_gid: task.gid,
      });

      tasksWithDetails.push({
        taskData: task,
        subtasks: subtasks,
        comments: comments,
        assignee: assignee.length > 0 ? assignee[0] : null,
      });
    }

    console.log("Fetched task details successfully.");

    if (!res.headersSent) {
      return res.status(200).json({ tasks: tasksWithDetails });
    }
  } catch (error) {
    console.error("Error fetching task data:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
  }
};

// const fetchTaskData = async (req, res) => {
//   try {
//     // Step 1: Store tasks
//     await storeTaskData(req, res);

//     // Step 2: Fetch tasks and their details
//     let tasksWithDetails = [];
//     const tasks = await fetchData('tasks', {});

//     if (!tasks || tasks.length === 0) {
//       return res.status(404).json({ error: 'No tasks found.' });
//     }

//     for (let task of tasks) {
//       const subtasks = await fetchData('subtasks', { task_gid: task.gid });
//       const comments = await fetchData('comments', { task_gid: task.gid });
//       const assignee = await fetchData('task_assignees', { task_gid: task.gid });

//       tasksWithDetails.push({
//         taskData: task,
//         subtasks: subtasks,
//         comments: comments,
//         assignee: assignee.length > 0 ? assignee[0] : null,
//       });
//     }

//     console.log("Fetched task details successfully.");
//     return res.status(200).json({ tasks: tasksWithDetails });

//   } catch (error) {
//     console.error("Error fetching task data:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };

// last commented
// // Store tasks, subtasks, comments, and users from Asana to the database
// const storeTaskData = async (req, res) => {
//   try {
//     const tasksWithDetails = await getTaskDataFromAsana(workspaceId,projectId);
//     console.log("tasksWithDetails", tasksWithDetails);

//     for (let taskDetails of tasksWithDetails) {
//       const taskData = taskDetails.taskData;
//       const subtasksData = taskDetails.subtasks;
//       const commentsData = taskDetails.comments;
//       const assignee = taskDetails.assignee;

//       // Store task
//       await insertData('tasks', {
//         gid: taskData.gid,
//         name: taskData.name,
//         due_on: taskData.due_on,
//         notes: taskData.notes,
//       });

//       // Store subtasks
//       for (let subtask of subtasksData) {
//         await insertData('subtasks', {
//           gid: subtask.gid,
//           name: subtask.name,
//           task_gid: taskData.gid, // Linking subtask to the task
//         });
//       }

//       // Store assignee (user for the task)
//       if (assignee) {
//         let user = await fetchData('users', { gid: assignee.gid });

//         if (!user || user.length === 0) {
//           await insertData('users', {
//             gid: assignee.gid,
//             name: assignee.name,
//             email: assignee.email || null,
//             photo: assignee.photo || null,
//             workspace: workspaceId,
//           });
//         }

//         // Update task to assign user
//         await insertData('task_assignees', {
//           task_gid: taskData.gid,
//           user_gid: assignee.gid,
//         });
//       }

//       // Store comments and their creators (users)
//       for (let comment of commentsData) {
//         let creator = await fetchData('users', { gid: comment.created_by.gid });

//         if (!creator || creator.length === 0) {
//           await insertData('users', {
//             gid: comment.created_by.gid,
//             name: comment.created_by.name,
//             email: comment.created_by.email || null,
//             photo: comment.created_by.photo || null,
//             workspace: workspaceId,
//           });
//         }

//         await insertData('comments', {
//           text: comment.text,
//           created_at: comment.created_at,
//           task_gid: taskData.gid,
//           user_gid: comment.created_by.gid, // Linking comment to the user who created it
//         });
//       }
//     }

//     console.log('Tasks, subtasks, comments, and users stored successfully.');
//     return res.status(200).json({ message: 'Tasks, subtasks, comments, and users stored successfully.' });

//   } catch (error) {
//     console.error("Error storing task data:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };

// // Fetch task details with user and comment info from the database
// const fetchTaskData = async (req, res) => {
//     try {
//       // Step 1: Store tasks
//       const storeResponse = await storeTaskData(req, res);
//       if (storeResponse.error) {
//         if (!res.headersSent) {
//           return res.status(500).json({ error: storeResponse.error });
//         }
//         return;
//       }

//       // Step 2: Fetch tasks and their details
//       let tasksWithDetails = [];
//       const tasks = await fetchData('tasks', {});
//       console.log("tasks", tasks);

//       if (!tasks || tasks.length === 0) {
//         return res.status(404).json({ error: 'No tasks found.' });
//       }

//       for (let task of tasks) {
//         const subtasks = await fetchData('subtasks', { taskid: task.gid }); // Use correct column
//         const comments = await fetchData('comments', { taskid: task.gid });
//         const assignee = await fetchData('task_assignees', { taskid: task.gid });

//         tasksWithDetails.push({
//           taskData: task,
//           subtasks: subtasks,
//           comments: comments,
//           assignee: assignee.length > 0 ? assignee[0] : null,
//         });
//       }

//       console.log("Fetched task details successfully.");
//       return res.status(200).json({ tasks: tasksWithDetails });

//     } catch (error) {
//       console.error("Error fetching task data:", error);
//       if (!res.headersSent) {
//         return res.status(500).json({ error: error.message });
//       }
//     }
//   };

// const fetchTaskData = async (req, res) => {
//     try {
//       const storeResponse = await storeTaskData(req, res);  // Correct function name

//       // If storing tasks was unsuccessful, handle the error
//       if (storeResponse.error) {
//           return res.status(500).json({ error: storeResponse.error });
//       }

//       const tasksWithDetails = [];
//       const tasks = await fetchData('tasks', {});
//       console.log("tasks", tasks);

//       if (!tasks || tasks.length === 0) {
//         return res.status(404).json({ error: 'No tasks found.' });
//       }

//       for (let task of tasks) {
//         const subtasks = await fetchData('subtasks', { task_gid: task.gid });
//         const comments = await fetchData('comments', { task_gid: task.gid });
//         const assignee = await fetchData('task_assignees', { task_gid: task.gid });

//         tasksWithDetails.push({
//           taskData: task,
//           subtasks: subtasks,
//           comments: comments,
//           assignee: assignee.length > 0 ? assignee[0] : null,
//         });
//       }

//       console.log("Fetched task details successfully.");
//       return res.status(200).json({ tasks: tasksWithDetails });

//     } catch (error) {
//       console.error("Error fetching task data:", error);
//       return res.status(500).json({ error: error.message });
//     }
//   };

module.exports = {
  storeTaskData,
  fetchTaskData,
};
