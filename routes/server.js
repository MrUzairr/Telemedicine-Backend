// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { fileURLToPath } from "url";
// import { dirname, join } from "path";

// const app = express();
// const server = createServer(app);
// const io = new Server(server);
// const allusers = {};

// // Resolve __dirname in ES Modules
// const __dirname = dirname(fileURLToPath(import.meta.url));

// // Serve index.html on GET request
// app.get("/", (req, res) => {
//     console.log("GET Request /");
//     res.sendFile(join(__dirname, "app", "index.html"));
// });

// // Expose the public directory
// app.use(express.static(join(__dirname, "public")));

// // Handle Socket.IO connections
// io.on("connection", (socket) => {
//     console.log(`Client connected with Socket ID: ${socket.id}`);

//     // Handle "join-user" event
//     socket.on("join-user", (username) => {
//         console.log(`${username} joined the socket connection`);

//         allusers[username] = { username, id: socket.id };
//         // inform everyone that someone joined
//         io.emit("joined", allusers);
//     });

//     socket.on("offer", ({ from, to, offer }) => {
//         console.log({ from, to, offer });
//         io.to(allusers[to].id).emit("offer", { from, to, offer });
//     });

//     socket.on("answer", ({ from, to, answer }) => {
//         io.to(allusers[from].id).emit("answer", { from, to, answer });
//     });

//     socket.on("icecandidate", (candidate) => {
//         console.log({ candidate });
//         // broadcast to other peers
//         socket.broadcast.emit("icecandidate", candidate);
//     });

//     socket.on("end-call", ({ from, to }) => {
//         io.to(allusers[to].id).emit("end-call", { from, to });
//     });

//     socket.on("call-ended", (caller) => {
//         const [from, to] = caller;
//         io.to(allusers[from].id).emit("call-ended", caller);
//         io.to(allusers[to].id).emit("call-ended", caller);
//     });
// });

// // Start the server
// server.listen(9000, () => {
//     console.log("Server is listening on port 9000");
// });






// import express from 'express';
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// const app = express();
// const server = createServer(app);
// const io = new Server(server);

// // To store all connected users and their socket ids
// const allusers = {};

// // Resolve __dirname in ES Modules
// const __dirname = dirname(fileURLToPath(import.meta.url));

// // Serve the index.html file on GET request
// app.get("/", (req, res) => {
//     console.log("GET Request /");
//     res.sendFile(join(__dirname, "app", "index.html"));
// });

// // Serve static files (e.g., images, CSS, client JS) from the public folder
// app.use(express.static(join(__dirname, "public")));

// // Handle Socket.IO connections
// io.on("connection", (socket) => {
//     console.log(`Client connected with Socket ID: ${socket.id}`);

//     // Handle user joining
//     socket.on("join-user", (username) => {
//         console.log(`${username} joined the socket connection`);

//         // Add user to the allusers object with their socket id
//         allusers[username] = { username, id: socket.id };
//         // Notify all clients that a user has joined
//         io.emit("joined", allusers);
//     });

//     // Handle offer from one user to another
//     socket.on("offer", ({ from, to, offer }) => {
//         console.log({ from, to, offer });
//         if (allusers[to]) {
//             // Send the offer to the 'to' user via their socket id
//             io.to(allusers[to].id).emit("offer", { from, to, offer });
//         }
//     });

//     // Handle the answer from the receiver of the offer
//     socket.on("answer", ({ from, to, answer }) => {
//         if (allusers[from]) {
//             // Send the answer back to the 'from' user
//             io.to(allusers[from].id).emit("answer", { from, to, answer });
//         }
//     });

//     // Handle ICE candidates (used for peer-to-peer connectivity)
//     socket.on("icecandidate", (candidate) => {
//         console.log({ candidate });
//         // Broadcast the candidate to the other peer
//         socket.broadcast.emit("icecandidate", candidate);
//     });

//     // Handle call termination (End the call on both sides)
//     socket.on("end-call", ({ from, to }) => {
//         if (allusers[to]) {
//             io.to(allusers[to].id).emit("end-call", { from, to });
//         }
//     });

//     // Handle the 'call-ended' event to notify both peers when the call ends
//     socket.on("call-ended", (caller) => {
//         const [from, to] = caller;
//         if (allusers[from]) {
//             io.to(allusers[from].id).emit("call-ended", caller);
//         }
//         if (allusers[to]) {
//             io.to(allusers[to].id).emit("call-ended", caller);
//         }
//     });

//     // Handle client disconnecting
//     socket.on("disconnect", () => {
//         // Remove the user from the list when they disconnect
//         const disconnectedUser = Object.keys(allusers).find(user => allusers[user].id === socket.id);
//         if (disconnectedUser) {
//             console.log(`${disconnectedUser} disconnected`);
//             delete allusers[disconnectedUser];
//             // Notify all clients about the updated user list
//             io.emit("joined", allusers);
//         }
//     });
// });

// // Start the server and listen on port 9000
// server.listen(9000, () => {
//     console.log("Server is listening on port 9000");
// });



import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
const server = createServer(app);
const io = new Server(server);
const allusers= {};

// Resolve __dirname in ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve index.html on GET request
app.get("/", (req, res) => {
    console.log("GET Request /");
    // res.send("Hello World");
    res.sendFile(join(__dirname, "app", "index.html"));
});

// Expose the public directory
app.use(express.static(join(__dirname, "public")));

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log(`Client connected with Socket ID: ${socket.id}`);

    // Handle "join-user" event
    socket.on("join-user", (username) => {
        console.log(`${username} joined the socket connection`);

        allusers[username] = { username, id: socket.id };
        // inform everyone that someone joined
        io.emit("joined", allusers);
    });
    
   

        
    socket.on("offer", ({from, to, offer}) => {
            console.log({from , to, offer });
            io.to(allusers[to].id).emit("offer", {from, to, offer});
        });  
        
        
    socket.on("answer", ({from, to, answer}) => {
            io.to(allusers[from].id).emit("answer", {from, to, answer});
         });    
    socket.on("icecandidate", candidate => {
            console.log({ candidate });
            //broadcast to other peers
            socket.broadcast.emit("icecandidate", candidate);
        });   

        socket.on("end-call", ({from, to}) => {
            io.to(allusers[to].id).emit("end-call", {from, to});
        });

        socket.on("call-ended", caller => {
            const [from, to] = caller;
            io.to(allusers[from].id).emit("call-ended", caller);
            io.to(allusers[to].id).emit("call-ended", caller);
        })

        
     
    });

    


// Start the server
server.listen(8000, () => {
    console.log("Server is listening on port 8000");
});
