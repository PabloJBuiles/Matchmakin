const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
var puerto = 3000;
let connectedUsers  = {};
const waitingUsers = [];

const publicPath = path.resolve(__dirname, "./public");
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });
   
  const validarSiElUsuarioYaEstaConectado = (username)=>{
    return Object.values(connectedUsers).some((user) => user.username === username);
  }
  //Por Resolver
  // io.use((socket,next)=>{
  //    const username = socket.handshake.query.username;
  //   if(!username || validarSiElUsuarioYaEstaConectado(username)){
  //     socket.emit("connectionRejected");
  //     return next(new Error("El usuario ya esta conectado"))
  //   }
  //   else{
  //     socket.username = username;
  //     next();
  //   }
  // })
  io.on('connection', (socket) => {
    const username = socket.handshake.query.username;
  
    if (!username) {
      socket.emit("connectionRejected");
      console.log("connectionRejected: username is required");
      socket.disconnect();
    } else if (validarSiElUsuarioYaEstaConectado(username)) {
      socket.emit("connectionRejected");
      console.log("connectionRejected: username already taken");
      socket.disconnect();
    } else {
      connectedUsers[socket.id] = { username, socket };
      console.log(username + ' connected');
      socket.emit("userConnected");
      io.emit("userList", Object.keys(connectedUsers));
    }
  
    socket.on('disconnect', () => {
      if (connectedUsers[socket.id]) {
        const { username } = connectedUsers[socket.id];
        delete connectedUsers[socket.id];
        console.log(username + ' disconnected');
        io.emit("userList", Object.keys(connectedUsers));
      }
    });


    socket.on("searchMatch", () => {
      console.log(`User ${socket.handshake.query.username} is searching for a match`);
  
      // Se agrega el usuario a la lista de espera
      waitingUsers.push(socket);
  
      // Si hay al menos dos usuarios en la lista de espera
      if (waitingUsers.length >= 2) {
        // Se empareja a los dos primeros usuarios de la lista de espera
        const player1 = waitingUsers.shift();
        const player2 = waitingUsers.shift();
  
        console.log(`Match found: ${player1.handshake.query.username} vs ${player2.handshake.query.username}`);
  
        // Se emite el evento "matchReady" a ambos usuarios
        player1.emit("matchReady", { opponent: player2.handshake.query.username });
        player2.emit("matchReady", { opponent: player1.handshake.query.username });
      }
    });
  
    // Evento para detener la búsqueda de una partid
    socket.on("stopSearchMatch", () => {
      console.log(`User ${socket.handshake.query.username} stopped searching for a match`);
  
      // Se elimina al usuario de la lista de espera si está presente
      const index = waitingUsers.indexOf(socket);
      if (index !== -1) {
        waitingUsers.splice(index, 1);
      }
    });
  

  });
  
  
  
  
  


  server.listen(puerto, () => {
    console.log('listening on *:' + puerto);
  }); 

//function AgregarUsuarioOnline(ususario){
//  usuariosConectadosList.push(ususario)
//  console.log('Se agrego el usuario:' + ususario);
//}

































































































