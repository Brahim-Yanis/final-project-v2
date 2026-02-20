// ============================================
// MEMORY GAME - STANDALONE JAVASCRIPT
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
    gameState.gameInstance = MemoryGame();
    gameState.gameInstance.init();
    showGameActiveNotification('Memory');
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
// MEMORY CARD GAME - Factory Pattern
// ============================================
function MemoryGame() {
    const symbols = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍓', '🍒', '🍑', '🥝', '🍐', '🍍', '🥭'];

    const difficultyConfig = {
        easy: { cardCount: 12, columns: 4, rows: 3, symbols: 6, name: 'Easy', timeLimit: 90 },
        medium: { cardCount: 16, columns: 4, rows: 4, symbols: 8, name: 'Medium', timeLimit: 120 },
        hard: { cardCount: 24, columns: 6, rows: 4, symbols: 12, name: 'Hard', timeLimit: 150 }
    };

    const state = {
        cards: [],
        flipped: [],
        matched: [],
        moves: 0,
        score: 0,
        gameActive: true,
        isProcessing: false,
        difficulty: null,
        timeRemaining: 0,
        totalTime: 0,
        timerInterval: null,
        eventListeners: [],
        cardClickHandlers: {},
        difficultyButtonHandlers: {},
        gridListenerAttached: false,
        difficultyButtonsBound: false,
        controlsBound: false
    };

    function showDifficultySelection() {
        const difficultyScreen = document.getElementById('difficultySelection');
        const gameScreen = document.getElementById('memoryGameScreen');

        if (difficultyScreen) difficultyScreen.classList.remove('hidden');
        if (gameScreen) gameScreen.classList.add('hidden');
    }

    function startGameWithDifficulty(difficulty) {
        if (!difficultyConfig[difficulty]) return;

        state.cardClickHandlers = {};
        state.isProcessing = false;

        state.difficulty = difficulty;
        state.cards = [];
        state.flipped = [];
        state.matched = [];
        state.moves = 0;
        state.score = 0;
        state.gameActive = true;
        state.isProcessing = false;

        playSound('gameStart');

        const config = difficultyConfig[difficulty];
        state.totalTime = config.timeLimit;
        state.timeRemaining = config.timeLimit;
        
        const pairsNeeded = config.cardCount / 2;
        const usedSymbols = symbols.slice(0, pairsNeeded);
        state.cards = [...usedSymbols, ...usedSymbols];

        shuffleCards();

        const grid = document.getElementById('memoryGrid');
        if (grid) {
            grid.style.gridTemplateColumns = `repeat(${config.columns}, 1fr)`;
        }

        const difficultyScreen = document.getElementById('difficultySelection');
        const gameScreen = document.getElementById('memoryGameScreen');

        if (difficultyScreen) difficultyScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');

        renderCards();
        setGridLocked(false);
        updateCounters();
        startTimer();

        const difficultyNames = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
        const difficultyIcons = { easy: '🌱', medium: '🌳', hard: '🌲' };
        showToast({
            type: 'info',
            icon: difficultyIcons[difficulty] || '🎮',
            title: `${difficultyNames[difficulty]} Mode`,
            message: `${config.cardCount} cards, ${config.timeLimit}s to match them all!`,
            duration: 2500
        });
    }

    function startTimer() {
        stopTimer();
        state.timeRemaining = state.totalTime;
        updateTimerDisplay();
        
        state.timerInterval = setInterval(() => {
            state.timeRemaining--;
            updateTimerDisplay();

            if (state.timeRemaining <= 0) {
                stopTimer();
                gameOver('timeup');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerCounter = document.getElementById('timerCounter');
        const timerStat = document.querySelector('.timer-stat');

        if (timerCounter) {
            timerCounter.textContent = state.timeRemaining;
        }

        if (timerStat) {
            timerStat.classList.remove('warning', 'danger');
            if (state.timeRemaining <= 10) {
                timerStat.classList.add('danger');
            } else if (state.timeRemaining <= 30) {
                timerStat.classList.add('warning');
            }
        }
    }

    function stopTimer() {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    }

    function gameOver(reason) {
        state.gameActive = false;
        stopTimer();
        const message = document.getElementById('memoryMessage');
        
        if (reason === 'timeup') {
            const pairsMatched = state.matched.length / 2;
            const totalPairs = state.cards.length / 2;
            if (message) {
                message.textContent = `⏰ Time's Up! You matched ${pairsMatched} pairs with ${state.score} points. Try again!`;
            }
            playSound('lose');
            
            showGameModal({
                type: 'lose',
                icon: '⏰',
                title: "Time's Up!",
                message: `You matched ${pairsMatched}/${totalPairs} pairs with ${state.score} points. Try again!`,
                onPlayAgain: () => resetGame()
            });
        }
    }

    function shuffleCards() {
        for (let i = state.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [state.cards[i], state.cards[j]] = [state.cards[j], state.cards[i]];
        }
    }

    function renderCards() {
        const grid = document.getElementById('memoryGrid');
        if (!grid) return;

        grid.innerHTML = '';
        grid.classList.remove('locked');

        state.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            card.textContent = '?';
            
            card.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                flipCard(index);
            };

            if (state.matched.includes(index)) {
                card.classList.add('matched');
                card.classList.add('flipped');
                card.textContent = symbol;
            }

            grid.appendChild(card);
        });
    }

    function flipCard(index) {
        if (!state.gameActive) return;
        if (state.isProcessing) return;
        if (state.flipped.includes(index)) return;
        if (state.matched.includes(index)) return;
        if (state.flipped.length >= 2) return;

        const card = document.querySelector(`#memoryGrid [data-index="${index}"]`);
        if (!card) return;

        card.classList.add('flipped');
        const emoji = state.cards[index];
        card.textContent = emoji;
        state.flipped.push(index);
        playSound('flip');

        if (state.flipped.length === 2) {
            checkMatch();
        }
    }

    function setGridLocked(locked) {
        const grid = document.getElementById('memoryGrid');
        if (!grid) return;
        grid.classList.toggle('locked', locked);
    }

    function checkMatch() {
        state.isProcessing = true;
        setGridLocked(true);
        const [first, second] = state.flipped;
        const match = state.cards[first] === state.cards[second];

        state.moves++;
        state.score += match ? 10 : 0;
        updateCounters();

        if (match) {
            setTimeout(() => {
                state.matched.push(first, second);
                const firstCard = document.querySelector(`#memoryGrid [data-index="${first}"]`);
                const secondCard = document.querySelector(`#memoryGrid [data-index="${second}"]`);
                if (firstCard) {
                    firstCard.classList.add('matched');
                    firstCard.style.pointerEvents = 'none';
                }
                if (secondCard) {
                    secondCard.classList.add('matched');
                    secondCard.style.pointerEvents = 'none';
                }
                state.flipped = [];
                state.isProcessing = false;
                setGridLocked(false);
                playSound('match');

                if (state.matched.length === state.cards.length) {
                    gameWon();
                }
            }, 300);
        } else {
            setTimeout(() => {
                unflipCards();
                state.flipped = [];
                state.isProcessing = false;
                setGridLocked(false);
                playSound('wrong');
            }, 1000);
        }
    }

    function unflipCards() {
        state.flipped.forEach(index => {
            const card = document.querySelector(`#memoryGrid [data-index="${index}"]`);
            if (card) {
                card.classList.remove('flipped');
                card.textContent = '?';
            }
        });
    }

    function updateCounters() {
        const moveCounter = document.getElementById('moveCounter');
        const scoreCounter = document.getElementById('memoryScore');

        if (moveCounter) moveCounter.textContent = state.moves;
        if (scoreCounter) scoreCounter.textContent = state.score;
    }

    function gameWon() {
        state.gameActive = false;
        stopTimer();
        const timeBonus = state.timeRemaining > 0 ? Math.floor(state.timeRemaining / 10) : 0;
        const totalScore = state.score + timeBonus;
        const message = document.getElementById('memoryMessage');
        if (message) {
            message.textContent = `🎉 You won in ${state.moves} moves with ${state.score} points${timeBonus > 0 ? ` (+${timeBonus} time bonus)` : ''}! Total: ${totalScore}`;
        }
        playSound('win');
        
        showGameModal({
            type: 'win',
            icon: '🎉',
            title: 'You Win!',
            message: `Completed in ${state.moves} moves! Score: ${state.score}${timeBonus > 0 ? ` (+${timeBonus} time bonus)` : ''} = ${totalScore} total!`,
            onPlayAgain: () => resetGame()
        });
    }

    function resetGame() {
        stopTimer();
        state.isProcessing = false;
        setGridLocked(false);
        state.flipped = [];
        state.matched = [];
        state.gameActive = false;
        state.cards = [];
        state.moves = 0;
        state.score = 0;
        showDifficultySelection();
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

    function setupDifficultyButtons() {
        const difficultyScreen = document.getElementById('difficultySelection');
        if (!difficultyScreen) return;
        if (state.difficultyButtonsBound) return;

        const difficultyBtns = difficultyScreen.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            delete btn.dataset.listenerAttached;

            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const difficulty = btn.dataset.difficulty;
                startGameWithDifficulty(difficulty);
            };

            btn.addEventListener('click', handler);
            state.difficultyButtonHandlers[btn.dataset.difficulty] = { element: btn, handler: handler };
        });

        state.difficultyButtonsBound = true;
    }

    function setupResetButton() {
        const resetBtn = document.getElementById('resetMemory');
        if (state.controlsBound) return;

        if (resetBtn) {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (state.gameActive && state.matched.length > 0) {
                    showConfirmModal({
                        icon: '🔄',
                        title: 'Change Difficulty?',
                        message: 'Your current progress will be lost. Continue?',
                        onConfirm: () => resetGame()
                    });
                } else {
                    resetGame();
                }
            };
            resetBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: resetBtn, event: 'click', handler });
        }

        state.controlsBound = true;
    }

    return {
        init() {
            stopTimer();
            
            state.gameActive = false;
            state.isProcessing = false;
            state.flipped = [];
            state.matched = [];
            state.cards = [];
            state.moves = 0;
            state.score = 0;
            state.difficulty = null;
            state.timeRemaining = 0;
            state.totalTime = 0;
            state.cardClickHandlers = {};
            
            setupDifficultyButtons();
            setupResetButton();
            showDifficultySelection();
        },
        activate() {
            stopTimer();
            state.gameActive = false;
            state.isProcessing = false;
            setGridLocked(false);
            state.flipped = [];
            state.matched = [];
            state.cards = [];
            state.moves = 0;
            state.score = 0;
            state.difficulty = null;
            state.timeRemaining = 0;
            state.totalTime = 0;
            
            showDifficultySelection();
        },
        pause() {
            state.gameActive = false;
            stopTimer();
        },
        cleanup() {
            stopTimer();
            state.gameActive = false;
            state.isProcessing = false;
            state.flipped = [];
            state.matched = [];
            state.cards = [];
            state.moves = 0;
            state.score = 0;
            state.difficulty = null;
        }
    };
}
