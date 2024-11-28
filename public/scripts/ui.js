const SignInForm = (function() {

  const initialize = function(){
    $(".overlay-panel").hide();
    $('#overlay').hide();
    // If you need the Avatars to be rendered...but probably not? Don't need avatars in this game. 
    $("#signinform").on("submit", (e) => {
      e.preventDefault(); // Don't just want default submission, go back and check on server-side 
      console.log("signinform - submitted")
      const username = $("#signin-username").val().trim();
      const pw = $("#signin-password").val().trim();

      Auth.signin(username, pw, () => {
        // UI.js changes.
        $("#overlay").hide();
        $("#user-name").text(username);
        $("#user-panel").show()
        $("#active-games-panel").show();
        $("#gameOptions").show();
        $(".user-profile-button").show();
        $("#game-id-in-panel").text(" "); // Reset back to empty
        console.log("singin successful");
        Socket.connect();
      }, (error) =>{
        console.log(error);
        $("#signin-message").text(error); 
      });
    }); 

    $("#registrationform").on("submit", (e) => {
      e.preventDefault();

            // Get the input fields
      const username = $("#reg-username").val().trim();
      const name     = $("#reg-name").val().trim();
      const password = $("#reg-password").val().trim();
      const confirmPassword = $("#reg-confirm").val().trim();
      // Password and confirmation does not match
      if (password != confirmPassword) {
          $("#reg-message").text("Passwords do not match.");
          console.log("Passwords do not match.");
          return;
      }

      Registration.register(username, name, password,
        () => {
            $("#registrationform").get(0).reset();
            $("#reg-message").text("You can sign in now.");
        },
        (error) => { $("#reg-message").text(error); }
      );
    })

  };

  const show = function() {
    console.log("Show form");
    $("#overlay").fadeIn(500);
};

// This function hides the form
const hide = function() {
    $("#signinform").get(0).reset();
    $("#signin-message").text("");
    $("#register-message").text("");
    $(".overlay-panel").fadeOut(500);
    $("#overlay").fadeOut(500);
};

return { initialize, show, hide };

})();

const UserPanel = (function(){
  const initialize = function() {
    // Hide it
    $("#user-panel").hide()
    // Click event for the signout button
    $("#signout-button").on("click", () => {
        // Send a signout request
        Auth.signout(
            () => {
                Socket.disconnect();

                hide();
                SignInForm.show();
                $(".shore").show();
                $("#characterSelection").hide();
                $("#gameCanvas").hide();
                $("#scoreboard").hide();
                $("#waiting-screen").hide();
          });
    });
  };
  

  const show = function() {
      $("#user-panel").show();

  };

  const hide = function() {
      $(".user-profile-button").hide();
      $("#active-games-panel").hide();
      $("#user-panel").hide();
  };

  const update = function(user) {
    console.log("update user panel?", user.username);
      if (user) {
          $("#user-name").text(user.username);
          UserPanel.show();
      }
      else {
          $("#user-name").text("");
      }
  };
  return { initialize, show, hide, update };

})();

