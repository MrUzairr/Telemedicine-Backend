const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '123',
  database: 'tasks',
  port: 5432,
});


async function insertData(tableName, data, conflictColumn = 'gid', updateOnConflict = false) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    // Build conflict handling query
    let conflictQuery = `ON CONFLICT (${conflictColumn}) DO NOTHING`;
    if (updateOnConflict) {
      const updates = Object.keys(data)
        .map((col) => `${col} = EXCLUDED.${col}`)
        .join(', ');
      conflictQuery = `ON CONFLICT (${conflictColumn}) DO UPDATE SET ${updates}`;
    }

    const query = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders})
      ${conflictQuery}
    `;
    await client.query(query, values);

    console.log(`${tableName} data inserted successfully`);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error inserting data into ${tableName}:`, err.message);
  } finally {
    client.release();
  }
}

async function insertTaskHierarchy(taskData) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log(`Processing Task: ${taskData.gid}`);

    // Insert task data
    await insertData('tasks', {
      gid: taskData.gid,
      name: taskData.name,
      notes: taskData.notes,
      permalink_url: taskData.permalink_url,
      completed: taskData.completed,
      completed_at: taskData.completed_at,
      created_at: taskData.created_at,
      modified_at: taskData.modified_at,
      num_hearts: taskData.num_hearts,
      num_likes: taskData.num_likes,
      assignee_status: taskData.assignee_status,
      custom_type: taskData.custom_type,
      resource_type: taskData.resource_type,
      resource_subtype: taskData.resource_subtype,
    });

    // Insert related custom fields
    for (const field of taskData.custom_fields || []) {
      await insertData('custom_fields', {
        gid: field.gid,
        task_gid: taskData.gid,
        name: field.name,
        description: field.description,
        display_value: field.display_value,
        resource_subtype: field.resource_subtype,
        type: field.type,
        is_formula_field: field.is_formula_field,
        is_value_read_only: field.is_value_read_only,
      });
    }

    // Insert related followers
    for (const follower of taskData.followers || []) {
      await insertData('followers', {
        gid: follower.gid,
        task_gid: taskData.gid,
        name: follower.name,
        resource_type: follower.resource_type,
      });
    }

    // Insert related projects
    for (const project of taskData.projects || []) {
      await insertData('projects', {
        gid: project.gid,
        task_gid: taskData.gid,
        name: project.name,
        resource_type: project.resource_type,
      });
    }

    // Insert workspace and link it to the task
    if (taskData.workspace) {
      await insertData('workspace', {
        gid: taskData.workspace.gid,
        name: taskData.workspace.name,
        resource_type: taskData.workspace.resource_type,
      });

      await insertData('task_workspace', {
        task_gid: taskData.gid,
        workspace_gid: taskData.workspace.gid,
      });
    }

    // Insert subtasks
    for (const subtask of taskData.subtasks || []) {
      await insertData('subtasks', {
        gid: subtask.gid,
        name: subtask.name,
        task_gid: taskData.gid,
      });
    }

    // Insert comments and handle their authors
    for (const comment of taskData.comments || []) {
      if (comment.created_by) {
        await insertData('users', {
          gid: comment.created_by.gid,
          name: comment.created_by.name,
          email: comment.created_by.email || null,
          photo: comment.created_by.photo || null,
        });
      }

      await insertData('comments', {
        text: comment.text,
        created_at: comment.created_at,
        task_gid: taskData.gid,
        user_gid: comment.created_by?.gid || null,
      });
    }

    await client.query('COMMIT');
    console.log(`Task hierarchy inserted successfully for Task: ${taskData.gid}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error inserting task hierarchy: ${err.message}`);
  } finally {
    client.release();
  }
}


// async function insertData(taskData) {
//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');

