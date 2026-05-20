// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
let score = 0;
let currentLevel = 1;
let levelComplete = false;
let canContinue = false;

// Keyboard Input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') e.preventDefault();
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Player Object
const player = {
    x: 50,
    y: 400,
    width: 30,
    height: 30,
    velocityY: 0,
    velocityX: 0,
    isJumping: false,
    speed: 5,
    jumpPower: 12,
    friction: 0.9,
    color: '#FF6B6B'
};

// Game State
let platforms = [];
let coins = [];
let goal = {};

// Physics Constants
const GRAVITY = 0.6;

// Initialize Level
function initLevel(levelNum) {
    platforms = [];
    coins = [];
    levelComplete = false;
    canContinue = false;
    player.x = 50;
    player.y = 400;
    player.velocityY = 0;
    player.velocityX = 0;
    player.isJumping = false;

    if (levelNum === 1) {
        // Level 1: Simple Intro
        platforms = [
            { x: 0, y: 570, width: 800, height: 30, color: '#8B7355' }, // Ground
            { x: 150, y: 480, width: 200, height: 20, color: '#4CAF50' },
            { x: 450, y: 420, width: 200, height: 20, color: '#4CAF50' },
            { x: 200, y: 320, width: 150, height: 20, color: '#4CAF50' },
        ];
        coins = [
            { x: 250, y: 440, radius: 8, collected: false },
            { x: 520, y: 380, radius: 8, collected: false },
            { x: 270, y: 280, radius: 8, collected: false },
        ];
        goal = { x: 700, y: 490, width: 60, height: 80 };
    } else if (levelNum === 2) {
        // Level 2: Jumping Challenge
        platforms = [
            { x: 0, y: 570, width: 800, height: 30, color: '#8B7355' },
            { x: 80, y: 480, width: 120, height: 20, color: '#4CAF50' },
            { x: 250, y: 420, width: 100, height: 20, color: '#4CAF50' },
            { x: 420, y: 360, width: 100, height: 20, color: '#4CAF50' },
            { x: 580, y: 300, width: 100, height: 20, color: '#4CAF50' },
        ];
        coins = [
            { x: 140, y: 440, radius: 8, collected: false },
            { x: 300, y: 380, radius: 8, collected: false },
            { x: 470, y: 320, radius: 8, collected: false },
            { x: 630, y: 260, radius: 8, collected: false },
        ];
        goal = { x: 700, y: 430, width: 60, height: 80 };
    } else if (levelNum === 3) {
        // Level 3: Complex Platforming
        platforms = [
            { x: 0, y: 570, width: 800, height: 30, color: '#8B7355' },
            { x: 50, y: 480, width: 100, height: 20, color: '#4CAF50' },
            { x: 180, y: 420, width: 90, height: 20, color: '#4CAF50' },
            { x: 330, y: 360, width: 80, height: 20, color: '#4CAF50' },
            { x: 470, y: 300, width: 80, height: 20, color: '#4CAF50' },
            { x: 610, y: 360, width: 80, height: 20, color: '#4CAF50' },
            { x: 650, y: 480, width: 100, height: 20, color: '#4CAF50' },
        ];
        coins = [
            { x: 100, y: 440, radius: 8, collected: false },
            { x: 225, y: 380, radius: 8, collected: false },
            { x: 370, y: 320, radius: 8, collected: false },
            { x: 510, y: 260, radius: 8, collected: false },
            { x: 650, y: 320, radius: 8, collected: false },
            { x: 700, y: 440, radius: 8, collected: false },
        ];
        goal = { x: 720, y: 400, width: 60, height: 80 };
    }
}

// Update Game
function update() {
    if (levelComplete) {
        return;
    }

    // Movement
    if (keys['a'] || keys['ArrowLeft']) {
        player.velocityX = -player.speed;
    } else if (keys['d'] || keys['ArrowRight']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= player.friction;
    }

    player.x += player.velocityX;

    // Boundary checking
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Gravity
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Jumping
    if ((keys[' '] || keys['w'] || keys['W'] || keys['ArrowUp']) && player.isJumping === false) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
    }

    // Platform Collision
    player.isJumping = true;
    for (let platform of platforms) {
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + platform.height + 5 &&
            player.velocityY >= 0
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
        }
    }

    // Coin Collection
    for (let coin of coins) {
        if (!coin.collected) {
            const dx = player.x + player.width / 2 - coin.x;
            const dy = player.y + player.height / 2 - coin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player.width / 2 + coin.radius) {
                coin.collected = true;
                score += 10;
                document.getElementById('score').textContent = score;
            }
        }
    }

    // Goal Check
    if (
        player.x + player.width > goal.x &&
        player.x < goal.x + goal.width &&
        player.y + player.height > goal.y
    ) {
        levelComplete = true;
        canContinue = true;
        showLevelComplete();
    }

    // Fall off map
    if (player.y > canvas.height) {
        initLevel(currentLevel);
    }
}

// Draw Game
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    for (let platform of platforms) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw coins
    for (let coin of coins) {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x, coin.y);
            ctx.rotate((Date.now() / 500) % (2 * Math.PI));
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
    }

    // Draw goal flag
    ctx.fillStyle = '#FF6347';
    ctx.fillRect(goal.x + 10, goal.y, goal.width - 10, goal.height);
    
    // Flag pole
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(goal.x + 15, goal.y);
    ctx.lineTo(goal.x + 15, goal.y + goal.height);
    ctx.stroke();

    // Flag waving effect
    const waveOffset = Math.sin(Date.now() / 200) * 5;
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(goal.x + 25, goal.y + waveOffset, 25, 15);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(goal.x + 25, goal.y + waveOffset, 25, 15);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);

    // Draw eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 8, player.y + 8, 6, 6);
    ctx.fillRect(player.x + 16, player.y + 8, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 9, player.y + 9, 4, 4);
    ctx.fillRect(player.x + 17, player.y + 9, 4, 4);
}

// Show Level Complete Message
function showLevelComplete() {
    const levelCompleteDiv = document.getElementById('levelComplete');
    const completeText = document.getElementById('completeText');
    const levelScore = document.getElementById('levelScore');

    if (currentLevel === 3) {
        completeText.textContent = '🎉 Game Complete!';
        levelScore.textContent = `Final Score: ${score}`;
    } else {
        completeText.textContent = `✅ Level ${currentLevel} Complete!`;
        levelScore.textContent = `Score: ${score}`;
    }

    levelCompleteDiv.style.display = 'block';
}

// Handle Level Continue
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && canContinue) {
        const levelCompleteDiv = document.getElementById('levelComplete');
        levelCompleteDiv.style.display = 'none';

        if (currentLevel < 3) {
            currentLevel++;
            document.getElementById('level').textContent = currentLevel;
            initLevel(currentLevel);
        } else {
            // Game complete - restart
            currentLevel = 1;
            score = 0;
            document.getElementById('level').textContent = currentLevel;
            document.getElementById('score').textContent = score;
            initLevel(currentLevel);
        }
    }
});

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start Game
initLevel(currentLevel);
gameLoop();
