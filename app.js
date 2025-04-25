require('dotenv').config();
const express = require("express");
const path = require('path');
const database = require("./database/mongodb");
const cors = require('cors');
const bodyParser = require("body-parser");
const usersRoute = require("./routes/userRoutes");
const templateRoute = require('./routes/templateRoutes')
const doctorRoute = require('./routes/doctorRoutes')
const authRoute = require('./routes/authRoutes')
const errorHandler = require('./middleware/errorHandler')
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const PORT = process.env.PORT

// const productsRoute = require("../NodeApis/Route/productRoute");
// const ordersRoute = require("../NodeApis/Route/orderRoute");
// const axios = require('axios');

const app = express();

app.use(bodyParser.json());

const corsOptions = {
  credentials: true,
  origin: ['http://localhost:3000','http://localhost:3001']
}
app.use(cors(corsOptions));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Serve static files from the "public" directory
// app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, "public", "images")));
// Use the auth routes (refresh and logout)
// app.use("/api/auth", authRoute);
app.use("/api", usersRoute);
app.use("/doc", doctorRoute);
// app.get("/doc/getalldoctors", (req, res) => {
//   // Example response
//   res.json({
//     message: "Doctors retrieved successfully!",
//     data: [
//       {
//         _id: "6745cbadac064c9dd928ded5",
//         fullName: "Tanya Michael",
//         specialty: "cardiologist",
//         email: "ali@gmail.com",
//         phone: "03254744800",
//         profilePicture: "1732627373037.jpg", // File inside the public/images folder
//         biography: "Quis aliqua Possimu",
//         qualifications: "Quis aliqua Possimu",
//         status: "true",
//       },
//     ],
//   });
// });
app.use("/temp", templateRoute);
app.get('/', (req, res) => {
  res.send('This is a Node.js API endpoint');
});

// app.use(cors());
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// app.options('*', cors()); 

// app.use("/product-api", productsRoute);
// app.use("/order-api", ordersRoute);

// Serve static files from the "public" directory
// app.use(express.static(path.join(__dirname, 'public')));
// Serve static files
// app.use("/images", express.static(path.join(__dirname, "public/images")));
// Example endpoint for Node.js API


// Proxy endpoint to Python API
// app.get('/py', async (req, res) => {
//   try {
//     const response = await axios.get('http://127.0.0.1:5000/app_py/getbooks');
//     res.send(response.data);
//   } catch (error) {
//     console.error('Error communicating with Python API:', error.message);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is Listening on PORT: ${PORT}`);
});