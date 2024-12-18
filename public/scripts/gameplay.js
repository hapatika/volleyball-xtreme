const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas to fill the entire page
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// TO BE DELETED
// resizeCanvas();
// window.addEventListener("resize", resizeCanvas);

// Load images
const backgroundImage = new Image();
backgroundImage.src = "images/background.png"; // Path to the background image

const ballImage = new Image();
ballImage.src = "images/ball.svg"; // Path to the ball SVG file

const mudIconImage = new Image();
mudIconImage.src = "images/mud_icon.png"; // Path to the mud icon image

const speedIconImage = new Image();
speedIconImage.src = "images/speed_icon.png"; // Path to the speed icon image

const enlargeIconImage = new Image();
enlargeIconImage.src = "images/enlarge_icon.png"; // Path to the enlarge icon image

// Load the hit sound
const hitSound = new Audio("images/hitball.mp3"); // Path to the hit sound file

// Character selection variables
const characterSelection = document.getElementById('characterSelection');
const playerCharactersDiv = document.getElementById('playerCharacters');
// const player2CharactersDiv = document.getElementById('player2Characters');
const startGameButton = document.getElementById('startGameButton');
let player1CharacterSelected = null;
let player2CharacterSelected = null;
let tempChosenCharacter;
const characters = [
    {
        name: 'Speedster',
        color: 'red',
        speedMultiplier: 1.5,
        sizeMultiplier: 0.9,
        powerMultiplier: 1,
        image: 'speedster.png', // Add your character image
    },
    {
        name: 'Giant',
        color: 'blue',
        speedMultiplier: 1,
        sizeMultiplier: 1.3,
        powerMultiplier: 1,
        image: 'giant.png', // Add your character image
    },
    {
        name: 'Powerhouse',
        color: 'green',
        speedMultiplier: 1,
        sizeMultiplier: 1,
        powerMultiplier: 1.5,
        image: 'powerhouse.png', // Add your character image
    },
    {
        name: 'Balanced',
        color: 'purple',
        speedMultiplier: 1.2,
        sizeMultiplier: 1.1,
        powerMultiplier: 1.2,
        image: 'balanced.png', // Add your character image
    },
];

let currentPlayer;

function createCharacterCards(playerDiv) {
    deleteCharacterCards(playerDiv);

    characters.forEach((character, index) => {
        const card = document.createElement('div');
        card.classList.add('character-card');
        card.innerHTML = `
            <img src="${character.image}" alt="temp">
            <h2>${character.name}</h2>
            <p><strong>Speed:</strong> ${character.speedMultiplier}</p>
            <p><strong>Size:</strong> ${character.sizeMultiplier}</p>
            <p><strong>Power:</strong> ${character.powerMultiplier}</p>
        `;
        card.addEventListener('click', () => {
            selectCharacter(index, card);
        });
        playerDiv.appendChild(card);
    });
}

function deleteCharacterCards(playerDiv) {
    const cards = playerDiv.querySelectorAll('.character-card');
    cards.forEach(card => {
        playerDiv.removeChild(card);
    });
}

function selectCharacter(characterIndex, cardElement) {
    Array.from(playerCharactersDiv.children).forEach(child => {
        child.classList.remove('character-selected');
    });
    cardElement.classList.add('character-selected');
    tempChosenCharacter = characterIndex;
    if (characterIndex !== null) {
        startGameButton.disabled = false;
    }
}

function returnChosenCharacter(){
    return tempChosenCharacter;
}

function setCharacters(char1, char2){
    player1CharacterSelected = char1;
    player2CharacterSelected = char2;
}


// TO BE DELETED
// createCharacterCards(player1CharactersDiv, 1);
// createCharacterCards(player2CharactersDiv, 2);


// startGameButton.addEventListener('click', () => {
//     initializePlayers();
//     characterSelection.style.display = 'none';
//     document.getElementById('scoreboard').style.display = 'block';
//     initPositions();
//     gameLoop();
// });

// Game variables
const defaultPlayerWidth = 70;  // Increased from 50
const defaultPlayerHeight = 140; // Increased from 100
const defaultHeadRadius = 40;  // Increased from 30
const defaultArmWidth = 15;    // Increased from 10
const defaultArmLength = 100;  // Increased from 75
const defaultLegWidth = 25;    // Increased from 20
const defaultLegHeight = 100;  // Increased from 75
const ballRadius = 30;
const gravity = 0.4;
let netHeight = 300; // Will be adjusted based on canvas size
const netWidth = 12;
const netSpacing = 25;

