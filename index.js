import { Server } from 'socket.io';
import { createServer} from 'node:http';
import express from 'express';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// open the database file
const db = await open({
   filename: 'chat.db',
   driver: sqlite3.Database
})

// create our 'messages' table
await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
  );
`);


const app = express(); // create express app
const server = createServer(app); // create an http server

// create the socket.io server
const io = new Server(server, {
   connectionStateRecovery: {}
})

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
   res.sendFile(join(__dirname, 'index.html'));
})

io.on('connection', async (socket) => {
   console.log('a user connected');

   socket.on('chat message', async (msg) => {
      let result;
      try {
         // store the message
         result = await db.run('INSERT INTO messages (content) VALUES (?)', msg)
      } catch (e) {
         // handle the failure here
         return;
      }


      console.log('message: ', msg, result.lastID);
      io.emit('chat message', msg, result.lastID);
   })

   if(!socket.recovered) {
      // if connection state recovering was not successful
      try {
         await db.each('SELECT id, content FROM messages WHERE id > ?',
           [socket.handshake.auth.serverOffset || 0],
           (_err, row) => {
             socket.emit('chat message', row.content, row.id);
           }
         )
      } catch (e){
         // something went wrong
      }
   }

   socket.on('disconnect', () => {
      console.log('a user disconnected');
   })
})


server.listen(3000, () => {
   console.log('Server running on localhost:3000');
})