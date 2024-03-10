import { Server } from 'socket.io';
import { createServer} from 'node:http';
import express from 'express';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';


const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
   res.sendFile(join(__dirname, 'index.html'));
})

io.on('connection', (socket) => {
   console.log('a user connected');

   socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
   })

   socket.on('disconnect', () => {
      console.log('a user disconnected');
   })
})


server.listen(3000, () => {
   console.log('Server running on localhost:3000');
})