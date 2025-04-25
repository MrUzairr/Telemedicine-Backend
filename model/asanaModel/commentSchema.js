const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: { type: String, required: true },
    created_at: { type: Date, required: true },
    task: { type: String, required: true },  // Make sure this is a string, not ObjectId
    created_by: { type: String, required: true },  // Store user gid as a string
});

const CommentData = mongoose.model('CommentData', commentSchema);
module.exports = CommentData;







// const mongoose = require('mongoose');
// const CommentDataSchema = new mongoose.Schema({
//     gid: { type: String, unique: true, required: true }, // Comment ID from Asana
//     task: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskData', required: true }, // Reference to Task
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData', required: true }, // Reference to User who made the comment
//     text: { type: String, required: true },
//     created_at: { type: Date, required: true },
//     modified_at: { type: Date },
// });

// module.exports = mongoose.model('CommentData', CommentDataSchema);
