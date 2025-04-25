const mongoose = require('mongoose');

const UserDataSchema = new mongoose.Schema({
    gid: { type: String, unique: true, required: true }, // User ID from Asana
    name: { type: String, required: true },
    email: { type: String },
    photo: { type: String }, // Profile photo URL
    workspace: { type: String }, // Workspace ID
    created_at: { type: Date },
});

module.exports = mongoose.model('UserData', UserDataSchema);

