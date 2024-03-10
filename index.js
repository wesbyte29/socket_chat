import { Server } from 'socket.io';
import { createServer} from 'node:http';
import express from 'express';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';


const app = express(); // create express app
const server = createServer(app); // create an http server
const io = new Server(server); // create the socket.io server
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
   res.sendFile(join(__dirname, 'index.html'));
})

io.on('connection', (socket) => {
   console.log('a user connected');

   socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      io.emit('chat message', msg);
   })

   socket.on('disconnect', () => {
      console.log('a user disconnected');
   })
})


server.listen(3000, () => {
   console.log('Server running on localhost:3000');
})