// ============================================
// SNAKE GAME - STANDALONE JAVASCRIPT
// ============================================

// Global State Management
const gameState = {
    darkMode: localStorage.getItem('darkMode') === 'true',
    gameInstance: null
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeButton();
    gameState.gameInstance = SnakeGame();
    gameState.gameInstance.init();
    showGameActiveNotification('Snake');
});

// ============================================
// Game Active Status Notification
// ============================================
function showGameActiveNotification(gameName) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast game-active';
    
    toast.innerHTML = `
        <span class="toast-icon">🎮</span>
        <div class="toast-content">
            <div class="toast-title">Game Active</div>
            <div class="toast-message">You are playing: ${gameName}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// Game Result Modal
// ============================================
function showGameModal(options) {
    const { type, title, message, icon, onPlayAgain, onClose } = options;
    
    const modal = document.getElementById('gameModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const playAgainBtn = document.getElementById('modalPlayAgain');
    const closeBtn = document.getElementById('modalClose');
    
    if (!modal) return;
    
    modalIcon.textContent = icon || '🎮';
    modalTitle.textContent = title || 'Game Over';
    modalMessage.textContent = message || '';
    
    modalTitle.className = 'modal-title';
    if (type === 'win') modalTitle.classList.add('win');
    else if (type === 'lose') modalTitle.classList.add('lose');
    else if (type === 'draw') modalTitle.classList.add('draw');
    
    const newPlayAgainBtn = playAgainBtn.cloneNode(true);
    const newCloseBtn = closeBtn.cloneNode(true);
    playAgainBtn.parentNode.replaceChild(newPlayAgainBtn, playAgainBtn);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    
    newPlayAgainBtn.addEventListener('click', () => {
        hideGameModal();
        if (onPlayAgain) onPlayAgain();
    });
    
    newCloseBtn.addEventListener('click', () => {
        hideGameModal();
        if (onClose) onClose();
    });
    
    modal.classList.add('active');
}

function hideGameModal() {
    const modal = document.getElementById('gameModal');
    if (modal) modal.classList.remove('active');
}

// ============================================
// Toast Notifications
// ============================================
function showToast(options) {
    const { type = 'info', icon, title, message, duration = 3000 } = options;
    
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const defaultIcons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icon || defaultIcons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${title || ''}</div>
            <div class="toast-message">${message || ''}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, duration);
}

// ============================================
// Confirmation Modal
// ============================================
function showConfirmModal(options) {
    const { icon, title, message, onConfirm, onCancel } = options;
    
    const modal = document.getElementById('confirmModal');
    const confirmIcon = document.getElementById('confirmIcon');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');
    
    if (!modal) return;
    
    if (confirmIcon) confirmIcon.textContent = icon || '⚠️';
    if (confirmTitle) confirmTitle.textContent = title || 'Confirm';
    if (confirmMessage) confirmMessage.textContent = message || 'Are you sure?';
    
    const newYesBtn = yesBtn.cloneNode(true);
    const newNoBtn = noBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    noBtn.parentNode.replaceChild(newNoBtn, noBtn);
    
    newYesBtn.addEventListener('click', () => {
        hideConfirmModal();
        if (onConfirm) onConfirm();
    });
    
    newNoBtn.addEventListener('click', () => {
        hideConfirmModal();
        if (onCancel) onCancel();
    });
    
    modal.classList.add('active');
}

function hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('active');
}

// ============================================
// Theme Management
// ============================================
function initTheme() {
    if (gameState.darkMode) {
        document.body.classList.add('dark-mode');
        updateThemeBtn();
    }
}

function toggleTheme() {
    gameState.darkMode = !gameState.darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', gameState.darkMode);
    updateThemeBtn();
}

function updateThemeBtn() {
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.textContent = gameState.darkMode ? '☀️' : '🌙';
    }
}

function setupThemeButton() {
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn && !themeBtn.dataset.listenerAttached) {
        themeBtn.addEventListener('click', toggleTheme);
        themeBtn.dataset.listenerAttached = 'true';
        updateThemeBtn();
    }
}

// ============================================
// SNAKE GAME - Factory Pattern
// ============================================
function SnakeGame() {
    const state = {
        canvas: null,
        ctx: null,
        gridSize: 20,
        tileCount: 20,
        snake: [],
        food: { x: 0, y: 0 },
        direction: { x: 0, y: 0 },
        nextDirection: { x: 0, y: 0 },
        score: 0,
        highScore: parseInt(localStorage.getItem('snakeHighScore')) || 0,
        speed: 1,
        gameActive: false,
        isPaused: false,
        gameLoop: null,
        baseSpeed: 150,
        eventListeners: []
    };

    function init() {
        state.canvas = document.getElementById('snakeCanvas');
        if (!state.canvas) return;
        
        state.ctx = state.canvas.getContext('2d');
        state.tileCount = Math.floor(state.canvas.width / state.gridSize);
        
        loadHighScore();
        updateDisplay();
        setupControls();
        showOverlay('Snake Game', 'Press Start or Space to play');
        drawGame();
    }

    function setupControls() {
        // Keyboard controls
        const keyHandler = (e) => {
            const key = e.key.toLowerCase();
            
            // Start game on space
            if (key === ' ' || key === 'space') {
                e.preventDefault();
                if (!state.gameActive) {
                    startGame();
                } else {
                    togglePause();
                }
                return;
            }
            
            // Direction controls
            if (!state.gameActive || state.isPaused) return;
            
            switch (key) {
                case 'arrowup':
                case 'w':
                    if (state.direction.y !== 1) {
                        state.nextDirection = { x: 0, y: -1 };
                    }
                    e.preventDefault();
                    break;
                case 'arrowdown':
                case 's':
                    if (state.direction.y !== -1) {
                        state.nextDirection = { x: 0, y: 1 };
                    }
                    e.preventDefault();
                    break;
                case 'arrowleft':
                case 'a':
                    if (state.direction.x !== 1) {
                        state.nextDirection = { x: -1, y: 0 };
                    }
                    e.preventDefault();
                    break;
                case 'arrowright':
                case 'd':
                    if (state.direction.x !== -1) {
                        state.nextDirection = { x: 1, y: 0 };
                    }
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', keyHandler);
        state.eventListeners.push({ element: document, event: 'keydown', handler: keyHandler });
        
        // Button controls
        const startBtn = document.getElementById('snakeStartBtn');
        const pauseBtn = document.getElementById('snakePauseBtn');
        const resetBtn = document.getElementById('snakeResetBtn');
        
        if (startBtn) {
            const handler = () => startGame();
            startBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: startBtn, event: 'click', handler });
        }
        
        if (pauseBtn) {
            const handler = () => togglePause();
            pauseBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: pauseBtn, event: 'click', handler });
        }
        
        if (resetBtn) {
            const handler = () => {
                showConfirmModal({
                    icon: '🔄',
                    title: 'Reset Game?',
                    message: 'This will end your current game. Continue?',
                    onConfirm: () => resetGame()
                });
            };
            resetBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: resetBtn, event: 'click', handler });
        }
        
        // Mobile controls
        const mobileControls = document.getElementById('snakeMobileControls');
        if (mobileControls) {
            const mobileBtns = mobileControls.querySelectorAll('.mobile-btn');
            mobileBtns.forEach(btn => {
                const handler = (e) => {
                    e.preventDefault();
                    if (!state.gameActive || state.isPaused) return;
                    
                    const dir = btn.dataset.direction;
                    switch (dir) {
                        case 'up':
                            if (state.direction.y !== 1) state.nextDirection = { x: 0, y: -1 };
                            break;
                        case 'down':
                            if (state.direction.y !== -1) state.nextDirection = { x: 0, y: 1 };
                            break;
                        case 'left':
                            if (state.direction.x !== 1) state.nextDirection = { x: -1, y: 0 };
                            break;
                        case 'right':
                            if (state.direction.x !== -1) state.nextDirection = { x: 1, y: 0 };
                            break;
                    }
                };
                btn.addEventListener('click', handler);
                state.eventListeners.push({ element: btn, event: 'click', handler });
            });
        }
    }

    function startGame() {
        state.snake = [
            { x: Math.floor(state.tileCount / 2), y: Math.floor(state.tileCount / 2) }
        ];
        state.direction = { x: 1, y: 0 };
        state.nextDirection = { x: 1, y: 0 };
        state.score = 0;
        state.speed = 1;
        state.gameActive = true;
        state.isPaused = false;
        
        spawnFood();
        hideOverlay();
        updateDisplay();
        
        playSound('gameStart');
        showToast({
            type: 'info',
            icon: '🐍',
            title: 'Game Started!',
            message: 'Use arrow keys or WASD to move',
            duration: 2000
        });
        
        if (state.gameLoop) clearInterval(state.gameLoop);
        state.gameLoop = setInterval(gameStep, state.baseSpeed);
    }

    function gameStep() {
        if (!state.gameActive || state.isPaused) return;
        
        state.direction = { ...state.nextDirection };
        
        const head = {
            x: state.snake[0].x + state.direction.x,
            y: state.snake[0].y + state.direction.y
        };
        
        // Check wall collision
        if (head.x < 0 || head.x >= state.tileCount || head.y < 0 || head.y >= state.tileCount) {
            gameOver();
            return;
        }
        
        // Check self collision
        for (let segment of state.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver();
                return;
            }
        }
        
        state.snake.unshift(head);
        
        // Check food collision
        if (head.x === state.food.x && head.y === state.food.y) {
            state.score += 10;
            playSound('eat');
            
            // Increase speed every 50 points
            if (state.score % 50 === 0) {
                state.speed++;
                clearInterval(state.gameLoop);
                const newSpeed = Math.max(state.baseSpeed - (state.speed - 1) * 15, 50);
                state.gameLoop = setInterval(gameStep, newSpeed);
                
                showToast({
                    type: 'success',
                    icon: '⚡',
                    title: 'Speed Up!',
                    message: `Level ${state.speed}!`,
                    duration: 1500
                });
                playSound('levelUp');
            }
            
            spawnFood();
            updateDisplay();
        } else {
            state.snake.pop();
        }
        
        drawGame();
    }

    function spawnFood() {
        let newFood;
        let isOnSnake;
        
        do {
            isOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * state.tileCount),
                y: Math.floor(Math.random() * state.tileCount)
            };
            
            for (let segment of state.snake) {
                if (newFood.x === segment.x && newFood.y === segment.y) {
                    isOnSnake = true;
                    break;
                }
            }
        } while (isOnSnake);
        
        state.food = newFood;
    }

    function drawGame() {
        if (!state.ctx) return;
        
        const ctx = state.ctx;
        const size = state.gridSize;
        
        // Clear canvas
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-secondary').trim() || '#1e293b';
        ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
        
        // Draw grid (subtle)
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#334155';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= state.tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * size, 0);
            ctx.lineTo(i * size, state.canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * size);
            ctx.lineTo(state.canvas.width, i * size);
            ctx.stroke();
        }
        
        // Draw food
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(
            state.food.x * size + size / 2,
            state.food.y * size + size / 2,
            size / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw snake
        state.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                ctx.fillStyle = '#10b981';
            } else {
                // Body gradient
                const shade = Math.max(0.4, 1 - index * 0.03);
                ctx.fillStyle = `rgba(16, 185, 129, ${shade})`;
            }
            
            ctx.fillRect(
                segment.x * size + 1,
                segment.y * size + 1,
                size - 2,
                size - 2
            );
            
            // Round corners for head
            if (index === 0) {
                ctx.fillStyle = '#059669';
                ctx.beginPath();
                ctx.arc(
                    segment.x * size + size / 2,
                    segment.y * size + size / 2,
                    size / 4,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });
    }

    function gameOver() {
        state.gameActive = false;
        clearInterval(state.gameLoop);
        playSound('lose');
        
        // Update high score
        if (state.score > state.highScore) {
            state.highScore = state.score;
            localStorage.setItem('snakeHighScore', state.highScore);
            
            showGameModal({
                type: 'win',
                icon: '🏆',
                title: 'New High Score!',
                message: `Amazing! You scored ${state.score} points!`,
                onPlayAgain: () => startGame()
            });
        } else {
            showGameModal({
                type: 'lose',
                icon: '💀',
                title: 'Game Over!',
                message: `You scored ${state.score} points. High score: ${state.highScore}`,
                onPlayAgain: () => startGame()
            });
        }
        
        updateDisplay();
        showOverlay('Game Over', `Score: ${state.score} | High Score: ${state.highScore}`);
    }

    function togglePause() {
        if (!state.gameActive) return;
        
        state.isPaused = !state.isPaused;
        const pauseBtn = document.getElementById('snakePauseBtn');
        
        if (state.isPaused) {
            if (pauseBtn) pauseBtn.textContent = 'Resume';
            showOverlay('Paused', 'Press Space or Resume to continue');
        } else {
            if (pauseBtn) pauseBtn.textContent = 'Pause';
            hideOverlay();
        }
    }

    function resetGame() {
        state.gameActive = false;
        state.isPaused = false;
        clearInterval(state.gameLoop);
        
        state.snake = [];
        state.score = 0;
        state.speed = 1;
        state.direction = { x: 0, y: 0 };
        state.nextDirection = { x: 0, y: 0 };
        
        const pauseBtn = document.getElementById('snakePauseBtn');
        if (pauseBtn) pauseBtn.textContent = 'Pause';
        
        updateDisplay();
        drawGame();
        showOverlay('Snake Game', 'Press Start or Space to play');
        
        showToast({
            type: 'info',
            icon: '🔄',
            title: 'Game Reset',
            message: 'Ready to play again!',
            duration: 2000
        });
    }

    function showOverlay(title, message) {
        const overlay = document.getElementById('snakeOverlay');
        const overlayTitle = document.getElementById('snakeOverlayTitle');
        const overlayMessage = document.getElementById('snakeOverlayMessage');
        
        if (overlayTitle) overlayTitle.textContent = title;
        if (overlayMessage) overlayMessage.textContent = message;
        if (overlay) overlay.classList.remove('hidden');
    }

    function hideOverlay() {
        const overlay = document.getElementById('snakeOverlay');
        if (overlay) overlay.classList.add('hidden');
    }

    function updateDisplay() {
        const scoreEl = document.getElementById('snakeScore');
        const highScoreEl = document.getElementById('snakeHighScore');
        const speedEl = document.getElementById('snakeSpeed');
        
        if (scoreEl) scoreEl.textContent = state.score;
        if (highScoreEl) highScoreEl.textContent = state.highScore;
        if (speedEl) speedEl.textContent = state.speed;
    }

    function loadHighScore() {
        state.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    }

    // playSound is provided globally by sounds.js

    function cleanup() {
        if (state.gameLoop) {
            clearInterval(state.gameLoop);
        }
        state.gameActive = false;
        state.isPaused = false;
    }

    function pause() {
        if (state.gameActive && !state.isPaused) {
            state.isPaused = true;
            const pauseBtn = document.getElementById('snakePauseBtn');
            if (pauseBtn) pauseBtn.textContent = 'Resume';
            showOverlay('Paused', 'Game paused - switch tabs to resume');
        }
    }

    function activate() {
        drawGame();
        if (state.gameActive && state.isPaused) {
            // Keep paused state when returning
        }
    }

    return {
        init,
        cleanup,
        pause,
        activate
    };
}
