const express = require('express');
const { storeTaskData, fetchTaskData } = require('../../controller/asanaController/asanaController1'); // Adjust path as needed
const router = express.Router(); 
const {fetchData} = require("../../database/postgres");

// POST route to store tasks, subtasks, comments, and users from Asana into the database
router.post('/store-tasks', async (req, res) => {
  try {
    await storeTaskData(req, res);
  } catch (error) {
    console.error("Error in route /store-tasks:", error);
    res.status(500).json({ error: "Failed to store task data" });
  }
});

// GET route to fetch tasks, subtasks, comments, and users from the database
router.get('/fetch-tasks', async (req, res) => {
  try {
    await fetchTaskData(req, res);
  } catch (error) {
    console.error("Error in route /fetch-tasks:", error);
    res.status(500).json({ error: "Failed to fetch task data" });
  }
});

// Route to fetch all data
router.get('/data/:tableName', async (req, res) => {
  const { tableName } = req.params;

  try {
    const data = await fetchData(tableName); // Fetch all data from the specified table
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Error fetching data' });
  }
});


module.exports = router;
