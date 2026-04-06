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
  },
  maxHttpBufferSize: 1e6 // Max message size (in bytes) - 1MB
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

  socket.on('message:send', (to, message) => {
    console.log(`message-${to, message}`);
    try {
      const from = socketToUser.get(socket.id);
      // set sender name to from variable

      if(!from) throw new Error('sender not registered');
      if(!to || !message) throw new Error('invalid payload');
      // check from and payload

      const target = userToSocket.get(to);
      if(!target) throw new Error('user not online');
      // verify target exists or not

      io.to(target).emit('message:receive', { from, message });
      console.log(`${from} -> ${to} : ${message}`);
      // send to the target and log the message
    }
    catch (e) {
      console.error(e);
      socket.emit('error', e.message);
    }
  })

  socket.on('disconnect', () => {
    const user = socketToUser.get(socket.id);
    // get the socket id from connceted users map data

    if (user) {
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