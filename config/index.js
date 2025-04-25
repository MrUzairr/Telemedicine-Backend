const dotenv = require('dotenv').config();
const PORT = process.env.PORT;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH;
<<<<<<< HEAD
const ASANA_PAT = process.env.ASANA_PAT; // Load from .env file
=======
>>>>>>> 9639cbf (Add Backend Code)

module.exports = {
    PORT,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
<<<<<<< HEAD
    BACKEND_SERVER_PATH,
    ASANA_PAT
=======
    BACKEND_SERVER_PATH
>>>>>>> 9639cbf (Add Backend Code)
}