const GamesPanel = (function() {
  // This function initializes the UI
  const initialize = function() {
    $("#active-games-area").hide();
  };

  // This function updates the online users panel
  const show = function(){
    $("#active-games-panel").show();
    $("#gameOptions").show();
    
  }


  // Create game
  $("#create").on("click", () => {
    const currentUser = Auth.getUser();
    console.log("create in ui.js")
    $("#gameOptions").hide();
    $("#active-games-area").hide();
    Socket.create(currentUser); // Socket transmits the game creation info, in return server sends back the updated active games list. This is updated using functions of Game Panel in ui.js *through* socket.js
    
    // You get sent straight to game play, so the "game play" div should be visible here
    // $("#characterSelection").show();
    // createCharacterCards(playerCharactersDiv);
    // startGameButton.addEventListener('click', () => {
    //   $("#characterSelection").hide();
    //   let test1 = document.querySelector('#game-id-in-panel').textContent;
    //   Socket.chooseCharacter(returnChosenCharacter(), 1, test1);
    //   $("#waiting-screen").show();
    // });
  });

  $("#join").on("click", () => {
    // Display active games 
    console.log("Joined from GamesPanel.")
    // When one of the rows is clicked then get gameID and send to server
    $("#gameOptions").hide();
    $("#active-games-area").show();

    const currentUser = Auth.getUser();
    Socket.join(currentUser); // This sends back to server to increase num_players and remove gameID from games

  });

  const enter = function(gameID){
    console.log("click a game"); // This is not clicking! 
    const currentUser = Auth.getUser();
    gameID = parseInt(gameID, 10)
    $("#active-games-area").hide();
    $("#game-id-in-panel").text(gameID);
    $("#game-id-in-panel").show();

    Socket.enter(gameID, currentUser);
    $("#characterSelection").show();
    createCharacterCards(playerCharactersDiv);
    startGameButton.addEventListener('click', () => {
      $("#characterSelection").hide();
      Socket.chooseCharacter(returnChosenCharacter(), 2, gameID);
      Socket.stopWait(gameID, 2);
    });
  }

  //$("#game-1").on("click", () => {
  //// $("#game-${gameID}").on("click", function(){
  //  console.log("click?"); // This is not clicking! 
  //  const currentUser = Auth.getUser();
  //  const clickedRowText = $(this).text();
  //  const gameID = parseInt(clickedRowText, 10)
  //  $("#active-games-area").hide();
  //  Socket.enter(gameID, currentUser);
//
  //});

  const update = function(activeGames) { // sent back by server, update the available rooms
      const GamesArea = document.getElementById("active-games-area");
      // $("#active-games-area").show();
      // Clear the online users area
      // $("#active-games-area").show();
      GamesArea.innerHTML = "";
      for (const game in activeGames) {
        if(activeGames[game]["active"] == false){
          continue;
        }

        const gameRow = document.createElement('button');
        gameRow.classList.add('game-row');
        gameRow.id = `game-${game}`;
        gameRow.innerHTML = game;

        GamesArea.appendChild(gameRow);
      }
  };


  // This function removes a user from the panel
const removeGame = function(gameID) {
  const GamesArea = document.getElementById("#active-games-area");
  
  // Find the user
  const game = GamesArea.find("#game-" + gameID);
  
  // Remove the user
  if (game.length > 0) game.remove(); // this is not right
};

  const enterWaitingRoom = function(){
    $("#characterSelection").show();
    createCharacterCards(playerCharactersDiv);
    startGameButton.addEventListener('click', () => {
      $("#characterSelection").hide();
      let test1 = document.querySelector('#game-id-in-panel').textContent;
      Socket.chooseCharacter(returnChosenCharacter(), 1, test1);
      $("#waiting-screen").show();
    });
  }

  return { initialize, show, update, removeGame, enter, enterWaitingRoom };
})();

