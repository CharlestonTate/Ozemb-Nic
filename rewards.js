// Points Management
let totalPoints = parseInt(localStorage.getItem('ozembnicPoints')) || 0;
let gamePoints = 0;
let gameScore = 0;

// Initialize points display
function updatePointsDisplay() {
    const pointsElement = document.getElementById('totalPoints');
    if (pointsElement) {
        pointsElement.textContent = totalPoints.toLocaleString();
    }
}

// Save points to local storage
function savePoints() {
    localStorage.setItem('ozembnicPoints', totalPoints.toString());
    updatePointsDisplay();
}

// Add points
function addPoints(amount) {
    totalPoints += amount;
    savePoints();
}

// Deduct points
function deductPoints(amount) {
    if (totalPoints >= amount) {
        totalPoints -= amount;
        savePoints();
        return true;
    }
    return false;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updatePointsDisplay();
    initializeRewards();
    initializeGame();
    
    // Handle window resize for mobile orientation changes
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (canvas && gameState === 'waiting') {
                // Recalculate canvas size on resize
                const isMobile = window.innerWidth <= 768;
                const maxWidth = isMobile ? Math.min(400, window.innerWidth - 40) : 400;
                canvas.width = maxWidth;
                canvas.height = (maxWidth * 3) / 2;
                canvas.style.width = '100%';
                canvas.style.maxWidth = maxWidth + 'px';
                draw();
            }
        }, 250);
    });
});

// Rewards Redemption
function initializeRewards() {
    const rewardButtons = document.querySelectorAll('.reward-btn');
    
    rewardButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cost = parseInt(this.getAttribute('data-cost'));
            const name = this.getAttribute('data-name');
            
            if (totalPoints >= cost) {
                if (confirm(`Redeem ${name} for ${cost.toLocaleString()} points?`)) {
                    if (deductPoints(cost)) {
                        alert(`Successfully redeemed ${name}!`);
                        updateRewardButtons();
                    }
                }
            } else {
                const needed = cost - totalPoints;
                alert(`You need ${needed.toLocaleString()} more points to redeem ${name}. Keep playing to earn more!`);
            }
        });
    });
    
    updateRewardButtons();
}

function updateRewardButtons() {
    const rewardButtons = document.querySelectorAll('.reward-btn');
    
    rewardButtons.forEach(button => {
        const cost = parseInt(button.getAttribute('data-cost'));
        if (totalPoints >= cost) {
            button.disabled = false;
            button.textContent = 'Redeem';
        } else {
            button.disabled = false;
            button.textContent = `Need ${(cost - totalPoints).toLocaleString()} more`;
        }
    });
}

// Flappy Bird Game
let canvas, ctx;
let bird, pipes = [];
let gameState = 'waiting'; // 'waiting', 'playing', 'gameover'
let animationId;
let birdImage;

function initializeGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    // Set canvas size with aspect ratio (width:height = 2:3)
    // Responsive sizing for mobile
    const isMobile = window.innerWidth <= 768;
    const maxWidth = isMobile ? Math.min(400, window.innerWidth - 40) : 400;
    canvas.width = maxWidth;
    canvas.height = (maxWidth * 3) / 2; // 600 for 400 width
    
    // Update canvas style for proper mobile display
    canvas.style.width = '100%';
    canvas.style.maxWidth = maxWidth + 'px';
    canvas.style.height = 'auto';
    
    // Load bird image
    birdImage = new Image();
    birdImage.src = 'img/nicFLAPPY.png';
    
    bird = {
        x: 50,
        y: canvas.height / 2,
        width: 60,  // Increased from 40 - bigger bird
        height: 60,  // Increased from 40 - bigger bird
        velocity: 0,
        gravity: 0.1,  // Reduced from 0.25 - more floaty
        jump: -5  // Adjusted for bigger bird
    };
    
    // Game controls
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('resetGameBtn').addEventListener('click', resetGame);
    
    // Desktop controls
    canvas.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyPress);
    
    // Mobile touch controls
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchend', handleTouch, { passive: false });
    
    // Prevent scrolling on mobile when touching canvas
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    draw();
}

