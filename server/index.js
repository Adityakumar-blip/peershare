const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const cors = require("cors");

const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

const rooms = {};

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(socket.id);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  socket.on("offer", (offer, roomId) => {
    socket.broadcast.to(roomId).emit("offer", offer);
  });

  socket.on("answer", (answer, roomId) => {
    console.log("Socket answer", answer);
    socket.broadcast.to(roomId).emit("answer", answer);
  });

  socket.on("candidate", (candidate, roomId) => {
    socket.broadcast.to(roomId).emit("candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
