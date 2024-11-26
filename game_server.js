const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer( app );
const io = new Server(httpServer);

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const gameSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 3000000 } // 50 Minutes 
});

io.use((socket, next) => { // middleware required because you need to know which socket gameSession should use, doesn't exist in this scope.
    gameSession(socket.request, {}, next);
});

app.use(gameSession);

function containWordCharsOnly(text) {
  return /^\w+$/.test(text);
}

// Handle the /register endpoint 
// Receive post request
app.post("/register", (req, res) => {
  // Get the JSON data from the body
  const { username, name, password } = req.body; // From here
  const users = JSON.parse(fs.readFileSync("data/users.json"));
  if (!username || !password || !name){
    res.json({
        status: "error", 
        error: 'Please complete all fields.' // make an edit here?
        }); 
        return;
    };
    if (!containWordCharsOnly(username)){
        res.json({
            status: "error", 
            error: 'Username should be characters only.'
        });
        return;
    }
    if ((username in users)){
        res.json({
            status: "error", 
            error: 'Username is taken.'
        });
        return;
    }
    const encryptedPassword = bcrypt.hashSync(password, 10);
    users[username] = { username, name, encryptedPassword}

    fs.writeFileSync("data/users.json",  JSON.stringify(users, null, " "));
    console.log("problem?");
    res.json({
        status: "success", 
    });

});

app.post("/signin", (req,res) => {
    const { username, password } = req.body;
    const ExistingUsers = JSON.parse(fs.readFileSync("data/users.json"));

    // Check if username is in users.
    if(!(username in ExistingUsers)){
        res.json({
            status: "error", 
            error: "Player does not exist - please sign in!"
        });
        return;
    }
    const userData = ExistingUsers[username];
    if(!(userData.encryptedPassword, bcrypt.hashSync(password, 10))){
        res.json({
            status:"error", 
            error: "Incorrect password."
        }); // Lorax / user1 pw is 1234
        return;
    }

    const userBacktoFE = { username: username, name: userData.name };

    req.session.user = userBacktoFE;

    res.json({
        status: "success",
        user: userBacktoFE // Do I need to send the password back?
    })
    
}); 

app.get("/validate", (req, res) => {
    
    if(req.session.user){
        return res.json({ status: "success", user: req.session.user});
    }
    return res.json({ status: "error", error: "No logged in users"});
});

app.get("/signout", (req, res) =>{
    // if ((req.session.user == null)){
    //     res.json({
    //         status: "error"
    //     });
    // }
    req.session.user = null
    res.json({
        status: "success",
    });
})

const onlineUsers = {};
io.on("connection", (socket) => {
    // This finally worked so my Socket client side is the problem console.log("hello"); 
    fs.writeFileSync("data/testing.json", JSON.stringify("socks"));
    if (socket.request.session.user){
        const user = socket.request.session.user;
        const { username, name } = user;
        onlineUsers[username] = user;
        io.emit("add user", JSON.stringify(onlineUsers));
    }
    socket.on("disconnect", () => { // This has to be inside the connection event since socket exists here. 
        if (socket.request.session.user){
            const user = socket.request.session.user;
            const { username, name } = user;
            if (onlineUsers[username]){
                delete onlineUsers[username];
            }
            io.emit("remove user", JSON.stringify(user));
            // console.log("disconnect", user);
        }
    });

    socket.on("create", (user) =>{
        console.log("game_server received connect");
        fs.stat("data/games.json", (err, stats) => {
            if (err) {
                console.error('Error checking file status:', err);
                return;
            }
            activeGames = JSON.parse(fs.readFileSync("data/games.json"));
            if (stats.size === 0) {
                // If games.json is empty, assign gameID = 0001
                const newGameID = 1;
                console.log(newGameID);
                activeGames[newGameID] = {
                    player1: user,
                    numberOfPlayers: 1,
                    gameID: newGameID
                };
                fs.writeFile('data/games.json', JSON.stringify(activeGames, null, 2));
                io.emit("update", activeGames);
            }
            else {
                console.log("size != 0, next key sequentially")
                // const gameIDs = Object.keys(activeGames); 
                if (Object.keys(activeGames).length === 0) {
                    const newGameID = 1;
                    activeGames[newGameID] = {
                        player1: user,
                        numberOfPlayers: 1,
                        gameID: newGameID
                    };
                    fs.writeFileSync('data/games.json', JSON.stringify(activeGames, null, 2));
                    io.emit("update", activeGames);
                }
                else {
                    const newGameID = gameIDs[gameIDs.length -1] + 1; // GameID is int type
                    activeGames[newGameID] = {
                        player1: user,
                        numberOfPlayers: 1,
                        gameID: newGameID
                    };
                    fs.writeFileSync('data/games.json', JSON.stringify(activeGames, null, 2));
                    io.emit("update", activeGames);
                }
                
            }
        }); 
    });

    socket.on("join", (gameID) => {
        const activeGames = JSON.parse(fs.readFileSync("data/games.json"));
        delete activeGames[gameID];
        io.emit("update", activeGames);
    })


    
});

httpServer.listen(8000, () => {
  console.log("User pressed play...");
});