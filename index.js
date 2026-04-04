import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = http.createServer(app);

app.get('/', (req, res) => {
  res.send("Server is running")
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST']
  }
});

const socketToUser = new Map(); // socketId to username
const userToSocket = new Map(); // username to socketId

io.on('connection', (socket) => {
  console.log(`user:connected ${socket.id}`);
  // log when any user conncted with socket id

  socket.on('user:register', (username) => {
    // pass data as a parameter with user registration event

    try {
      if (!username) {
        throw new Error('Invalid user data');
      }
      // if id and username is not pass in the data, throw error

      socketToUser.set(socket.id, username);
      // set data like socket id as key and username as value

      userToSocket.set(username, socket.id);
      // set data like username as key and socket id as value

      console.log(`user:registered`, username);
      // store socket id as key and data as value in connected users map data

      socket.emit('user:registered', {
        success: true,
        socketId: socket.id,
        username: username
      });
      // emit the user registered event with success, socket id and username
    }
    catch (e) {
      socket.emit('error', 'registration failed');
    }
  });

  socket.on('disconnect', () => {
    const user = socketToUser.get(socket.id);
    // get the socket id from connceted users map data

    if(user) {
      socketToUser.delete(socket.id);
      userToSocket.delete(user);
      console.log(`user:disconnected`, user);
    }
    // if user exists then delete socket id and user from connected
  });
})

httpServer.listen(3000, () => {
  console.info(`server is running at http://127.0.0.1:3000`);
});