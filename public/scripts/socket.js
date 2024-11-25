// Client side WebSocket server 
// Used to send select messages to and receive from server as required.

const Socket = (function(){
  let socket = null; 

  const getSocket = function(){
    return socket;
  };

  const connect = function(){
    socket = io(); // This sends a connection request to the Socket server on the existing host and port (i.e. localhost8000 here)

    socket.on("connect", () => {
      // When the server connects, the things you want from the server immediately are:
      // socket.emit("get users");
      // and maybe get active rooms?
      //socket.emit()
      console.log("socket has connected on client side");
    });

    socket.on("update", (activeGames) =>{
        GamesPanel.update(activeGames);
    });

  

  };

  const create = function(user){
    if (socket && socket.connected) {
      console.log("create in socket.js")
      socket.emit("create", user);
    }
  };

  const join = function(gameID){
    if (socket && socket.connected) {
      socket.emit("create", user);
    }
  };

  const disconnect = function() {
    socket.disconnect();
    socket = null;
  };
  return { getSocket, connect, disconnect, create, join };

})();

