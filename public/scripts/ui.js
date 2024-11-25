const SignInForm = (function() {

  const initialize = function(){
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
        console.log("singin");
        Socket.connect();
      }, (error) =>{
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
          // $("#reg-message").text("Passwords do not match.");
          console.log("Passwords do not match.");
          return;
      }

      Registration.register(username, name, password,
        () => {
            $("#registrationform").get(0).reset();
            $("#reg-message").text("You can sign in now.");
        },
        (error) => { console.log(error); }
      );
    })

  };

  const show = function() {
    console.log("Show form");
    $("#signInPanel").fadeIn(500);
    $("#registerPanel").fadeIn(500);
};

// This function hides the form
const hide = function() {
    $("#signinform").get(0).reset();
    $("#signin-message").text("");
    $("#register-message").text("");
    $("#signInPanel").fadeOut(500);
    $("#registerPanel").fadeOut(500);
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
          });
    });
  };

// This function shows the form with the user
  const show = function(user) {
      $("#user-panel").show();

  };

  // This function hides the form
  const hide = function() {
      $("#user-panel").hide();
  };

  // This function updates the user panel
  const update = function(user) {
      if (user) {
          $("#user-panel .user-name").text(user.name);
      }
      else {
          $("#user-panel .user-name").text("");
      }
  };
  return { initialize, show, hide, update };

})();

const GamesPanel = (function() {
  // This function initializes the UI
  const initialize = function() {

  };

  // This function updates the online users panel
  const show = function(){
    $("#active-games-area").show();
    
  }


  // Create game
  $("#create").on("click", () => {
    const currentUser = Auth.getUser();
    console.log("create in ui.js")
    Socket.create(currentUser); // Socket transmits the game creation info, in return server sends back the updated active games list. This is updated using functions of Game Panel in ui.js *through* socket.js
    $("#gameOptions").hide();
    
    // You get sent straight to game play, so the "game play" div should be visible here
    
  })

  $("#join").on("click", () => {
    // Display active games 

    // When one of the rows is clicked then get gameID and send to server
    
    Socket.join(gameID); // This sends back to server to increase num_players and remove gameID from games

  });

  const update = function(activeGames) { // sent back by server
      const GamesArea = document.getElementById("active-games-area");
      $("#active-games-area").show();
      // Clear the online users area
      GamesArea.innerHTML = "";


      // Add the user one-by-one
      for (const game in activeGames) {
        console.log(game);
        const gameRow = document.createElement('div');
        gameRow.classList.add('game-row');
        gameRow.id = 'game-${gameID}';
        gameRow.innerHTML = game;

        GamesArea.appendChild(gameRow);
      }
  };


  // This function removes a user from the panel
const removeGame = function(gameID) {
  const GamesArea = document.getElementById("#active-games-area");
  
  // Find the user
  const game = onlineUsersArea.find("#game-" + gameID);
  
  // Remove the user
  if (game.length > 0) game.remove(); // this is not right
};

  return { initialize, update, removeGame };
})();

const UI = (function() {

  const getUserDisplay = function(user) {
      return $("<div class='field-content row shadow'></div>")
          .append($("<span class='user-name'>" + user.name + "</span>"));
  };

const components = [SignInForm, UserPanel];

const initialize = function() {
  for (const component of components) {
      console.log(component, "initialised in UI")
      component.initialize();
  }
}
return { getUserDisplay, initialize };  

})();