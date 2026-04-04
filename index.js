import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = http.createServer(app);

app.get('/', (req, res) => {
  res.send("Server is running")
})

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST']
  }
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`user:connected ${socket.id}`);
  // 1. log when any user conncted with socket id

  socket.on('user:register', (data) => {
    // 2. pass data as a parameter with user registration event
    try {
      if (!data.id || !data.username) {
        throw new Error('Invalid user data');
      }
      // 3. if id and username is not pass in the data, throw error

      connectedUsers.set(socket.id, data);
      console.log(`user:registered`, data);
      // 4. store socket id as key and data as value in connected users map data

      socket.emit('user:registered', {
        success: true,
        socketId: socket.id
      });
      // 5. emit the user registered event with success and socket id
    }
    catch (e) {
      socket.emit('error', 'registration failed');
    }
  });

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    // 6. get the socket id from connceted users map data

    if(user) {
      connectedUsers.delete(socket.id);
      console.log(`user:disconnected`, socket.id);
    }
    // 7. if user exists then delete socket id from connected users map data
  });
})

httpServer.listen(3000, () => {
  console.info(`server is running at 127.0.0.1:3000`);
});





// import express, { Request, Response } from 'express';
// import http from 'http';
// import { Server, Socket } from 'socket.io';

// const app = express();
// const httpServer = http.createServer(app);

// app.get('/', (_req: Request, res: Response) => {
//   res.send('Server is running');
// });

// /**
//  * Types
//  */
// type User = {
//   id: string;
//   username: string;
// };

// /**
//  * In-memory stores
//  */
// const socketToUser = new Map<string, User>();
// const userToSocket = new Map<string, string>();

// const io = new Server(httpServer, {
//   cors: {
//     origin: '*', // ⚠️ restrict in production
//     methods: ['GET', 'POST'],
//   },
// });

// io.on('connection', (socket: Socket) => {
//   console.log(`user:connected ${socket.id}`);

//   /**
//    * Register user
//    */
//   socket.on('user:register', (data: unknown) => {
//     try {
//       // Strong validation
//       if (
//         typeof data !== 'object' ||
//         data === null ||
//         !('id' in data) ||
//         !('username' in data)
//       ) {
//         throw new Error('Invalid payload structure');
//       }

//       const { id, username } = data as User;

//       if (
//         typeof id !== 'string' ||
//         typeof username !== 'string' ||
//         !id.trim() ||
//         !username.trim()
//       ) {
//         throw new Error('Invalid user data');
//       }

//       // Prevent duplicate login (optional strategy)
//       if (userToSocket.has(id)) {
//         const oldSocketId = userToSocket.get(id);
//         if (oldSocketId) {
//           io.sockets.sockets.get(oldSocketId)?.disconnect();
//         }
//       }

//       // Store mappings
//       socketToUser.set(socket.id, { id, username });
//       userToSocket.set(id, socket.id);

//       console.log('user:registered', { id, username });

//       socket.emit('user:registered', {
//         success: true,
//         socketId: socket.id,
//       });

//     } catch (err) {
//       console.error('registration error:', err);

//       socket.emit('user:register:error', {
//         success: false,
//         message: 'Registration failed',
//       });
//     }
//   });

//   /**
//    * Disconnect cleanup (CRITICAL)
//    */
//   socket.on('disconnect', () => {
//     const user = socketToUser.get(socket.id);

//     if (user) {
//       userToSocket.delete(user.id);
//       socketToUser.delete(socket.id);

//       console.log(`user:disconnected ${user.username}`);
//     } else {
//       console.log(`socket disconnected ${socket.id}`);
//     }
//   });
// });

// httpServer.listen(3000, () => {
//   console.info('server running at http://127.0.0.1:3000');
// });