//     // Insert task data
//     const taskQuery = `
//       INSERT INTO tasks (gid, name, notes, permalink_url, completed, completed_at, created_at, modified_at, num_hearts, num_likes, assignee_status, custom_type, resource_type, resource_subtype)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
//       ON CONFLICT (gid) DO NOTHING
//     `;
//     await client.query(taskQuery, [
//       taskData.gid,
//       taskData.name,
//       taskData.notes,
//       taskData.permalink_url,
//       taskData.completed,
//       taskData.completed_at,
//       taskData.created_at,
//       taskData.modified_at,
//       taskData.num_hearts,
//       taskData.num_likes,
//       taskData.assignee_status,
//       taskData.custom_type,
//       taskData.resource_type,
//       taskData.resource_subtype,
//     ]);

//     // Insert custom fields
//     for (const field of taskData.custom_fields) {
//       const customFieldQuery = `
//         INSERT INTO custom_fields (gid, task_gid, name, description, display_value, resource_subtype, type, is_formula_field, is_value_read_only)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//         ON CONFLICT (gid) DO NOTHING
//       `;
//       await client.query(customFieldQuery, [
//         field.gid,
//         taskData.gid,
//         field.name,
//         field.description,
//         field.display_value,
//         field.resource_subtype,
//         field.type,
//         field.is_formula_field,
//         field.is_value_read_only,
//       ]);
//     }

//     // Insert followers
//     for (const follower of taskData.followers) {
//       const followerQuery = `
//         INSERT INTO followers (gid, task_gid, name, resource_type)
//         VALUES ($1, $2, $3, $4)
//         ON CONFLICT (gid) DO NOTHING
//       `;
//       await client.query(followerQuery, [
//         follower.gid,
//         taskData.gid,
//         follower.name,
//         follower.resource_type,
//       ]);
//     }

//     // Insert projects
//     for (const project of taskData.projects) {
//       const projectQuery = `
//         INSERT INTO projects (gid, task_gid, name, resource_type)
//         VALUES ($1, $2, $3, $4)
//         ON CONFLICT (gid) DO NOTHING
//       `;
//       await client.query(projectQuery, [
//         project.gid,
//         taskData.gid,
//         project.name,
//         project.resource_type,
//       ]);
//     }

//     // Insert workspace
//     const workspaceQuery = `
//       INSERT INTO workspace (gid, name, resource_type)
//       VALUES ($1, $2, $3)
//       ON CONFLICT (gid) DO NOTHING
//     `;
//     await client.query(workspaceQuery, [
//       taskData.workspace.gid,
//       taskData.workspace.name,
//       taskData.workspace.resource_type,
//     ]);

//     // Link task to workspace
//     const taskWorkspaceQuery = `
//       INSERT INTO task_workspace (task_gid, workspace_gid)
//       VALUES ($1, $2)
//       ON CONFLICT DO NOTHING
//     `;
//     await client.query(taskWorkspaceQuery, [taskData.gid, taskData.workspace.gid]);

//     await client.query('COMMIT');
//     console.log('Task data inserted successfully.');
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('Error inserting task data:', err.message);
//   } finally {
//     client.release();
//   }
// }




// const { Pool } = require('pg');

// // Database configuration
// const pool = new Pool({
//   host: 'localhost', // PostgreSQL server address
//   user: 'postgres', // PostgreSQL username
//   password: '123', // PostgreSQL password
//   database: 'tasks', // PostgreSQL database name
//   port: 5432, // PostgreSQL port (default is 5432)
// });

// // Generic function to insert data into any table with conflict handling
// async function insertData(tableName, data, conflictColumn = 'gid', updateOnConflict = false) {
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     // Foreign key validation (example: for 'comments' table)
//     if (tableName === 'comments') {
//       const userCheckQuery = `SELECT 1 FROM users WHERE gid = $1`;
//       const userCheckResult = await client.query(userCheckQuery, [data.user_gid]);

//       if (userCheckResult.rowCount === 0) {
//         console.error(`User with gid=${data.user_gid} does not exist.`);
//         await client.query('ROLLBACK');
//         return;
//       }
//     }

//     const columns = Object.keys(data).join(', ');
//     const values = Object.values(data);
//     const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