let player1, player2;

let ball = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    inServe: true,
    power: 0,
    angle: 0,
    trail: [],
    isSmashed: false,
    smashTime: 0,
    netCollision: false,
};

let keys = {};
let isDragging = false;
let particles = [];
let powerUps = [];

// New variables for game over and net movement
let gameOver = false;
let currentServer;
let netYPosition = 0;
let netDirection = 1;
let netMoving = false;
let confettiParticles = [];

function initializePlayers(player) {
    const character1 = characters[player1CharacterSelected];
    const character2 = characters[player2CharacterSelected];

    player1 = {
        x: 50,
        y: 0,
        dy: 0,
        onGround: true,
        score: 0,
        canSmash: true,
        smashCooldownTime: 5000, // 5 seconds cooldown
        lastSmashTime: 0,
        smashActivated: false,
        isStuck: false,
        stuckTime: 0,
        stuckDuration: 3000, // 3 seconds stuck
        speedMultiplier: character1.speedMultiplier,
        sizeMultiplier: character1.sizeMultiplier,
        powerMultiplier: character1.powerMultiplier,
        enlarged: false,
        enlargeTime: 0,
        enlargeDuration: 5000, // 5 seconds enlarged
        color: character1.color,
    };

    player2 = {
        x: 0,
        y: 0,
        dy: 0,
        onGround: true,
        score: 0,
        canSmash: true,
        smashCooldownTime: 5000, // 5 seconds cooldown
        lastSmashTime: 0,
        smashActivated: false,
        isStuck: false,
        stuckTime: 0,
        stuckDuration: 3000, // 3 seconds stuck
        speedMultiplier: character2.speedMultiplier,
        sizeMultiplier: character2.sizeMultiplier,
        powerMultiplier: character2.powerMultiplier,
        enlarged: false,
        enlargeTime: 0,
        enlargeDuration: 5000, // 5 seconds enlarged
        color: character2.color,
    };
    
    currentServer = player1;

    currentPlayer = player;
}

// Initialize positions based on canvas size
function initPositions() {
    netHeight = canvas.height * 0.5;
    player1.y = canvas.height - getPlayerHeight(player1) - getLegHeight(player1);
    player2.y = canvas.height - getPlayerHeight(player2) - getLegHeight(player2);
    player2.x = canvas.width - getPlayerWidth(player2) - 50;
    resetBall();
}

function getPlayerWidth(player) {
    return defaultPlayerWidth * player.sizeMultiplier * (player.enlarged ? 1.5 : 1);
}

function getPlayerHeight(player) {
    return defaultPlayerHeight * player.sizeMultiplier * (player.enlarged ? 1.5 : 1);
}

function getHeadRadius(player) {
    return defaultHeadRadius * player.sizeMultiplier * (player.enlarged ? 1.5 : 1);
}

function getArmLength(player) {
    return defaultArmLength * player.sizeMultiplier * (player.enlarged ? 1.5 : 1);
}

function getLegHeight(player) {
    return defaultLegHeight * player.sizeMultiplier * (player.enlarged ? 1.5 : 1);
}

// Draw the net with 3D effect
function drawNet() {
    const netX = canvas.width / 2 - netWidth / 2;
    const netY = canvas.height - netHeight + netYPosition;

    // Draw net pole
    ctx.fillStyle = "#8B4513"; // Brown color
    ctx.fillRect(netX - 5, netY - 20, netWidth + 10, netHeight + 20);

    // Draw net mesh with gradient for 3D effect
    const netGradient = ctx.createLinearGradient(netX, netY, netX + netWidth, netY + netHeight);
    netGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    netGradient.addColorStop(1, "rgba(200, 200, 200, 0.8)");
    ctx.fillStyle = netGradient;
    ctx.fillRect(netX, netY, netWidth, netHeight);

    // Draw net lines
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 1;
    for (let y = netY; y <= netY + netHeight; y += netSpacing) {
        ctx.beginPath();
        ctx.moveTo(netX, y);
        ctx.lineTo(netX + netWidth, y);
        ctx.stroke();
    }
    for (let x = netX; x <= netX + netWidth; x += netSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, netY);
        ctx.lineTo(x, netY + netHeight);
        ctx.stroke();
    }

    // Draw net shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(netX + netWidth, netY + 10, 5, netHeight - 10);
}

