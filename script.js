// HTML Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const speedSelect = document.getElementById('speed');
const scoreDisplay = document.getElementById('score');
const mistakesDisplay = document.getElementById('mistakes');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScoreDisplay = document.getElementById('finalScore');

// Game Constants
const TILE_SIZE = 20;
const CANVAS_SIZE = 400; // 400x400
const MAX_MISTAKES = 10;
let gameLoop; // To store the setInterval reference
let isGameRunning = false;

// Game State Variables
let snake = [];
let food = {};
let dx = TILE_SIZE; // change in x direction (starts right)
let dy = 0;        // change in y direction
let score = 0;
let mistakes = 0;
let speed = 100; // default speed (interval in ms)

// --- Initialization Functions ---

function initGame() {
    // Reset state
    clearInterval(gameLoop);
    isGameRunning = true;
    score = 0;
    mistakes = 0;
    dx = TILE_SIZE; 
    dy = 0;
    
    // Initial snake (3 segments)
    snake = [
        { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 },
        { x: CANVAS_SIZE / 2 - TILE_SIZE, y: CANVAS_SIZE / 2 },
        { x: CANVAS_SIZE / 2 - 2 * TILE_SIZE, y: CANVAS_SIZE / 2 }
    ];

    placeFood();
    updateStats();
    gameOverMessage.classList.add('hidden');
    
    // Get selected speed
    speed = parseInt(speedSelect.value);
    
    // Start game loop
    gameLoop = setInterval(gameTick, speed);
}

// --- Game Logic Functions ---

function placeFood() {
    let newFood;
    do {
        // Random position, making sure it aligns with the grid
        newFood = {
            x: Math.floor(Math.random() * (CANVAS_SIZE / TILE_SIZE)) * TILE_SIZE,
            y: Math.floor(Math.random() * (CANVAS_SIZE / TILE_SIZE)) * TILE_SIZE
        };
    } while (isFoodOnSnake(newFood)); // Ensure food is not placed on the snake
    
    food = newFood;
}

function isFoodOnSnake(pos) {
    return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
}

function updateStats() {
    scoreDisplay.textContent = score;
    mistakesDisplay.textContent = `${mistakes} / ${MAX_MISTAKES}`;
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#e6ffe6'; // Canvas background color (light green)
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw food (Apple)
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, TILE_SIZE, TILE_SIZE);

    // Draw snake
    snake.forEach((segment, index) => {
        // Head is a different color
        ctx.fillStyle = index === 0 ? '#38761d' : 'green'; // Dark green head, lighter green body
        ctx.fillRect(segment.x, segment.y, TILE_SIZE, TILE_SIZE);
        // Add a border for better visibility
        ctx.strokeStyle = '#274e13';
        ctx.strokeRect(segment.x, segment.y, TILE_SIZE, TILE_SIZE);
    });
}

function moveSnake() {
    // New head position
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Collision check: Wall or self
    if (checkCollision(head)) {
        handleMistake();
        return false; // Movement failed
    }

    // Add new head to the beginning of the snake
    snake.unshift(head);

    // Check if the snake ate the food
    if (head.x === food.x && head.y === food.y) {
        // Increase score, don't remove the tail
        score++;
        placeFood(); // Place new food
    } else {
        // Remove the tail if no food was eaten
        snake.pop();
    }
    
    updateStats();
    return true; // Movement successful
}

function checkCollision(head) {
    // 1. Wall collision
    const hitWall = head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE;

    // 2. Self-collision (check if the head hits any segment of the body, starting from the second segment)
    const hitSelf = snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);

    return hitWall || hitSelf;
}

function handleMistake() {
    mistakes++;
    
    if (mistakes >= MAX_MISTAKES) {
        endGame();
    } else {
        // Game continues, but reset direction and add a brief pause
        // Flashing the canvas red for a moment can be a nice visual cue for a mistake
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        clearInterval(gameLoop);
        
        // Reset direction to stop the snake from moving in the same (problematic) direction
        dx = TILE_SIZE; 
        dy = 0;
        
        // Brief pause before restarting the movement
        setTimeout(() => {
            if (isGameRunning) {
                // To apply the selected speed again
                speed = parseInt(speedSelect.value);
                gameLoop = setInterval(gameTick, speed);
            }
        }, 500); // 500ms pause
    }

    updateStats();
}

function endGame() {
    isGameRunning = false;
    clearInterval(gameLoop);
    
    finalScoreDisplay.textContent = `तपाईंको अन्तिम स्कोर: ${score} (Your Final Score: ${score})`;
    gameOverMessage.classList.remove('hidden');
}

function gameTick() {
    if (isGameRunning) {
        if (moveSnake()) {
            drawGame();
        }
    }
}

// --- Event Listeners ---

startButton.addEventListener('click', () => {
    // Stop any running game before starting a new one
    clearInterval(gameLoop);
    initGame();
});

// Arrow key controls
document.addEventListener('keydown', e => {
    if (!isGameRunning) return;

    // Prevent changing direction immediately in the opposite direction
    switch (e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -TILE_SIZE; }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = TILE_SIZE; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -TILE_SIZE; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = TILE_SIZE; dy = 0; }
            break;
    }
    
    // Prevents default arrow key behavior (like scrolling the page)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});

// Initial draw when the page loads
drawGame();