//     // Build conflict handling query
//     let conflictQuery = `ON CONFLICT (${conflictColumn}) DO NOTHING`;
//     if (updateOnConflict) {
//       const updates = Object.keys(data)
//         .map((col, index) => `${col} = EXCLUDED.${col}`)
//         .join(', ');
//       conflictQuery = `ON CONFLICT (${conflictColumn}) DO UPDATE SET ${updates}`;
//     }

//     const query = `
//       INSERT INTO ${tableName} (${columns})
//       VALUES (${placeholders})
//       ${conflictQuery}
//     `;
//     await client.query(query, values);

//     console.log(`${tableName} data inserted successfully`);
//     await client.query('COMMIT');
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error(`Error inserting data into ${tableName}:`, err.message);
//   } finally {
//     client.release();
//   }
// }

// Generic function to fetch data from any table
async function fetchData(tableName, conditions = {}) {
  const client = await pool.connect();
  try {
    let whereClause = '';
    const values = [];
    if (Object.keys(conditions).length > 0) {
      whereClause = 'WHERE ' + Object.keys(conditions)
        .map((key, index) => {
          values.push(conditions[key]);
          return `${key} = $${index + 1}`;
        })
        .join(' AND ');
    }

    const query = `SELECT * FROM ${tableName} ${whereClause}`;
    const result = await client.query(query, values);
    return result.rows;
  } catch (err) {
    console.error('Error fetching data:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Close the database connection
async function closeConnection() {
  await pool.end();
}

module.exports = {
  insertData,
  fetchData,
  insertTaskHierarchy,
  closeConnection,
};





// const { Pool } = require('pg');

// // Database configuration
// const pool = new Pool({
//   host: 'localhost', // PostgreSQL server address
//   user: 'postgres', // PostgreSQL username
//   password: '123', // PostgreSQL password
//   database: 'tasks', // PostgreSQL database name
//   port: 5432, // PostgreSQL port (default is 5432)
// });

// // Generic function to insert data into any table

// async function insertData(tableName, data) {
//   const client = await pool.connect();
//   try {
//     const columns = Object.keys(data).join(', ');
//     const values = Object.values(data);
//     const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

//     const query = `
//       INSERT INTO ${tableName} (${columns})
//       VALUES (${placeholders})
//       ON CONFLICT (gid) DO NOTHING
//     `;
//     await client.query(query, values);

//     console.log(`${tableName} data inserted successfully`);
//   } catch (err) {
//     console.error(`Error inserting data into ${tableName}:`, err.message);
//   } finally {
//     client.release();
//   }
// }

// // async function insertData(tableName, data) {
// //   const client = await pool.connect();
// //   try {
// //     await client.query('BEGIN');

// //     // Check if the record already exists
// //     const checkQuery = `SELECT 1 FROM ${tableName} WHERE gid = $1`;
// //     const checkResult = await client.query(checkQuery, [data.gid]);

// //     if (checkResult.rowCount > 0) {
// //       console.log(`Record with gid=${data.gid} already exists in ${tableName}`);
// //       await client.query('ROLLBACK');
// //       return; // Skip insertion if record already exists
// //     }

// //     // Foreign key validation (example: for 'comments' table)
// //     if (tableName === 'comments') {
// //       const userCheckQuery = `SELECT 1 FROM users WHERE gid = $1`;
// //       const userCheckResult = await client.query(userCheckQuery, [data.user_gid]);

// //       if (userCheckResult.rowCount === 0) {
// //         console.log(`User with gid=${data.user_gid} does not exist.`);
// //         await client.query('ROLLBACK');
// //         return;
// //       }
// //     }

// //     const columns = Object.keys(data).join(', ');
// //     const values = Object.values(data);
// //     const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

// //     const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
// //     await client.query(query, values);

// //     console.log(`${tableName} data inserted successfully`);
// //     await client.query('COMMIT');
// //   } catch (err) {
// //     await client.query('ROLLBACK');
// //     console.error(`Error inserting data into ${tableName}:`, err.message);
// //   } finally {
// //     client.release();
// //   }
// // }


// // async function insertData(tableName, data) {
// //   const client = await pool.connect();
// //   try {
// //     await client.query('BEGIN');

// //     // Foreign key validation (example: for 'comments' table)
// //     if (tableName === 'comments') {
// //       const userCheckQuery = `SELECT 1 FROM users WHERE gid = $1`;
// //       const userCheckResult = await client.query(userCheckQuery, [data.user_gid]);

// //       if (userCheckResult.rowCount === 0) {
// //         console.log(`User with gid=${data.user_gid} does not exist.`);
// //         await client.query('ROLLBACK');
// //         return;
// //       }
// //     }

// //     const columns = Object.keys(data).join(', ');
// //     const values = Object.values(data);
// //     const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

// //     const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
// //     await client.query(query, values);

// //     console.log(`${tableName} data inserted successfully`);
// //     await client.query('COMMIT');
// //   } catch (err) {
// //     await client.query('ROLLBACK');
// //     console.error(`Error inserting data into ${tableName}:`, err.message);
// //   } finally {
// //     client.release();
// //   }
// // }

// // Generic function to fetch data from any table
// async function fetchData(tableName, conditions = {}) {
//   const client = await pool.connect();
//   try {
//     let whereClause = '';
//     const values = [];
//     if (Object.keys(conditions).length > 0) {
//       whereClause = 'WHERE ' + Object.keys(conditions)
//         .map((key, index) => {
//           values.push(conditions[key]);
//           return `${key} = $${index + 1}`;
//         })
//         .join(' AND ');
//     }

//     const query = `SELECT * FROM ${tableName} ${whereClause}`;
//     const result = await client.query(query, values);
//     return result.rows;
//   } catch (err) {
//     console.error('Error fetching data:', err);
//     throw err;
//   } finally {
//     client.release();
//   }
// }

// // Close the database connection
// async function closeConnection() {
//   await pool.end();
// }

// module.exports = {
//   insertData,
//   fetchData,
//   closeConnection,
// };




// // // const { Client } = require('pg');
// // const { Pool } = require('pg');

// // // Database configuration
// // const pool = new Pool({
// //   host: 'localhost',        // PostgreSQL server address
// //   user: 'postgres',         // PostgreSQL username
// //   password: '123',          // PostgreSQL password
// //   database: 'tasks',        // PostgreSQL database name
// //   port: 5432,               // PostgreSQL port (default is 5432)
// // });
// // // Database configuration
// // // const client = new Client({
// // //     host: 'localhost',        // PostgreSQL server address
// // //     user: 'postgres',        // PostgreSQL username
// // //     password: '123',// PostgreSQL password
// // //     database: 'tasks',// PostgreSQL database name
// // //     port: 5432,               // PostgreSQL port (default is 5432)
// // // });
// // // Connect to PostgreSQL
// // pool.connect();

// // // Generic function to insert data into any table


// // async function insertData(tableName, data) {
// //   const client = await pool.connect(); // Use the pool here
// //   try {
// //     await client.query('BEGIN');

// //     // Example logic for foreign key validation (if needed)
// //     if (tableName === 'comments') {
// //       const userCheckQuery = `SELECT 1 FROM users WHERE gid = $1`;
// //       const userCheckResult = await client.query(userCheckQuery, [data.user_gid]);

// //       if (userCheckResult.rowCount === 0) {
// //         console.log(`User with gid=${data.user_gid} does not exist.`);
// //         await client.query('ROLLBACK');
// //         return;
// //       }
// //     }

// //     const columns = Object.keys(data).join(', ');
// //     const values = Object.values(data);
// //     const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

// //     const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
// //     await client.query(query, values);

// //     console.log(`${tableName} data inserted successfully`);
// //     await client.query('COMMIT');
// //   } catch (err) {
// //     await client.query('ROLLBACK');
// //     console.error(`Error inserting data into ${tableName}:`, err.message);
// //   } finally {
// //     client.release();
// //   }
// // }

// // // async function insertData(tableName, data) {
// // //   const client = await pool.connect();
// // //   try {
// // //     await client.query('BEGIN');

// // //     // Check if user_gid exists in the users table (for comments table insertion)
// // //     if (tableName === 'comments') {
// // //       const userCheckQuery = `SELECT 1 FROM users WHERE gid = $1`;
// // //       const userCheckResult = await client.query(userCheckQuery, [data.user_gid]);

// // //       if (userCheckResult.rowCount === 0) {
// // //         console.log(`User with gid=${data.user_gid} does not exist. Insert the user first.`);
// // //         await client.query('ROLLBACK');
// // //         return;
// // //       }
// // //     }

// // //     // Insert data
// // //     const columns = Object.keys(data).join(', ');
// // //     const values = Object.values(data);
// // //     const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

// // //     const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
// // //     await client.query(query, values);

// // //     console.log(`${tableName} data inserted successfully`);
// // //     await client.query('COMMIT');
// // //   } catch (err) {
// // //     await client.query('ROLLBACK');
// // //     console.error(`Error inserting data into ${tableName}:`, err.message);
// // //   } finally {
// // //     client.release();
// // //   }
// // // }

// // // async function insertData(tableName, data) {
// // //   try {
// // //     // Extract keys and values
// // //     const columns = Object.keys(data).join(', ');
// // //     const values = Object.values(data);
// // //     const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
// // //     // Check if the record already exists
// // //     const queryCheck = `SELECT 1 FROM ${tableName} WHERE gid = $1`;
// // //     const existingRecord = await client.query(queryCheck, [data.gid]);

// // //     if (existingRecord.rowCount > 0) {
// // //       console.log(`Record with gid=${data.gid} already exists in ${tableName}`);
// // //       return; // Skip insertion
// // //     }

// // //     // Create the query dynamically
// // //     const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

// // //     // Execute the query
// // //     await client.query(query, values);
// // //     console.log(`${tableName} data inserted successfully`);
// // //   } catch (err) {
// // //     console.error('Error inserting data:', err);
// // //   }
// // // }


// // // async function insertData(tableName, data) {
// // //   try {
// // //     // Extract keys (column names) and values
// // //     const columns = Object.keys(data).join(', ');
// // //     const values = Object.values(data);
// // //     const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

// // //     // Create the query dynamically
// // //     const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

// // //     // Execute the query
// // //     await client.query(query, values);
// // //     console.log(`${tableName} data inserted successfully`);
// // //   } catch (err) {
// // //     console.error('Error inserting data:', err);
// // //   }
// // // }

// // // Generic function to fetch data from any table
// // async function fetchData(tableName, conditions = {}) {
// //   try {
// //     // Build WHERE clause based on conditions
// //     let whereClause = '';
// //     const values = [];
// //     if (Object.keys(conditions).length > 0) {
// //       whereClause = 'WHERE ' + Object.keys(conditions)
// //         .map((key, index) => {
// //           values.push(conditions[key]);
// //           return `${key} = $${index + 1}`;
// //         })
// //         .join(' AND ');
// //     }

// //     // Build the query
// //     const query = `SELECT * FROM ${tableName} ${whereClause}`;

// //     // Execute the query
// //     const result = await client.query(query, values);
// //     return result.rows; // Return fetched data
// //   } catch (err) {
// //     console.error('Error fetching data:', err);
// //     throw err;
// //   }
// // }

// // // Close the database connection
// // async function closeConnection() {
// //   await client.end();
// // }

// // module.exports = {
// //   insertData,
// //   fetchData,
// //   closeConnection,
// // };







// // const { Pool } = require('pg');

// // // PostgreSQL configuration
// // const pool = new Pool({
// //     host: 'localhost',        // PostgreSQL server address
// //     user: 'postgres',        // PostgreSQL username
// //     password: '123',// PostgreSQL password
// //     database: 'tasks',// PostgreSQL database name
// //     port: 5432,               // PostgreSQL port (default is 5432)
// // });

// // // Test the connection
// // pool.connect((err, client, release) => {
// //     if (err) {
// //         console.error('Error connecting to PostgreSQL database:', err.stack);
// //         return;
// //     }
// //     console.log('PostgreSQL Database Connected');
// //     release(); // Release the client back to the pool
// // });

// // module.exports = pool;