// Draw a volleyball player
function drawPlayer(player) {
    const playerWidth = getPlayerWidth(player);
    const playerHeight = getPlayerHeight(player);
    const headRadius = getHeadRadius(player);
    const armLength = getArmLength(player);
    const legHeight = getLegHeight(player);

    const torsoX = player.x + playerWidth / 2;
    const torsoY = player.y + headRadius;

    const skinTone = "#d2a679";

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(player.x + playerWidth / 2, canvas.height - 5, playerWidth, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(player.x + playerWidth / 2, player.y, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = skinTone;
    ctx.fill();
    ctx.closePath();

    // Torso
    ctx.fillStyle = player.color;
    ctx.fillRect(torsoX - playerWidth / 2, torsoY, playerWidth, playerHeight);

    // Arms
    ctx.fillStyle = skinTone;

    // Left arm
    ctx.save();
    ctx.translate(torsoX - playerWidth / 2, torsoY + 10);
    ctx.rotate(Math.sin(Date.now() / 200) * 0.1);
    ctx.fillRect(-defaultArmWidth / 2, 0, defaultArmWidth, armLength);
    ctx.restore();

    // Right arm
    ctx.save();
    ctx.translate(torsoX + playerWidth / 2, torsoY + 10);
    ctx.rotate(-Math.sin(Date.now() / 200) * 0.1);
    ctx.fillRect(-defaultArmWidth / 2, 0, defaultArmWidth, armLength);
    ctx.restore();

    // Legs
    ctx.fillStyle = player.color;
    ctx.fillRect(torsoX - playerWidth / 4 - defaultLegWidth / 2, torsoY + playerHeight, defaultLegWidth, legHeight);
    ctx.fillRect(torsoX + playerWidth / 4 - defaultLegWidth / 2, torsoY + playerHeight, defaultLegWidth, legHeight);

    // Mud Effect
    if (player.isStuck) {
        ctx.fillStyle = 'rgba(139,69,19,0.5)'; // Brown color overlay
        ctx.fillRect(player.x, player.y, playerWidth, playerHeight + legHeight + headRadius);
    }
}

// Draw the ball
function drawBall() {
    const ballDiameter = ballRadius * 2;

    // Ball trail
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
    ctx.beginPath();
    for (let i = 0; i < ball.trail.length - 1; i++) {
        ctx.moveTo(ball.trail[i].x, ball.trail[i].y);
        ctx.lineTo(ball.trail[i + 1].x, ball.trail[i + 1].y);
    }
    ctx.stroke();

    if (ball.isSmashed) {
        // Smash effect
        ctx.save();
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(Date.now() / 100);
        ctx.drawImage(ballImage, ball.x - ballRadius, ball.y - ballRadius, ballDiameter, ballDiameter);
        ctx.restore();

        // Reset smash effect after some time
        if (Date.now() - ball.smashTime > 1000) {
            ball.isSmashed = false;
        }
    } else {
        ctx.drawImage(ballImage, ball.x - ballRadius, ball.y - ballRadius, ballDiameter, ballDiameter);
    }
}

// Draw particles
function drawParticles() {
    particles.forEach((particle, index) => {
        ctx.fillStyle = `rgba(255, 165, 0, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.alpha -= 0.02;
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Draw power-ups
function drawPowerUps() {
    powerUps.forEach((powerUp) => {
        if (powerUp.type === 'mud') {
            ctx.drawImage(mudIconImage, powerUp.x - 20, powerUp.y - 20, 40, 40);
        } else if (powerUp.type === 'speed') {
            ctx.drawImage(speedIconImage, powerUp.x - 20, powerUp.y - 20, 40, 40);
        } else if (powerUp.type === 'enlarge') {
            ctx.drawImage(enlargeIconImage, powerUp.x - 20, powerUp.y - 20, 40, 40);
        }
        // Additional power-up types can be added here
    });
}

// Draw scores
function drawScores() {
    document.getElementById("player1Score").textContent = `Player 1: ${player1.score}`;
    document.getElementById("player2Score").textContent = `Player 2: ${player2.score}`;
}

// Animate score when a player scores
function animateScore(player) {
    const scoreElement = player === player1 ? document.getElementById("player1Score") : document.getElementById("player2Score");
    scoreElement.classList.add("score-animate");
    setTimeout(() => {
        scoreElement.classList.remove("score-animate");
    }, 500);
}

// Draw the trajectory line during dragging
function drawTrajectory() {
    if (!isDragging) return;

    const power = Math.min(ball.power, 300);
    const angle = ball.angle;

    const endX = ball.x + power * Math.cos(angle);
    const endY = ball.y - power * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + ball.power / 400})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 15]);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw Smash UI
function drawSmashUI() {
    // Player 1 Smash UI
    ctx.fillStyle = player1.canSmash ? 'green' : 'red';
    ctx.fillRect(20, 60, 100, 10);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(20, 60, 100, 10);
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText('P1 Smash', 20, 55); // Adjusted position

    // Player 2 Smash UI
    ctx.fillStyle = player2.canSmash ? 'green' : 'red';
    ctx.fillRect(canvas.width - 120, 60, 100, 10);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(canvas.width - 120, 60, 100, 10);
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText('P2 Smash', canvas.width - 120, 55); // Adjusted position
}

// Reset the ball for a new serve
function resetBall() {
    const playerWidth1 = getPlayerWidth(player1);
    const playerWidth2 = getPlayerWidth(player2);
    const headRadius1 = getHeadRadius(player1);
    const headRadius2 = getHeadRadius(player2);

    if (currentServer === player1) {
        ball.x = player1.x + playerWidth1 + ballRadius;
        ball.y = player1.y + headRadius1;
    } else {
        ball.x = player2.x - ballRadius;
        ball.y = player2.y + headRadius2;
    }
    ball.dx = 0;
    ball.dy = 0;
    ball.inServe = true;
    ball.trail = [];
    ball.netCollision = false;
}

// Handle serving
function serveBall() {
    const radians = ball.angle;
    ball.dx = (ball.power * Math.cos(radians) / 10) * currentServer.powerMultiplier;
    ball.dy = (-ball.power * Math.sin(radians) / 10) * currentServer.powerMultiplier;
    ball.inServe = false;
}

// Handle ball collision with players
function handlePlayerCollision(player, opponent) {
    const playerWidth = getPlayerWidth(player);
    const playerHeight = getPlayerHeight(player);
    const legHeight = getLegHeight(player);

    if (
        ball.x + ballRadius > player.x &&
        ball.x - ballRadius < player.x + playerWidth &&
        ball.y + ballRadius > player.y &&
        ball.y - ballRadius < player.y + playerHeight + legHeight
    ) {
        if (player.smashActivated) {
            ball.dy = -Math.abs(ball.dy) * 1.5 * player.powerMultiplier; // Increase vertical speed
            ball.dx = (ball.x - (player.x + playerWidth / 2)) * 0.2 * player.powerMultiplier; // Direction based on hit position
            // Reset smash
            player.canSmash = false;
            player.smashActivated = false;
            player.lastSmashTime = Date.now();
            // Smash effect
            ball.isSmashed = true;
            ball.smashTime = Date.now();
        } else {
            ball.dy = -Math.abs(ball.dy) * player.powerMultiplier;
            ball.dx = (ball.x - (player.x + playerWidth / 2)) * 0.1 * player.powerMultiplier; // Adjusted for better control
        }

        hitSound.currentTime = 0;
        hitSound.play();

        // Emit particles
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: ball.x,
                y: ball.y,
                dx: (Math.random() - 0.5) * 4,
                dy: (Math.random() - 0.5) * 4,
                size: Math.random() * 5 + 2,
                alpha: 1,
            });
        }
    }
}

// Spawn power-ups at random intervals, falling from the sky
function spawnPowerUp() {
    const powerUpTypes = ['mud', 'speed', 'enlarge']; // Added new power-ups
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const side = Math.random() < 0.5 ? 'left' : 'right';
    // Check if there is already a power-up on this side
    if (powerUps.some(powerUp => powerUp.side === side && !powerUp.collected)) {
        // Don't spawn another power-up on this side
        setTimeout(spawnPowerUp, Math.random() * 10000 + 5000); // Schedule next attempt
        return;
    }

    const x = side === 'left' ? Math.random() * (canvas.width / 2 - 100) + 50
                                : Math.random() * (canvas.width / 2 - 100) + canvas.width / 2 + 50;
    const y = 0; // Start from the top

    powerUps.push({
        type: type,
        x: x,
        y: y,
        dy: 2, // Falling speed
        side: side,
        collected: false,
        animationTime: 0
    });

    // Spawn the next power-up after a random delay
    setTimeout(spawnPowerUp, Math.random() * 10000 + 5000); // Between 5 and 15 seconds
}
// Start spawning power-ups
setTimeout(spawnPowerUp, 5000);

// Update power-ups positions and handle ground collision
function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.dy;

        // Check if power-up has touched the ground
        if (powerUp.y >= canvas.height - 5) {
            // Create explosion effect
            createExplosion(powerUp.x, canvas.height - 5);
            // Remove power-up
            powerUps.splice(index, 1);
        }
    });
}

// Check for collision between power-ups and players
function checkPowerUpCollisions() {
    powerUps.forEach((powerUp, index) => {
        if (!powerUp.collected) {
            [player1, player2].forEach(player => {
                const playerWidth = getPlayerWidth(player);
                const playerHeight = getPlayerHeight(player);
                const legHeight = getLegHeight(player);

                if (
                    powerUp.x > player.x &&
                    powerUp.x < player.x + playerWidth &&
                    powerUp.y > player.y &&
                    powerUp.y < player.y + playerHeight + legHeight
                ) {
                    powerUp.collected = true;
                    applyPowerUpEffect(powerUp, player);
                    // Remove power-up after animation
                    setTimeout(() => {
                        powerUps.splice(index, 1);
                    }, 1000);
                }
            });
        }
    });
}

// Apply the effect of the power-up
function applyPowerUpEffect(powerUp, player) {
    if (powerUp.type === 'mud') {
        player.isStuck = true;
        player.stuckTime = Date.now();
    } else if (powerUp.type === 'speed') {
        player.speedMultiplier *= 1.5;
        player.speedTime = Date.now();
        player.speedDuration = 5000; // 5 seconds speed boost
    } else if (powerUp.type === 'enlarge') {
        player.enlarged = true;
        player.enlargeTime = Date.now();
    }
}

// Create explosion effect when power-up hits the ground
function createExplosion(x, y) {
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 1) * -6,
            size: Math.random() * 5 + 2,
            alpha: 1,
        });
    }
}

// Update ball position
function updateBall() {
    if (ball.inServe || ball.netCollision) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    ball.dy += gravity;

    // Add to trail
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 10) {
        ball.trail.shift();
    }

    // Bounce off top of the screen
    if (ball.y - ballRadius <= 0) {
        ball.dy = Math.abs(ball.dy);
    }

    // Bounce off left of the screen
    if (ball.x - ballRadius <= 0) {
        ball.dx = Math.abs(ball.dx);
    }

    // Bounce off right of the screen
    if (ball.x + ballRadius >= canvas.width) {
        ball.dx = -Math.abs(ball.dx);
    }

    handlePlayerCollision(player1, player2);
    handlePlayerCollision(player2, player1);

    // Net collision handling (ball does not bounce off the net)
    const netX = canvas.width / 2 - netWidth / 2;
    const netY = canvas.height - netHeight + netYPosition;

    if (
        ball.x + ballRadius > netX &&
        ball.x - ballRadius < netX + netWidth &&
        ball.y + ballRadius > netY &&
        ball.y - ballRadius < netY + netHeight
    ) {
        // Set net collision flag
        ball.netCollision = true;

        // Adjust ball position to be at the point of collision
        if (ball.x < canvas.width / 2) {
            ball.x = netX - ballRadius;
        } else {
            ball.x = netX + netWidth + ballRadius;
        }

        // Reduce ball speed for falling animation
        ball.dx = 0;
        ball.dy = 2;

        return;
    }

    if (ball.y + ballRadius > canvas.height) {
        // Emit particles on ground hit
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: ball.x,
                y: canvas.height - ballRadius,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 1) * 6,
                size: Math.random() * 5 + 2,
                alpha: 1,
            });
        }

        if (ball.x < canvas.width / 2) {
            player2.score++;
            animateScore(player2);
            currentServer = player2;
        } else {
            player1.score++;
            animateScore(player1);
            currentServer = player1;
        }

        // Start net movement after any player reaches 7 points
        if (player1.score >= 7 || player2.score >= 7) {
            netMoving = true;
        }

        // Check if any player has reached 11 points
        if (player1.score >= 11 || player2.score >= 11) {
            gameOver = true;
            return;
        }

        resetBall();
    }
}

// Update ball after net collision animation
function updateBallAfterNetCollision() {
    if (!ball.netCollision) return;

    ball.y += ball.dy;
    ball.dy += gravity * 0.5; // Slower gravity for effect

    // Add to trail
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 10) {
        ball.trail.shift();
    }

    if (ball.y + ballRadius >= canvas.height) {
        // Small bounce effect
        ball.dy = -ball.dy * 0.3; // Reduce speed for minimal bounce
        ball.y = canvas.height - ballRadius;

        // Count bounces
        if (Math.abs(ball.dy) < 1) {
            ball.netCollision = false;

            if (ball.x < canvas.width / 2) {
                // Ball is on the left side, point to player 2
                player2.score++;
                animateScore(player2);
                currentServer = player2;
            } else {
                // Ball is on the right side, point to player1
                player1.score++;
                animateScore(player1);
                currentServer = player1;
            }

            // Start net movement after any player reaches 7 points
            if (player1.score >= 7 || player2.score >= 7) {
                netMoving = true;
            }

            // Check if any player has reached 11 points
            if (player1.score >= 11 || player2.score >= 11) {
                gameOver = true;
                return;
            }

            resetBall();
        }
    }
}

// // Update player positions and handle smash cooldowns
function updatePlayers(player, key, action) {
    const oppositePlayer = player === 1 ? player2 : player1;
    const sendPlayer = player === 1 ? 2 : 1;
    let keyAction;
    // Handle reactions for both players
    if (action === "reaction") {
        if (key === "w") {
            oppositePlayer.dy = -12 * oppositePlayer.speedMultiplier;
            oppositePlayer.onGround = false;
        } else if (key === "a") {
            oppositePlayer.x -= 12 * oppositePlayer.speedMultiplier;
        } else if (key === "d") {
            oppositePlayer.x += 12 * oppositePlayer.speedMultiplier;
        }
    } else {
        // Player 1 Controls
        if (player == 1){
            if (!player1.isStuck) {
                if ((keys["w"] && player1.onGround) || (keys["ArrowUp"] && player1.onGround)) {
                    player1.dy = -12 * player1.speedMultiplier;
                    player1.onGround = false;
                    keyAction = "w";
                    Socket.updatePlayers(sendPlayer, keyAction, "reaction");
                    console.log("sending: "+ sendPlayer + keyAction)
                }
                if ((keys["a"] && player1.x > 0)||(keys["ArrowLeft"] && player1.x > 0)) {
                    player1.x -= 12 * player1.speedMultiplier;
                    keyAction = "a";
                    Socket.updatePlayers(sendPlayer, keyAction, "reaction");
                    console.log("sending: "+ sendPlayer + keyAction)
                }
                if ((keys["d"] && player1.x < canvas.width / 2 - getPlayerWidth(player1)) || (keys["ArrowRight"] && player1.x < canvas.width / 2 - getPlayerWidth(player1))) {
                    player1.x += 12 * player1.speedMultiplier;
                    keyAction = "d";
                    Socket.updatePlayers(sendPlayer, keyAction, "reaction");
                    console.log("sending: "+ sendPlayer + keyAction)
                }
            } else {
                // Check if stuck duration is over
                if (Date.now() - player1.stuckTime >= player1.stuckDuration) {
                    player1.isStuck = false;
                }
            }
        }

        // Player 2 Controls
        else if (player == 2) {
                if (!player2.isStuck) {
                    if ((keys["ArrowUp"] && player2.onGround) || (keys["w"] && player2.onGround)) {
                        player2.dy = -12 * player2.speedMultiplier;
                        player2.onGround = false;
                        keyAction = "w";
                        Socket.updatePlayers(sendPlayer, keyAction, "reaction");
                        console.log("sending: "+ sendPlayer + keyAction)
                    }
                    if ((keys["ArrowLeft"] && player2.x > canvas.width / 2 + netWidth) || (keys["a"] && player2.x > canvas.width / 2 + netWidth)) {
                        player2.x -= 12 * player2.speedMultiplier;
                        keyAction = "a";
                        Socket.updatePlayers(sendPlayer, keyAction, "reaction");
                        console.log("sending: "+ sendPlayer + keyAction)
                    }
                    if ((keys["ArrowRight"] && player2.x < canvas.width - getPlayerWidth(player2)) || (keys["d"] && player2.x < canvas.width - getPlayerWidth(player2))) {
                        player2.x += 12 * player2.speedMultiplier;
                        keyAction = "d";
                        Socket.updatePlayers(sendPlayer, keyAction, "reaction");
                        console.log("sending: "+ sendPlayer + keyAction)
                    }
                } else {
                    // Check if stuck duration is over
                    if (Date.now() - player2.stuckTime >= player2.stuckDuration) {
                        player2.isStuck = false;
                    }
                }
        }
    }

    // Update player positions and handle collisions
    [player1, player2].forEach((p) => {
        p.y += p.dy;
        p.dy += gravity;
        // Handle ground collision
        if (p.y + getPlayerHeight(p) + getLegHeight(p) >= canvas.height) {
            p.y = canvas.height - getPlayerHeight(p) + 5 - getLegHeight(p);
            p.dy = 0;
            p.onGround = true;
        }
        // Handle cooldowns and power-ups
        handleCooldownsAndPowerUps(p);
    });
}

function handleCooldownsAndPowerUps(player) {
    // Smash cooldown handling
    if (!player.canSmash) {
        const timeSinceLastSmash = Date.now() - player.lastSmashTime;
        if (timeSinceLastSmash >= player.smashCooldownTime) {
            player.canSmash = true;
        }
    }

    // Speed power-up duration handling
    if (player.speedMultiplier > player.sizeMultiplier) {
        const timeSinceSpeed = Date.now() - player.speedTime;
        if (timeSinceSpeed >= player.speedDuration) {
            player.speedMultiplier = player.sizeMultiplier;
        }
    }

    // Enlarge power-up duration handling
    if (player.enlarged) {
        const timeSinceEnlarge = Date.now() - player.enlargeTime;
        if (timeSinceEnlarge >= player.enlargeDuration) {
            player.enlarged = false;
        }
    }
}


// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        showGameOverScreen();
        return;
    }

    // Background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    drawNet();
    drawPlayer(player1);
    drawPlayer(player2);
    if (ballImage.complete) drawBall();
    drawParticles();
    drawPowerUps();
    drawScores();
    drawSmashUI();
    drawTrajectory();
}

// Show game over screen
function showGameOverScreen() {
    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Winner text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let winnerText = '';
    if (player1.score >= 11) {
        winnerText = 'Player 1 Wins!';
    } else if (player2.score >= 11) {
        winnerText = 'Player 2 Wins!';
    }

    ctx.fillText(winnerText, canvas.width / 2, canvas.height / 2);

    // Draw confetti particles
    if (confettiParticles.length === 0) {
        for (let i = 0; i < 100; i++) {
            confettiParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                dx: (Math.random() - 0.5) * 2,
                dy: Math.random() * 2 + 1,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                size: Math.random() * 5 + 5,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
    }

    drawConfetti();
}

function drawConfetti() {
    confettiParticles.forEach((particle) => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();

        // Update particle position
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.rotation += particle.rotationSpeed;

        // Reset particle if it goes off screen
        if (particle.y > canvas.height) {
            particle.y = -particle.size;
            particle.x = Math.random() * canvas.width;
        }
    });
}

// Game loop
let gameLoopId;
function gameLoop(player, key, action) {
    draw();
    if (!gameOver) {
        if (!ball.inServe) {
            updateBall();
            updateBallAfterNetCollision();
        }
        updatePlayers(player, key, action);
        // updatePowerUps(); // Update power-ups positions
        // checkPowerUpCollisions(); // Check collision with players

        // if (netMoving) {
        //     netYPosition += netDirection * 2; // Adjust speed as needed
        //     if (netYPosition > 50 || netYPosition < -50) {
        //         netDirection *= -1;
        //     }
        // }
    }
    gameLoopId = requestAnimationFrame(() => gameLoop(player, key, "action"));
}

function returnGameLoopID(){
    return gameLoopId;
}

function stopGameLoop(gameLoopId) {
    cancelAnimationFrame(gameLoopId);
    gameLoopId = null;
}
