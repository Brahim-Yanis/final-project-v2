// ============================================
// TIC-TAC-TOE - STANDALONE JAVASCRIPT
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
    gameState.gameInstance = TicTacToeGame();
    gameState.gameInstance.init();
    showGameActiveNotification('Tic Tac Toe');
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
    
    // Set content
    modalIcon.textContent = icon || '🎮';
    modalTitle.textContent = title || 'Game Over';
    modalMessage.textContent = message || '';
    
    // Set title color class
    modalTitle.className = 'modal-title';
    if (type === 'win') modalTitle.classList.add('win');
    else if (type === 'lose') modalTitle.classList.add('lose');
    else if (type === 'draw') modalTitle.classList.add('draw');
    
    // Remove old listeners and add new ones
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
    
    // Show modal
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
    
    // Remove after duration
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
    
    // Set content
    if (confirmIcon) confirmIcon.textContent = icon || '⚠️';
    if (confirmTitle) confirmTitle.textContent = title || 'Confirm';
    if (confirmMessage) confirmMessage.textContent = message || 'Are you sure?';
    
    // Replace buttons to remove old listeners
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
// TIC-TAC-TOE GAME - Factory Pattern
// ============================================
function TicTacToeGame() {
    const state = {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        gameActive: true,
        gameMode: 'pvp',
        boardListenerAttached: false,
        modeListenerAttached: false,
        resetListenerAttached: false,
        scores: {
            X: 0,
            O: 0,
            draw: 0
        },
        eventListeners: [],
        autoResetTimeout: null
    };

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function loadScores() {
        const saved = localStorage.getItem('ticTacToeScores');
        if (saved) {
            state.scores = JSON.parse(saved);
        }
    }

    function saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(state.scores));
    }

    function updateScoreDisplay() {
        const xScore = document.getElementById('playerXScore');
        const oScore = document.getElementById('playerOScore');
        const drawScore = document.getElementById('drawScore');

        if (xScore) xScore.textContent = state.scores.X;
        if (oScore) oScore.textContent = state.scores.O;
        if (drawScore) drawScore.textContent = state.scores.draw;
    }

    function updateStatusDisplay() {
        const status = document.getElementById('gameStatus');
        if (!status) return;

        if (!state.gameActive) return;
        status.textContent = `Player ${state.currentPlayer}'s Turn`;
    }

    function updateBoardDisplay() {
        const cells = document.querySelectorAll('#board .cell');
        cells.forEach((cell, idx) => {
            const value = state.board[idx];
            cell.textContent = value;
            if (value) {
                cell.classList.add('taken');
            } else {
                cell.classList.remove('taken');
            }
        });
    }

    function checkGameState() {
        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            const value = state.board[a];
            if (value && value === state.board[b] && value === state.board[c]) {
                const winner = value;
                state.scores[winner] += 1;
                saveScores();
                updateScoreDisplay();

                const status = document.getElementById('gameStatus');
                if (status) status.textContent = `Player ${winner} Wins!`;

                const cells = document.querySelectorAll('#board .cell');
                [a, b, c].forEach(idx => cells[idx]?.classList.add('winner'));

                // Show win modal
                const isComputer = state.gameMode === 'pvc' && winner === 'O';
                playSound(isComputer ? 'lose' : 'win');
                showGameModal({
                    type: isComputer ? 'lose' : 'win',
                    icon: isComputer ? '😔' : '🎉',
                    title: isComputer ? 'You Lose!' : `Player ${winner} Wins!`,
                    message: isComputer ? 'The computer won this round. Try again!' : `Congratulations! Player ${winner} has won the game!`,
                    onPlayAgain: () => resetGame()
                });

                return { winner };
            }
        }

        if (!state.board.includes('')) {
            state.scores.draw += 1;
            saveScores();
            updateScoreDisplay();

            const status = document.getElementById('gameStatus');
            if (status) status.textContent = "It's a Draw!";

            // Show draw modal
            playSound('correct');
            showGameModal({
                type: 'draw',
                icon: '🤝',
                title: "It's a Draw!",
                message: 'No winner this time. Play again?',
                onPlayAgain: () => resetGame()
            });

            return { winner: 'draw' };
        }

        return null;
    }

    function setupBoard() {
        const board = document.getElementById('board');
        if (!board) return;
        if (state.boardListenerAttached) return;

        // Use event delegation on the board container - ONE listener to capture all cell clicks
        const handler = (e) => {
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const index = parseInt(cell.dataset.index);
            if (!isNaN(index)) {
                handleCellClick(index);
            }
        };

        board.addEventListener('click', handler);
        state.eventListeners.push({ element: board, event: 'click', handler });
        state.boardListenerAttached = true;
    }

    function setupModeSelector() {
        const modeSelect = document.getElementById('gameMode');
        if (!modeSelect) return;
        if (state.modeListenerAttached) return;

        const handler = (e) => {
            state.gameMode = e.target.value;
            resetGame();
        };
        modeSelect.removeEventListener('change', handler);
        modeSelect.addEventListener('change', handler);
        state.eventListeners.push({ element: modeSelect, event: 'change', handler });
        state.modeListenerAttached = true;
    }

    function setupResetButton() {
        const resetBtn = document.getElementById('resetTicTacToe');
        const restartZeroBtn = document.getElementById('restartTicTacToeZero');
        
        if (!resetBtn) return;
        if (state.resetListenerAttached) return;

        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            playSound('click');
            resetGame();
        };
        resetBtn.removeEventListener('click', handler);
        resetBtn.addEventListener('click', handler);
        state.eventListeners.push({ element: resetBtn, event: 'click', handler });
        
        if (restartZeroBtn) {
            const restartHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                showConfirmModal({
                    icon: '🔄',
                    title: 'Reset All Scores?',
                    message: 'This will reset all player scores to zero. Are you sure?',
                    onConfirm: () => {
                        restartFromZero();
                        showToast({
                            type: 'info',
                            icon: '🔄',
                            title: 'Scores Reset',
                            message: 'All scores have been reset to zero.',
                            duration: 2000
                        });
                    }
                });
            };
            restartZeroBtn.removeEventListener('click', restartHandler);
            restartZeroBtn.addEventListener('click', restartHandler);
            state.eventListeners.push({ element: restartZeroBtn, event: 'click', handler: restartHandler });
        }

        state.resetListenerAttached = true;
    }

    function scheduleAutoReset() {
        if (state.autoResetTimeout) {
            clearTimeout(state.autoResetTimeout);
        }
        state.autoResetTimeout = setTimeout(() => {
            resetGame();
        }, 1500);
    }

    function resetGame() {
        if (state.autoResetTimeout) {
            clearTimeout(state.autoResetTimeout);
        }
        
        state.board = ['', '', '', '', '', '', '', '', ''];
        state.currentPlayer = 'X';
        state.gameActive = true;

        // Clear board UI
        const cells = document.querySelectorAll('#board .cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'winner');
            cell.style.color = '';
        });

        updateStatusDisplay();
    }

    function restartFromZero() {
        if (state.autoResetTimeout) {
            clearTimeout(state.autoResetTimeout);
        }
        
        // Reset scores
        state.scores = { X: 0, O: 0, draw: 0 };
        state.board = ['', '', '', '', '', '', '', '', ''];
        state.currentPlayer = 'X';
        state.gameActive = true;

        // Clear board UI
        const cells = document.querySelectorAll('#board .cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'winner');
            cell.style.color = '';
        });

        saveScores();
        updateScoreDisplay();
        updateStatusDisplay();
    }

    function handleCellClick(index) {
        if (state.board[index] !== '' || !state.gameActive) {
            return;
        }

        state.board[index] = state.currentPlayer;
        updateBoardDisplay();
        playSound('click');

        const result = checkGameState();
        if (result) {
            state.gameActive = false;
            return;
        }

        state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
        updateStatusDisplay();

        if (state.gameMode === 'pvc' && state.currentPlayer === 'O' && state.gameActive) {
            setTimeout(() => makeAIMove(), 500);
        }
    }

    function makeAIMove() {
        const emptyIndices = state.board
            .map((val, idx) => val === '' ? idx : null)
            .filter(val => val !== null);

        if (emptyIndices.length === 0) return;

        let moveIndex = findWinningMove('O') ||
            findWinningMove('X') ||
            emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

        handleCellClick(moveIndex);
    }

    function findWinningMove(player) {
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            const values = [state.board[a], state.board[b], state.board[c]];
            const playerCount = values.filter(v => v === player).length;
            const emptyCount = values.filter(v => v === '').length;

            if (playerCount === 2 && emptyCount === 1) {
                return combo.find(idx => state.board[idx] === '');
            }
        }
        return null;
    }

    // playSound is provided globally by sounds.js

    function removeEventListeners() {
        state.eventListeners.forEach(({ element, event, handler }) => {
            if (element) {
                element.removeEventListener(event, handler);
            }
        });
        state.eventListeners = [];
    }

    return {
        init() {
            if (state.autoResetTimeout) {
                clearTimeout(state.autoResetTimeout);
            }
            
            loadScores();
            updateScoreDisplay();
            setupBoard();
            setupModeSelector();
            setupResetButton();
            resetGame();
        },
        activate() {
            state.gameActive = true;
            resetGame();
            updateStatusDisplay();
            updateScoreDisplay();
        },
        pause() {
            state.gameActive = false;
            if (state.autoResetTimeout) {
                clearTimeout(state.autoResetTimeout);
            }
        },
        cleanup() {
            if (state.autoResetTimeout) {
                clearTimeout(state.autoResetTimeout);
                state.autoResetTimeout = null;
            }
        }
    };
}
