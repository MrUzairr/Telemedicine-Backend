const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    gid: { type: String, required: true },
    name: { type: String, required: true },
    assignee: { type: String, required: false },  // Assignee gid stored as a string
    due_on: { type: Date, required: true },
    notes: { type: String, required: false },
    project: { type: String, required: true },  // Project gid as a string
    workspace: { type: String, required: true },  // Workspace gid as a string
});

const TaskData = mongoose.model('TaskData', taskSchema);
module.exports = TaskData;




// const mongoose = require('mongoose');

// const taskDataSchema = new mongoose.Schema({
//     gid: { type: String, required: true, unique: true },
//     name: { type: String, required: true },
//     notes: { type: String },
//     due_on: { type: String },
//     assignee: { type: String },
//     // assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData' },
//     project: { type: String },
//     workspace: { type: String },
//     createdAt: { type: Date, default: Date.now },
// });

// // Check if the model already exists before defining it
// module.exports = mongoose.model('TaskData', taskDataSchema);
