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
      console.log("socket has connected on client side");
    });

    socket.on("update", (activeGames) =>{
        GamesPanel.update(activeGames);
    });

    socket.on("join new game", (data) =>{
      const user = Auth.getUser();
      const gameID = data.newGameID;
      const player1 = data.username;
      const activeGames = data.activeGames;
      console.log(user, player1);
      if(user["username"] == player1){
        console.log("join new game");
        $("#active-games-area").hide();
        $("#game-id-in-panel").text(gameID);
        $("#game-id-in-panel").show();
        GamePlay.initializeP1();
        GamesPanel.update(activeGames);
      }
    });

    socket.on("game begun", ({gameID, player1, player2}) => { // needs to be implemented on server
      const user = Auth.getUser();
      GamePlay.initialize(gameID);
      if (player1 === user){
        GamePlay.initializeP1();
      }
      if (player2 === user){
        GamePlay.initialize(gameID);
        GamePlay.initializeP2();
      }
    });

    socket.on("set characters", ({gameID, char1, char2}) => { // needs to be implemented on server
      setCharacters(char1,char2);
      console.log(gameID);
    });

    socket.on("room full", (data) =>{
      const { gameID, whichPlayer } = data;
      GamePlay.initialize(gameID);
      GamePlay.startGame(whichPlayer);
    });

    socket.on("update players", (data) =>{
      const {whichPlayer, key, action  } = data;
      GamePlay.updateGame(whichPlayer, key, action);
    });

    socket.on("enter waiting room", (user) => {
      GamesPanel.enterWaitingRoom();
    })

    // socket.on("game end", (gameID)) // needs to be implemented on server

    // socket.on("continue game") // needs to be implemented on server
  };

  const create = function(user){
    if (socket && socket.connected) {
      // console.log("create in socket.js")
      socket.emit("create", user);
      
    }
  };

  const join = function(user){
    if (socket && socket.connected) {
      socket.emit("join", user);
    }
  }; 

  const enter = function(gameID, user){
    if (socket && socket.connected) {
      socket.emit("enter", { gameID, user });
    }
  };

  const chooseCharacter = function(index, whichPlayer, gameID){
    if (socket && socket.connected) {
      socket.emit("choose character", {index, whichPlayer, gameID});
    }
  };

  const stopWait = function(gameID, whichPlayer){
    if (socket && socket.connected) {
      socket.emit("stop wait", {gameID, whichPlayer});
    }
  };

  const updatePlayers = function(gameID, whichPlayer, key, action){
    if (socket && socket.connected) {
      socket.emit("update players", {gameID, whichPlayer, key, action});
    }
  };

  const gameOver = function(gameID, winner, loser){
    if (socket && socket.connected) {
      socket.emit("get ranking", {gameID,winner, loser});
    }
  };

    // Get socket to compare score to high score in users and update, remove game from gamesinplay

  const disconnect = function() {
    socket.disconnect();
    socket = null;
  };
  return { getSocket, connect, disconnect, create, join, enter, chooseCharacter, stopWait, updatePlayers, gameOver };

})();

