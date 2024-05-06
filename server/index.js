import express from 'express';  
import bodyParser from 'body-parser';
import { Server as SocketIO } from 'socket.io';
import http from 'http';
import cors from 'cors';;
const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new SocketIO(server, { cors: true });

app.use(bodyParser.json(),cors());

app.get('/', (req, res) => {
  res.send('Server is Running');
});

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

io.on('connection', socket => {
  console.log("New Connection detected");
  
  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log(roomId, emailId);
    console.log("User Connected", data);
    emailToSocketMap.set(emailId, socket.id);
    socketToEmailMap.set(socket.id, emailId);
    socket.join(roomId);
    socket.emit('joined-room', data);
    socket.broadcast.to(roomId).emit('user-joined', {emailId});
  });

  socket.on('call-user', (data) => {
    const { emailId, offer } = data;
    const fromEmail = socketToEmailMap.get(socket.id);
    const userSocketId = emailToSocketMap.get(emailId);

    if (userSocketId) {
      io.to(userSocketId).emit("incoming-call", { caller: fromEmail, offer});
    }
  });

  socket.on('call-accepted',(data)=>{
    const {caller, ans} = data;
    const socketId = emailToSocketMap.get(caller)
    socket.to(socketId).emit("Call Accepted: ",ans)
  })
  socket.on('disconnect', () => {
    const emailId = socketToEmailMap.get(socket.id);
    if (emailId) {
      emailToSocketMap.delete(emailId);
      socketToEmailMap.delete(socket.id);
    }
  });
});

server.listen(port, () => {
  console.log(`Server Started on ${port}`);
});
