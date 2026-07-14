const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('./env');

let io;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Authentication Middleware for WebSocket Connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-review', ({ reviewId, userName, initials }) => {
      const room = `review:${reviewId}`;
      socket.join(room);
      socket.userName = userName;
      socket.initials = initials;
      socket.reviewId = reviewId;

      // Broadcast new collaborator presence to others in the room
      socket.to(room).emit('collaborator-joined', {
        userId: socket.userId,
        userName,
        initials,
      });

      // Send the current active list of users in this room back to the joiner
      sendRoomUsersList(room, socket);
    });

    socket.on('leave-review', ({ reviewId }) => {
      const room = `review:${reviewId}`;
      socket.leave(room);
      socket.to(room).emit('collaborator-left', {
        userId: socket.userId,
      });
    });

    socket.on('disconnect', () => {
      if (socket.reviewId) {
        const room = `review:${socket.reviewId}`;
        socket.to(room).emit('collaborator-left', {
          userId: socket.userId,
        });
      }
    });
  });

  return io;
};

const sendRoomUsersList = async (room, socket) => {
  const sockets = await io.in(room).fetchSockets();
  const users = sockets.map(s => ({
    userId: s.userId,
    userName: s.userName,
    initials: s.initials,
  }));
  // Send to socket
  socket.emit('collaborators-list', users);
};

module.exports = { init };
