
const params = new URLSearchParams(window.location.search);
if(!params.has("username")){
    window.location = "index.html";
    throw new Error("Se requiere el username");
}

let searching = false;
let searchAnimationInterval;

const divUsers = document.getElementById("divUsers");
const lblOnlineUsersCount = document.getElementById("lblOnlineUsersCount");
const lblSearching = document.getElementById("lblSearching");
const divLobby = document.getElementById("divLobby");
const divGame = document.getElementById("divGame");


const username = params.get("username");
const socket = io(window.location.host+"?username="+username);

  

socket.on("welcome",(data)=>{
    console.log("Server: "+data.message);
    setOnlineUsers(data.onlineUsers);
    lblOnlineUsersCount.innerHTML = data.onlineUsers.length;
  })

socket.on("userConnected",(data)=>{
    console.log(data.username+" se ha conectado");
    addOnlineUser(data.username);
    lblOnlineUsersCount.innerHTML = Number(lblOnlineUsersCount.innerHTML)+1;

})

socket.on("userDisconnected",(data)=>{
    console.log(data.username+" se ha desconectado");
    lblOnlineUsersCount.innerHTML = Number(lblOnlineUsersCount.innerHTML)-1;
    removeOnlineUser(data.username);
})

socket.on("matchReady", function (data) {
    divLobby.style.visibility = "hidden";
    divGame.style.visibility = "visible";
  });

  socket.on("connectionRejected", function (resp) {
    console.log("Desconectado",resp);
    window.location = "index.html";
  });
  socket.on("disconnected", function (reason) {
    console.log(reason);
  });
  socket.on("error", function (reason) {
    console.log(reason);
  });



document.getElementById("btnSearchMatch").onclick= function(){
    if (!searching) {        
        this.innerHTML = "Cancelar";
        matchSearchStart();
      } else {
        this.innerHTML = "Buscar Partida";
        matchSearchEnd();
      }
}

function matchSearchStart() {
    socket.emit("searchMatch");
    searching = true;
    searchAnimationInterval = setInterval(searchingAnimation, 400);
  }
  
  function matchSearchEnd() {
    searching = false;
    socket.emit("stopSearchMatch");
    clearInterval(searchAnimationInterval);
    lblSearching.innerHTML = "";
  }

  function searchingAnimation() {
    let searchText = lblSearching.innerHTML;
    if (searchText == "") {
      lblSearching.innerHTML = "Buscando";
    } else if (searchText.split(".").length < 4) {
      lblSearching.innerHTML += ".";
    } else {
      lblSearching.innerHTML = "Buscando";
    }
  }

  function setOnlineUsers(onlineUsers) {
    divUsers.innerHTML = "";
    
    onlineUsers.forEach((user) => {
      divUsers.innerHTML +=
        `<div id="${user.username}"> ${user.username} </div>`;
    });
  }

  function addOnlineUser(username) {
    let userElement = document.createElement('div');
    userElement.id = username;
    userElement.innerHTML = username;
    divUsers.append(userElement);    
  }
  function removeOnlineUser(username) {
    document.getElementById(username)?.remove();
  }