const GamePlay = (function(){
  let clientgameID;
  // const user = Auth.getUser();
  let currGameLoopID;

  const initialize = function(gameID){
    // $("#game-id-in-panel").text(gameID);
    // $("#game-id-in-panel").show();
    // Show net. 
    clientgameID = gameID;
    $("#waiting-screen").hide();
    $(".shore").hide();
  }

  const enterCharacter = function(){
    // temp
  }

  const startGame = function(player){
    $("#gameCanvas").show();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    initializePlayers(player);
    document.getElementById('scoreboard').style.display = 'block';
    initPositions();
    // playerNumber = player;
    // currentKey = null;
    // currentAction = "action";
    gameLoop(player, null, "action");
    currGameLoopID = returnGameLoopID();

    canvas.addEventListener("mousedown", (e) => {
      if (!ball.inServe) return;
  
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      const distance = Math.sqrt((mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2);
      if (distance <= ballRadius) {
          isDragging = true;
      }
      console.log("mouse down: " + player);
  });
  
  canvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
  
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      const dx = mouseX - ball.x;
      const dy = ball.y - mouseY;
  
      ball.angle = Math.atan2(dy, dx);
      ball.power = Math.min(Math.sqrt(dx ** 2 + dy ** 2), 300);
      console.log("mouse move: " + player);
  });
  
  canvas.addEventListener("mouseup", () => {
      if (!isDragging) return;
  
      isDragging = false;
      serveBall();
      console.log("mouse up: " + player);
  });
  
  window.addEventListener("keydown", (e) => {
      if (!keys[e.key]) {
          keys[e.key] = true;
          // currentKey = e.key;
  
          // Player 1 Smash Activation
          if (e.key === 's') {
              if (player1.canSmash) {
                  player1.smashActivated = true;
              }
          }
  
          // Player 2 Smash Activation
          if (e.key === 'l') {
              if (player2.canSmash) {
                  player2.smashActivated = true;
              }
          }
      }
  });
  
  window.addEventListener("keyup", (e) => {
      keys[e.key] = false;
  });
  
  // Load all images before starting the game loop
  const imagesToLoad = [backgroundImage, ballImage, mudIconImage, speedIconImage, enlargeIconImage];
  let imagesLoaded = 0;
  
  imagesToLoad.forEach((img) => {
      img.onload = () => {
          imagesLoaded++;
          if (imagesLoaded === imagesToLoad.length) {
              // Do nothing here, start game after character selection
          }
      };
  });

  }

  const updateGame = function(whichPlayer, key, action) {
    stopGameLoop(currGameLoopID);
    gameLoop(whichPlayer, key, action);
    currGameLoopID = returnGameLoopID();
    // gameLoop(playerNumber, currentKey, currentAction);

    // playerNumber = whichPlayer;
    // currentKey = key;
    // currentAction = action;

    canvas.addEventListener("mousedown", (e) => {
      if (!ball.inServe) return;
  
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      const distance = Math.sqrt((mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2);
      if (distance <= ballRadius) {
          isDragging = true;
      }
  });
  
  canvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
  
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      const dx = mouseX - ball.x;
      const dy = ball.y - mouseY;
  
      ball.angle = Math.atan2(dy, dx);
      ball.power = Math.min(Math.sqrt(dx ** 2 + dy ** 2), 300);
  });
  
  canvas.addEventListener("mouseup", () => {
      if (!isDragging) return;
  
      isDragging = false;
      serveBall();
  });
  
  window.addEventListener("keydown", (e) => {
      if (!keys[e.key]) {
          keys[e.key] = true;
          currentKey = e.key;
  
          // Player 1 Smash Activation
          if (e.key === 's') {
              if (player1.canSmash) {
                  player1.smashActivated = true;
              }
          }
  
          // Player 2 Smash Activation
          if (e.key === 'l') {
              if (player2.canSmash) {
                  player2.smashActivated = true;
              }
          }
      }
  });
  
  window.addEventListener("keyup", (e) => {
      keys[e.key] = false;
  });
  
  // Load all images before starting the game loop
  const imagesToLoad = [backgroundImage, ballImage, mudIconImage, speedIconImage, enlargeIconImage];
  let imagesLoaded = 0;
  
  imagesToLoad.forEach((img) => {
      img.onload = () => {
          imagesLoaded++;
          if (imagesLoaded === imagesToLoad.length) {
              // Do nothing here, start game after character selection
          }
      };
  });

  }

  const initializeP2 = function(){

  }

  const score = function(gameID, user){
    
  };

  const checkGameEnd = function(gameID){

  }

  return { initialize, startGame, initializeP2, score, checkGameEnd, enterCharacter, updateGame };
})();

const UI = (function() {

  const getUserDisplay = function(user) {
      return $("<div class='field-content row shadow'></div>")
          .append($("<span class='user-name'>" + user.name + "</span>"));
  };

const components = [SignInForm, UserPanel];

const initialize = function() {
  for (const component of components) {
      component.initialize();
  }
}
return { getUserDisplay, initialize };  

})();