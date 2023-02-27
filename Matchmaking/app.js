const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
var puerto = 3000;

const publicPath = path.resolve(__dirname, "./public");
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });
   
  const validarSiElUsuarioYaEstaConectado = (username)=>{
    return true;
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

 io.on('connection', (socket)=>{
   const username = socket.handshake.query.username;
   if(!username || validarSiElUsuarioYaEstaConectado(username)){
       socket.emit("connectionRejected");
       socket.disconnect();
     }
     
     console.log(username+' connected');
  
      socket.on('disconnect', () => {
        console.log( username+' disconnected');
      });
 } ) 


  server.listen(puerto, () => {
    console.log('listening on *:' + puerto);
  }); 