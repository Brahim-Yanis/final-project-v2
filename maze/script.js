// ============================================
// MEMORY MAZE GAME - STANDALONE JAVASCRIPT
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
    gameState.gameInstance = MazeGame();
    gameState.gameInstance.init();
    showGameActiveNotification('Maze');
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
    
    // Redraw maze when theme changes
    if (gameState.gameInstance && gameState.gameInstance.redraw) {
        gameState.gameInstance.redraw();
    }
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
// MEMORY MAZE GAME - Factory Pattern
// ============================================
function MazeGame() {
    // Available colors for memory sequences
    const COLORS = ['red', 'yellow', 'green', 'blue', 'purple'];
    
    // Maze layout: 0 = path, 1 = wall, 2 = gate, 3 = start, 4 = end
    const MAZE_TEMPLATES = [
        // Level 1 - Simple maze with 3 gates
        [
            [1,1,1,1,1,1,1,1,1,1,1],
            [1,3,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,0,1,0,1,1,0,1],
            [1,0,0,0,0,2,0,0,1,0,1],
            [1,0,1,1,1,1,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,1,2,1],
            [1,1,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,2,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,4,1],
            [1,1,1,1,1,1,1,1,1,1,1]
        ],
        // Level 2 - More complex
        [
            [1,1,1,1,1,1,1,1,1,1,1],
            [1,3,0,1,0,0,0,0,0,0,1],
            [1,0,0,1,0,1,1,1,1,0,1],
            [1,0,1,1,0,0,0,0,1,0,1],
            [1,0,0,2,0,1,1,0,2,0,1],
            [1,1,1,1,0,1,0,0,1,0,1],
            [1,0,0,0,0,1,0,1,1,0,1],
            [1,0,1,1,1,1,0,0,0,0,1],
            [1,0,0,0,2,1,1,1,1,0,1],
            [1,1,1,0,0,0,0,0,0,4,1],
            [1,1,1,1,1,1,1,1,1,1,1]
        ],
        // Level 3 - Hard maze
        [
            [1,1,1,1,1,1,1,1,1,1,1],
            [1,3,0,0,2,0,0,0,1,0,1],
            [1,1,1,0,1,1,1,0,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,1,1,0,2,0,1,0,1],
            [1,0,1,0,0,0,1,1,1,0,1],
            [1,0,1,0,1,0,0,0,0,0,1],
            [1,0,0,0,1,1,1,1,2,0,1],
            [1,1,1,0,0,0,0,0,1,0,1],
            [1,0,0,0,1,1,1,0,0,4,1],
            [1,1,1,1,1,1,1,1,1,1,1]
        ]
    ];

    // Game state - persisted across theme changes
    const state = {
        level: parseInt(localStorage.getItem('mazeLevel')) || 1,
        score: parseInt(localStorage.getItem('mazeScore')) || 0,
        lives: parseInt(localStorage.getItem('mazeLives')) || 3,
        maze: null,
        playerPos: { x: 1, y: 1 },
        gates: [],           // Array of gate positions with their unlock status
        currentGate: null,   // Gate currently being challenged
        sequence: [],        // Current color sequence to memorize
        playerSequence: [],  // Player's input sequence
        sequenceIndex: 0,    // Current position in sequence playback
        isPlayingSequence: false,
        isInputEnabled: false,
        gatesSolved: 0,
        totalGates: 0,
        soundEnabled: true,
        gameActive: true,
        eventListeners: []
    };

    // ==================== INITIALIZATION ====================
    
    function init() {
        loadSavedState();
        setupMaze();
        setupControls();
        updateDisplay();
        
        // Position player at start
        findStartPosition();
        updatePlayerPosition();
    }

    function loadSavedState() {
        // Load persistent state from localStorage
        const savedGates = localStorage.getItem('mazeGates');
        if (savedGates) {
            try {
                state.gates = JSON.parse(savedGates);
            } catch (e) {
                state.gates = [];
            }
        }
        state.gatesSolved = parseInt(localStorage.getItem('mazeGatesSolved')) || 0;
    }

    function saveState() {
        // Save state to localStorage (persists across theme changes)
        localStorage.setItem('mazeLevel', state.level);
        localStorage.setItem('mazeScore', state.score);
        localStorage.setItem('mazeLives', state.lives);
        localStorage.setItem('mazeGates', JSON.stringify(state.gates));
        localStorage.setItem('mazeGatesSolved', state.gatesSolved);
    }

    // ==================== MAZE SETUP ====================
    
    function setupMaze() {
        const templateIndex = (state.level - 1) % MAZE_TEMPLATES.length;
        state.maze = MAZE_TEMPLATES[templateIndex].map(row => [...row]);
        
        // Find all gates and initialize their state
        state.gates = [];
        state.totalGates = 0;
        
        for (let y = 0; y < state.maze.length; y++) {
            for (let x = 0; x < state.maze[y].length; x++) {
                if (state.maze[y][x] === 2) {
                    // Check if this gate was already solved (from localStorage)
                    const savedGate = state.gates.find(g => g.x === x && g.y === y);
                    const isUnlocked = savedGate ? savedGate.unlocked : false;
                    
                    if (!savedGate) {
                        state.gates.push({
                            x, y,
                            unlocked: false,
                            sequenceLength: 3 + Math.floor(state.level / 2) // Longer sequences at higher levels
                        });
                    }
                    state.totalGates++;
                }
            }
        }
        
        // Count already solved gates
        state.gatesSolved = state.gates.filter(g => g.unlocked).length;
        
        renderMaze();
    }

    function renderMaze() {
        const grid = document.getElementById('mazeGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        for (let y = 0; y < state.maze.length; y++) {
            for (let x = 0; x < state.maze[y].length; x++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                const cellType = state.maze[y][x];
                switch (cellType) {
                    case 0: cell.classList.add('path'); break;
                    case 1: cell.classList.add('wall'); break;
                    case 2: 
                        cell.classList.add('gate');
                        // Check if this gate is unlocked
                        const gate = state.gates.find(g => g.x === x && g.y === y);
                        if (gate && gate.unlocked) {
                            cell.classList.add('unlocked');
                        }
                        break;
                    case 3: cell.classList.add('path', 'start'); break;
                    case 4: cell.classList.add('path', 'end'); break;
                }
                
                grid.appendChild(cell);
            }
        }
    }

    function findStartPosition() {
        for (let y = 0; y < state.maze.length; y++) {
            for (let x = 0; x < state.maze[y].length; x++) {
                if (state.maze[y][x] === 3) {
                    state.playerPos = { x, y };
                    return;
                }
            }
        }
    }

    // ==================== CONTROLS ====================
    
    function setupControls() {
        // Keyboard controls
        const keyHandler = (e) => {
            if (state.isPlayingSequence) return;
            
            const key = e.key.toLowerCase();
            let dx = 0, dy = 0;
            
            switch (key) {
                case 'arrowup': case 'w': dy = -1; e.preventDefault(); break;
                case 'arrowdown': case 's': dy = 1; e.preventDefault(); break;
                case 'arrowleft': case 'a': dx = -1; e.preventDefault(); break;
                case 'arrowright': case 'd': dx = 1; e.preventDefault(); break;
                default: return;
            }
            
            movePlayer(dx, dy);
        };
        
        document.addEventListener('keydown', keyHandler);
        state.eventListeners.push({ element: document, event: 'keydown', handler: keyHandler });
        
        // Mobile controls
        const mobileControls = document.getElementById('mazeMobileControls');
        if (mobileControls) {
            const mobileBtns = mobileControls.querySelectorAll('.maze-mobile-btn');
            mobileBtns.forEach(btn => {
                const handler = (e) => {
                    e.preventDefault();
                    if (state.isPlayingSequence) return;
                    
                    const dir = btn.dataset.direction;
                    switch (dir) {
                        case 'up': movePlayer(0, -1); break;
                        case 'down': movePlayer(0, 1); break;
                        case 'left': movePlayer(-1, 0); break;
                        case 'right': movePlayer(1, 0); break;
                    }
                };
                btn.addEventListener('click', handler);
                state.eventListeners.push({ element: btn, event: 'click', handler });
            });
        }
        
        // Color buttons
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            const handler = () => {
                if (!state.isInputEnabled) return;
                const color = btn.dataset.color;
                handleColorInput(color, btn);
            };
            btn.addEventListener('click', handler);
            state.eventListeners.push({ element: btn, event: 'click', handler });
        });
        
        // Start sequence button
        const startBtn = document.getElementById('startSequenceBtn');
        if (startBtn) {
            const handler = () => startSequence();
            startBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: startBtn, event: 'click', handler });
        }
        
        // Reset button
        const resetBtn = document.getElementById('mazeResetBtn');
        if (resetBtn) {
            const handler = () => {
                showConfirmModal({
                    icon: '🔄',
                    title: 'Reset Game?',
                    message: 'This will reset all progress. Continue?',
                    onConfirm: () => resetGame()
                });
            };
            resetBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: resetBtn, event: 'click', handler });
        }
        
        // New maze button
        const newMazeBtn = document.getElementById('mazeNewMazeBtn');
        if (newMazeBtn) {
            const handler = () => {
                showConfirmModal({
                    icon: '🗺️',
                    title: 'New Maze?',
                    message: 'Generate a new maze layout?',
                    onConfirm: () => generateNewMaze()
                });
            };
            newMazeBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: newMazeBtn, event: 'click', handler });
        }
        
        // Sound toggle - syncs with global sound system
        const soundToggle = document.getElementById('mazeSoundToggle');
        if (soundToggle) {
            soundToggle.checked = typeof GameSounds !== 'undefined' ? GameSounds.isEnabled() : true;
            const handler = () => {
                if (typeof GameSounds !== 'undefined') {
                    GameSounds.setEnabled(soundToggle.checked);
                }
            };
            soundToggle.addEventListener('change', handler);
            state.eventListeners.push({ element: soundToggle, event: 'change', handler });
        }
    }

    // ==================== PLAYER MOVEMENT ====================
    
    function movePlayer(dx, dy) {
        if (!state.gameActive) return;
        if (state.currentGate) return; // Can't move during challenge
        
        const newX = state.playerPos.x + dx;
        const newY = state.playerPos.y + dy;
        
        // Check bounds
        if (newY < 0 || newY >= state.maze.length || newX < 0 || newX >= state.maze[0].length) {
            return;
        }
        
        const targetCell = state.maze[newY][newX];
        
        // Can't walk through walls
        if (targetCell === 1) {
            playSound('wrong');
            return;
        }
        
        // Check for locked gate
        if (targetCell === 2) {
            const gate = state.gates.find(g => g.x === newX && g.y === newY);
            if (gate && !gate.unlocked) {
                // Start gate challenge
                startGateChallenge(gate);
                return;
            }
        }
        
        // Move player
        state.playerPos = { x: newX, y: newY };
        updatePlayerPosition();
        playSound('move');
        
        // Check for end
        if (targetCell === 4) {
            checkLevelComplete();
        }
    }

    function updatePlayerPosition() {
        const player = document.getElementById('mazePlayer');
        const gridWrapper = document.querySelector('.maze-grid-wrapper');
        if (!player || !gridWrapper) return;
        
        // Get cell size from CSS
        const mazeGrid = document.getElementById('mazeGrid');
        if (!mazeGrid) return;
        
        const cell = mazeGrid.querySelector('.maze-cell');
        if (!cell) return;
        
        const cellSize = cell.offsetWidth;
        const gap = 2; // CSS gap value
        const padding = 12; // Grid wrapper padding
        
        player.style.left = `${padding + state.playerPos.x * (cellSize + gap)}px`;
        player.style.top = `${padding + state.playerPos.y * (cellSize + gap)}px`;
    }

    // ==================== GATE CHALLENGE (COLOR MEMORY) ====================
    
    function startGateChallenge(gate) {
        state.currentGate = gate;
        state.sequence = [];
        state.playerSequence = [];
        
        // Generate sequence based on level and gate
        const seqLength = gate.sequenceLength;
        for (let i = 0; i < seqLength; i++) {
            state.sequence.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
        }
        
        // Show panel and update UI
        showColorPanel(true);
        updateStatus('Watch the sequence carefully!');
        updateProgressDots();
        
        // Highlight the gate
        const gateCell = document.querySelector(`.maze-cell.gate[data-x="${gate.x}"][data-y="${gate.y}"]`);
        if (gateCell) gateCell.classList.add('active');
        
        showToast({
            type: 'info',
            icon: '🔐',
            title: 'Gate Challenge!',
            message: `Memorize ${seqLength} colors`,
            duration: 2000
        });
    }

    function showColorPanel(show) {
        const panel = document.getElementById('colorMemoryPanel');
        if (panel) {
            panel.classList.toggle('hidden', !show);
        }
        
        const startBtn = document.getElementById('startSequenceBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'Start Sequence';
        }
        
        setColorButtonsEnabled(false);
    }

    function startSequence() {
        const startBtn = document.getElementById('startSequenceBtn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = 'Watch...';
        }
        
        state.isPlayingSequence = true;
        state.sequenceIndex = 0;
        updateStatus('Watch carefully...');
        
        playSequence();
    }

    async function playSequence() {
        const speed = Math.max(400 - (state.level * 30), 200); // Faster at higher levels
        
        for (let i = 0; i < state.sequence.length; i++) {
            if (!state.currentGate) return; // Challenge was cancelled
            
            await delay(speed);
            
            const color = state.sequence[i];
            const btn = document.querySelector(`.color-btn[data-color="${color}"]`);
            
            if (btn) {
                btn.classList.add('lit');
                playColorSound(color);
                await delay(speed);
                btn.classList.remove('lit');
            }
        }
        
        // Sequence complete - enable input
        await delay(300);
        state.isPlayingSequence = false;
        state.isInputEnabled = true;
        state.playerSequence = [];
        
        setColorButtonsEnabled(true);
        updateStatus('Your turn! Repeat the sequence');
        
        const startBtn = document.getElementById('startSequenceBtn');
        if (startBtn) {
            startBtn.textContent = 'Replay';
            startBtn.disabled = false;
        }
    }

    function handleColorInput(color, btnElement) {
        if (!state.isInputEnabled || !state.currentGate) return;
        
        // Light up the button briefly
        btnElement.classList.add('lit');
        playColorSound(color);
        
        setTimeout(() => btnElement.classList.remove('lit'), 200);
        
        state.playerSequence.push(color);
        const index = state.playerSequence.length - 1;
        
        // Check if this input is correct
        if (state.sequence[index] === color) {
            // Correct!
            btnElement.classList.add('correct');
            setTimeout(() => btnElement.classList.remove('correct'), 300);
            
            updateProgressDot(index, 'completed');
            
            // Check if sequence complete
            if (state.playerSequence.length === state.sequence.length) {
                // Gate unlocked!
                gateUnlocked();
            }
        } else {
            // Wrong!
            btnElement.classList.add('wrong');
            setTimeout(() => btnElement.classList.remove('wrong'), 400);
            
            updateProgressDot(index, 'wrong');
            sequenceFailed();
        }
    }

    function gateUnlocked() {
        state.isInputEnabled = false;
        setColorButtonsEnabled(false);
        
        // Mark gate as unlocked
        state.currentGate.unlocked = true;
        state.gatesSolved++;
        state.score += state.sequence.length * 10;
        
        // Update maze cell
        const gateCell = document.querySelector(`.maze-cell.gate[data-x="${state.currentGate.x}"][data-y="${state.currentGate.y}"]`);
        if (gateCell) {
            gateCell.classList.remove('active');
            gateCell.classList.add('unlocked');
        }
        
        saveState();
        updateDisplay();
        
        playSound('win');
        showToast({
            type: 'success',
            icon: '🔓',
            title: 'Gate Unlocked!',
            message: `+${state.sequence.length * 10} points`,
            duration: 2500
        });
        
        updateStatus('Gate unlocked! Continue exploring.');
        
        setTimeout(() => {
            state.currentGate = null;
            showColorPanel(false);
        }, 1500);
    }

    function sequenceFailed() {
        state.isInputEnabled = false;
        setColorButtonsEnabled(false);
        state.lives--;
        
        saveState();
        updateDisplay();
        
        playSound('wrong');
        
        if (state.lives <= 0) {
            // Game over
            gameOver();
        } else {
            showToast({
                type: 'error',
                icon: '❌',
                title: 'Wrong Sequence!',
                message: `${state.lives} lives remaining`,
                duration: 2500
            });
            
            updateStatus(`Wrong! ${state.lives} lives left. Try again.`);
            
            // Reset for retry
            setTimeout(() => {
                state.playerSequence = [];
                updateProgressDots();
                
                const startBtn = document.getElementById('startSequenceBtn');
                if (startBtn) {
                    startBtn.disabled = false;
                    startBtn.textContent = 'Try Again';
                }
            }, 1500);
        }
    }

    // ==================== GAME STATE ====================
    
    function checkLevelComplete() {
        // Check if all gates are unlocked
        const allUnlocked = state.gates.every(g => g.unlocked);
        
        if (allUnlocked) {
            levelComplete();
        } else {
            showToast({
                type: 'warning',
                icon: '🔒',
                title: 'Gates Locked!',
                message: 'Unlock all gates to complete the level',
                duration: 2500
            });
        }
    }

    function levelComplete() {
        state.gameActive = false;
        state.level++;
        state.score += 100; // Level completion bonus
        
        playSound('win');
        
        showGameModal({
            type: 'win',
            icon: '🏆',
            title: 'Level Complete!',
            message: `You've escaped the maze!\nScore: ${state.score} | Next: Level ${state.level}`,
            onPlayAgain: () => {
                state.gameActive = true;
                state.gates = [];
                state.gatesSolved = 0;
                saveState();
                setupMaze();
                findStartPosition();
                updatePlayerPosition();
                updateDisplay();
            }
        });
        
        saveState();
    }

    function gameOver() {
        state.gameActive = false;
        playSound('lose');
        
        showGameModal({
            type: 'lose',
            icon: '💀',
            title: 'Game Over!',
            message: `You ran out of lives!\nFinal Score: ${state.score}`,
            onPlayAgain: () => resetGame()
        });
    }

    function resetGame() {
        state.level = 1;
        state.score = 0;
        state.lives = 3;
        state.gates = [];
        state.gatesSolved = 0;
        state.currentGate = null;
        state.gameActive = true;
        
        // Clear localStorage
        localStorage.removeItem('mazeLevel');
        localStorage.removeItem('mazeScore');
        localStorage.removeItem('mazeLives');
        localStorage.removeItem('mazeGates');
        localStorage.removeItem('mazeGatesSolved');
        
        setupMaze();
        findStartPosition();
        updatePlayerPosition();
        updateDisplay();
        showColorPanel(false);
        
        showToast({
            type: 'info',
            icon: '🔄',
            title: 'Game Reset',
            message: 'Ready to explore!',
            duration: 2000
        });
    }

    function generateNewMaze() {
        // Keep stats but generate new maze
        state.gates = [];
        state.gatesSolved = 0;
        state.currentGate = null;
        
        localStorage.removeItem('mazeGates');
        localStorage.removeItem('mazeGatesSolved');
        
        setupMaze();
        findStartPosition();
        updatePlayerPosition();
        updateDisplay();
        showColorPanel(false);
        
        showToast({
            type: 'info',
            icon: '🗺️',
            title: 'New Maze',
            message: 'Explore the new layout!',
            duration: 2000
        });
    }

    // ==================== UI HELPERS ====================
    
    function updateDisplay() {
        const levelEl = document.getElementById('mazeLevel');
        const scoreEl = document.getElementById('mazeScore');
        const livesEl = document.getElementById('mazeLives');
        const gatesEl = document.getElementById('mazeGatesSolved');
        
        if (levelEl) levelEl.textContent = state.level;
        if (scoreEl) scoreEl.textContent = state.score;
        if (livesEl) livesEl.textContent = '❤️'.repeat(state.lives) || '💔';
        if (gatesEl) gatesEl.textContent = `${state.gatesSolved}/${state.totalGates}`;
    }

    function updateStatus(text) {
        const statusEl = document.getElementById('colorMemoryStatus');
        if (statusEl) statusEl.textContent = text;
    }

    function updateProgressDots() {
        const container = document.getElementById('progressDots');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 0; i < state.sequence.length; i++) {
            const dot = document.createElement('span');
            dot.className = 'progress-dot';
            dot.dataset.index = i;
            container.appendChild(dot);
        }
    }

    function updateProgressDot(index, status) {
        const dot = document.querySelector(`.progress-dot[data-index="${index}"]`);
        if (dot) {
            dot.classList.remove('completed', 'current', 'wrong');
            dot.classList.add(status);
        }
    }

    function setColorButtonsEnabled(enabled) {
        const buttons = document.querySelectorAll('.color-btn');
        buttons.forEach(btn => {
            btn.disabled = !enabled;
        });
    }

    // ==================== AUDIO ====================
    
    // playSound and playColorSound are provided globally by sounds.js
    // The game-specific soundEnabled toggle is connected to the global setting
    
    function syncSoundToggle() {
        const toggle = document.getElementById('mazeSoundToggle');
        if (toggle) {
            toggle.checked = GameSounds.isEnabled();
            toggle.addEventListener('change', () => {
                GameSounds.setEnabled(toggle.checked);
            });
        }
    }

    // ==================== UTILITIES ====================
    
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ==================== LIFECYCLE ====================
    
    function cleanup() {
        state.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        state.eventListeners = [];
    }

    function pause() {
        // Nothing special needed for pause
    }

    function activate() {
        // Redraw when tab becomes active (for theme changes)
        updatePlayerPosition();
        renderMaze();
        updateDisplay();
    }
    
    // Called when theme changes - just redraws, doesn't reset
    function redraw() {
        renderMaze();
        updatePlayerPosition();
    }

    return {
        init,
        cleanup,
        pause,
        activate,
        redraw
    };
}