function handleClick(e) {
    e.preventDefault();
    if (gameState === 'waiting') {
        startGame();
    } else if (gameState === 'playing') {
        jump();
    }
}

function handleTouch(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (gameState === 'waiting') {
        startGame();
    } else if (gameState === 'playing') {
        jump();
    }
    
    return false;
}

function handleKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'waiting') {
            startGame();
        } else if (gameState === 'playing') {
            jump();
        }
    }
}

function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jump;
    }
}

function startGame() {
    gameState = 'playing';
    gameScore = 0;
    gamePoints = 0;
    pipes = [];
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    document.getElementById('startGameBtn').style.display = 'none';
    document.getElementById('resetGameBtn').style.display = 'inline-flex';
    
    updateGameStats();
    gameLoop();
}

function resetGame() {
    gameState = 'waiting';
    cancelAnimationFrame(animationId);
    pipes = [];
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    gameScore = 0;
    gamePoints = 0;
    
    document.getElementById('startGameBtn').style.display = 'inline-flex';
    document.getElementById('resetGameBtn').style.display = 'none';
    
    updateGameStats();
    draw();
}

function gameLoop() {
    if (gameState !== 'playing') return;
    
    update();
    draw();
    
    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Check boundaries
    if (bird.y + bird.height > canvas.height) {
        gameOver();
        return;
    }
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
    
    // Generate pipes (slower generation)
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 350) {
        createPipe();
    }
    
    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= 1.5;  // Reduced from 3 - much slower
        
        // Check collision
        if (checkCollision(bird, pipe)) {
            gameOver();
            return;
        }
        
        // Score point
        if (!pipe.scored && pipe.x + pipe.width < bird.x) {
            pipe.scored = true;
            gameScore++;
            gamePoints++;
            addPoints(1);
            updateGameStats();
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipe.width < 0) {
            pipes.splice(i, 1);
        }
    }
}

function createPipe() {
    const gap = 220;  // Increased from 180 - much bigger gaps
    const minHeight = 60;
    const maxHeight = canvas.height - gap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        width: 50,  // Slightly narrower pipes
        topHeight: topHeight,
        bottomY: topHeight + gap,
        bottomHeight: canvas.height - (topHeight + gap),
        scored: false
    });
}

function checkCollision(bird, pipe) {
    return bird.x < pipe.x + pipe.width &&
           bird.x + bird.width > pipe.x &&
           (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    if (gameState === 'waiting') {
        // Draw waiting screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click or Press SPACE', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('to Start!', canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // Draw pipes
    ctx.fillStyle = '#228B22'; // Forest green
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottomHeight);
    });
    
    // Draw bird
    if (birdImage.complete) {
        ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
    } else {
        // Fallback circle if image not loaded
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw score
    if (gameState === 'playing') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(gameScore.toString(), canvas.width / 2, 50);
    }
}

function gameOver() {
    gameState = 'gameover';
    cancelAnimationFrame(animationId);
    
    // Add earned points to total
    if (gamePoints > 0) {
        // Points already added during gameplay
        updateRewardButtons();
    }
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${gameScore}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Points Earned: ${gamePoints}`, canvas.width / 2, canvas.height / 2 + 30);
    
    ctx.font = '18px Arial';
    ctx.fillText('Click Reset to play again', canvas.width / 2, canvas.height / 2 + 70);
}

function updateGameStats() {
    const scoreElement = document.getElementById('gameScore');
    const pointsElement = document.getElementById('pointsEarned');
    
    if (scoreElement) {
        scoreElement.textContent = gameScore;
    }
    if (pointsElement) {
        pointsElement.textContent = gamePoints;
    }
}

