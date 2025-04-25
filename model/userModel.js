const mongoose = require('mongoose');

mongoose.userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    name:String,
    email: { type: String, unique: true, required: true, match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email address']},
    picture:String,
    password:String,
    zip_code: {type: String,match: [/^\d{5}$/, 'Invalid zip code format for Pakistan.']} ,
    gender: String,
    date_of_birth: {type: Date},
    
    isAdmin:{
        type:Boolean,
        default:false
    },
    is_varified: Boolean,

},
{
    timestamps: true
});

module.exports = mongoose.model('User', mongoose.userSchema);
