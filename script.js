// ============================================
// Game Hub - Advanced JavaScript
// Robust, Bug-Free Implementation
// ============================================

// Global State Management
const gameState = {
    currentGame: 'tictactoe',
    darkMode: localStorage.getItem('darkMode') === 'true',
    gameInstances: {}
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeButton();
    initNavigation();
    initAllGames();
    activateGame('tictactoe');
});

function initAllGames() {
    gameState.gameInstances.tictactoe = TicTacToeGame();
    gameState.gameInstances.quiz = QuizGame();
    gameState.gameInstances.memory = MemoryGame();
    gameState.gameInstances.snake = SnakeGame();
    gameState.gameInstances.maze = MazeGame();
    
    // Create global accessor functions for debugging
    window.initTicTacToe = () => gameState.gameInstances.tictactoe?.init();
    window.initQuiz = () => gameState.gameInstances.quiz?.init();
    window.initMemoryGame = () => gameState.gameInstances.memory?.init();
    window.initSnakeGame = () => gameState.gameInstances.snake?.init();
    window.initMazeGame = () => gameState.gameInstances.maze?.init();
    
    Object.values(gameState.gameInstances).forEach(game => game.init());
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
    
    // Redraw games that need theme-aware rendering (preserves game state)
    if (gameState.gameInstances.snake) {
        gameState.gameInstances.snake.redraw?.();
    }
    if (gameState.gameInstances.maze) {
        gameState.gameInstances.maze.redraw?.();
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
// Navigation & Game Switching
// ============================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const gameId = link.dataset.game;
            switchGame(gameId);
        });
    });
}

function switchGame(gameId) {
    if (gameState.currentGame === gameId) return;


    // Cleanup old game - remove listeners and pause
    if (gameState.gameInstances[gameState.currentGame]) {
        gameState.gameInstances[gameState.currentGame].cleanup?.();
        gameState.gameInstances[gameState.currentGame].pause?.();
    }

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`[data-game="${gameId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Hide all sections and show selected one
    document.querySelectorAll('.game-section').forEach(section => {
        section.classList.remove('active');
    });
    const gameSection = document.getElementById(`${gameId}-game`);
    if (gameSection) {
        gameSection.classList.add('active');
    }

    gameState.currentGame = gameId;

    // Activate and re-initialize new game
    activateGame(gameId);

    // Show toast for game switch
    const gameNames = {
        tictactoe: { name: 'Tic-Tac-Toe', icon: '⭕' },
        quiz: { name: 'Quiz', icon: '❓' },
        memory: { name: 'Memory Game', icon: '🃏' },
        snake: { name: 'Snake Game', icon: '🐍' },
        maze: { name: 'Memory Maze', icon: '🧩' }
    };
    const gameInfo = gameNames[gameId];
    if (gameInfo) {
        showToast({
            type: 'info',
            icon: gameInfo.icon,
            title: gameInfo.name,
            message: 'Game loaded. Have fun!',
            duration: 2000
        });
    }
}

function activateGame(gameId) {
    if (gameState.gameInstances[gameId]) {
        gameState.gameInstances[gameId].activate?.();
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
        playSound('moveSound');

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

    function playSound(soundId) {
        try {
            const audio = document.getElementById(soundId);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        } catch (e) {}
    }

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


// ============================================
// QUIZ GAME - Factory Pattern with Categories
// ============================================
function QuizGame() {
    const quizCategories = {
        webdev: {
            name: '🌐 Web Development',
            questions: [
                {
                    question: 'What does HTML stand for?',
                    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
                    correct: 0
                },
                {
                    question: 'Which property is used to change the background color in CSS?',
                    options: ['color', 'background-color', 'bg-color', 'back-color'],
                    correct: 1
                },
                {
                    question: 'What is the correct way to declare a variable in JavaScript?',
                    options: ['variable x = 5;', 'var x = 5;', 'declare x = 5;', 'new x = 5;'],
                    correct: 1
                },
                {
                    question: 'Which HTML element is used for the largest heading?',
                    options: ['<h6>', '<heading>', '<h1>', '<header>'],
                    correct: 2
                },
                {
                    question: 'What does DOM stand for?',
                    options: ['Data Object Model', 'Document Object Model', 'Display Object Module', 'Defined Object Method'],
                    correct: 1
                }
            ]
        },
        geography: {
            name: '🌍 Countries & Geography',
            questions: [
                {
                    question: 'What is the capital of France?',
                    options: ['London', 'Berlin', 'Paris', 'Madrid'],
                    correct: 2
                },
                {
                    question: 'Which planet is known as the Red Planet?',
                    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                    correct: 1
                },
                {
                    question: 'What is the largest ocean on Earth?',
                    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
                    correct: 3
                },
                {
                    question: 'Which country is home to the Great Wall?',
                    options: ['Japan', 'China', 'India', 'Russia'],
                    correct: 1
                },
                {
                    question: 'What is the capital of Australia?',
                    options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
                    correct: 2
                }
            ]
        },
        math: {
            name: '🔢 Mathematics',
            questions: [
                {
                    question: 'What is the smallest prime number?',
                    options: ['0', '1', '2', '3'],
                    correct: 2
                },
                {
                    question: 'What is the speed of light?',
                    options: ['299,792 km/s', '199,792 km/s', '399,792 km/s', '99,792 km/s'],
                    correct: 0
                },
                {
                    question: 'Which element has atomic number 1?',
                    options: ['Helium', 'Oxygen', 'Hydrogen', 'Nitrogen'],
                    correct: 2
                },
                {
                    question: 'What is 15% of 200?',
                    options: ['15', '30', '45', '50'],
                    correct: 1
                },
                {
                    question: 'What is the square root of 144?',
                    options: ['10', '11', '12', '13'],
                    correct: 2
                }
            ]
        }
    };

    const state = {
        currentCategory: null,
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        answered: false,
        selectedAnswer: null,
        timeRemaining: 30,
        timerInterval: null,
        eventListeners: [],
        categoryStartScore: 0
    };

    function showCategorySelection() {
        const categoryScreen = document.getElementById('quizCategoryScreen');
        const questionScreen = document.getElementById('quizQuestionScreen');
        const resultsScreen = document.getElementById('quizResultsScreen');

        if (categoryScreen) categoryScreen.classList.remove('hidden');
        if (questionScreen) questionScreen.classList.add('hidden');
        if (resultsScreen) resultsScreen.classList.add('hidden');
    }

    function startQuiz(categoryKey) {
        const category = quizCategories[categoryKey];
        if (!category) return;

        state.currentCategory = categoryKey;
        state.questions = JSON.parse(JSON.stringify(category.questions));
        state.currentQuestionIndex = 0;
        state.score = 0;
        state.categoryStartScore = 0;
        state.answered = false;
        state.selectedAnswer = null;

        const categoryScreen = document.getElementById('quizCategoryScreen');
        const questionScreen = document.getElementById('quizQuestionScreen');

        if (categoryScreen) categoryScreen.classList.add('hidden');
        if (questionScreen) questionScreen.classList.remove('hidden');

        // Show toast for starting quiz
        showToast({
            type: 'info',
            icon: category.icon || '📚',
            title: `${category.name} Quiz`,
            message: `${state.questions.length} questions. Good luck!`,
            duration: 2500
        });

        displayQuestion();
    }

    function displayQuestion() {
        if (state.currentQuestionIndex >= state.questions.length) {
            showResults();
            return;
        }

        // Remove old option listeners before displaying new question
        removeQuestionEventListeners();

        const question = state.questions[state.currentQuestionIndex];
        const questionDisplay = document.getElementById('questionDisplay');
        const optionsContainer = document.getElementById('optionsContainer');

        if (questionDisplay) questionDisplay.textContent = question.question;
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            question.options.forEach((option, index) => {
                const optionBtn = document.createElement('div');
                optionBtn.className = 'quiz-option';
                optionBtn.textContent = option;
                optionBtn.dataset.index = index;
                
                // Create a handler that preserves the index properly
                const clickHandler = (e) => {
                    e.stopPropagation();
                    selectAnswer(parseInt(e.target.dataset.index));
                };
                
                optionBtn.addEventListener('click', clickHandler);
                state.eventListeners.push({ element: optionBtn, event: 'click', handler: clickHandler });
                optionsContainer.appendChild(optionBtn);
            });
        }

        updateProgress();
        state.answered = false;
        state.selectedAnswer = null;
        
        // Reset and start timer
        stopTimer();
        state.timeRemaining = 30;
        updateTimerDisplay();
        startTimer();

        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) nextBtn.disabled = true;
    }

    function startTimer() {
        state.timerInterval = setInterval(() => {
            state.timeRemaining--;
            updateTimerDisplay();

            if (state.timeRemaining <= 0) {
                stopTimer();
                if (!state.answered) {
                    // Auto-advance on timeout
                    selectAnswer(-1); // -1 indicates timeout
                    setTimeout(() => nextQuestion(), 1000);
                }
            }
        }, 1000);
    }

    function stopTimer() {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    }

    function updateTimerDisplay() {
        const timerValue = document.getElementById('timerValue');
        const timerDisplay = document.getElementById('timerDisplay');

        if (timerValue) {
            timerValue.textContent = state.timeRemaining;
        }

        // Change color based on time remaining
        if (timerDisplay) {
            timerDisplay.classList.remove('warning', 'danger');
            if (state.timeRemaining <= 5) {
                timerDisplay.classList.add('danger');
            } else if (state.timeRemaining <= 10) {
                timerDisplay.classList.add('warning');
            }
        }
    }

    function updateScoreDisplay() {
        const scoreValue = document.getElementById('currentScoreValue');
        if (scoreValue) {
            scoreValue.textContent = state.score;
        }
    }

    function selectAnswer(index) {
        if (state.answered) return;

        state.selectedAnswer = index;
        state.answered = true;
        stopTimer();

        const options = document.querySelectorAll('.quiz-option');
        const question = state.questions[state.currentQuestionIndex];

        // Handle timeout case (index === -1)
        if (index !== -1) {
            options.forEach((option, idx) => {
                option.classList.add('disabled');
                if (idx === question.correct) {
                    option.classList.add('correct');
                } else if (idx === index) {
                    option.classList.add('incorrect');
                }
            });

            if (index === question.correct) {
                state.score++;
                playSound('winSound');
                showToast({
                    type: 'success',
                    icon: '🎉',
                    title: 'Correct!',
                    message: 'Great job! You got it right!',
                    duration: 2000
                });
            } else {
                playSound('moveSound');
                showToast({
                    type: 'error',
                    icon: '😔',
                    title: 'Wrong Answer',
                    message: `The correct answer was: ${question.options[question.correct]}`,
                    duration: 3000
                });
            }
        } else {
            // Timeout - show correct answer
            options.forEach((option, idx) => {
                option.classList.add('disabled');
                if (idx === question.correct) {
                    option.classList.add('correct');
                }
            });
            playSound('moveSound');
            showToast({
                type: 'warning',
                icon: '⏰',
                title: "Time's Up!",
                message: `The correct answer was: ${question.options[question.correct]}`,
                duration: 3000
            });
        }

        updateScoreDisplay();

        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) nextBtn.disabled = false;
    }

    function nextQuestion() {
        state.currentQuestionIndex++;
        displayQuestion();
    }

    function updateProgress() {
        const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
        const progressFill = document.getElementById('progressFill');
        const currentQ = document.getElementById('currentQuestion');
        const totalQ = document.getElementById('totalQuestions');

        if (progressFill) progressFill.style.width = progress + '%';
        if (currentQ) currentQ.textContent = state.currentQuestionIndex + 1;
        if (totalQ) totalQ.textContent = state.questions.length;
    }

    function showResults() {
        const questionScreen = document.getElementById('quizQuestionScreen');
        const resultsScreen = document.getElementById('quizResultsScreen');

        if (questionScreen) questionScreen.classList.add('hidden');
        if (resultsScreen) resultsScreen.classList.remove('hidden');

        const finalScore = document.getElementById('finalScore');
        if (finalScore) finalScore.textContent = state.score;

        const percentage = (state.score / state.questions.length) * 100;
        let message = '';
        let icon = '';
        let type = '';

        if (percentage === 100) {
            message = 'Perfect Score! You are a quiz master!';
            icon = '🏆';
            type = 'win';
        } else if (percentage >= 80) {
            message = 'Excellent! You did great!';
            icon = '🌟';
            type = 'win';
        } else if (percentage >= 60) {
            message = 'Good job! Keep practicing!';
            icon = '👍';
            type = 'draw';
        } else {
            message = 'You can do better! Try again!';
            icon = '💪';
            type = 'lose';
        }

        const resultsMessage = document.getElementById('resultsMessage');
        if (resultsMessage) resultsMessage.textContent = icon + ' ' + message;

        // Show quiz result modal
        showGameModal({
            type: type,
            icon: icon,
            title: `Quiz Complete: ${state.score}/${state.questions.length}`,
            message: message,
            onPlayAgain: () => restartQuiz()
        });
    }

    function restartQuiz() {
        removeQuestionEventListeners();
        showCategorySelection();
    }

    function playSound(soundId) {
        try {
            const audio = document.getElementById(soundId);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        } catch (e) {}
    }

    function removeQuestionEventListeners() {
        // Remove listeners for quiz-option elements and old click handlers
        for (let i = state.eventListeners.length - 1; i >= 0; i--) {
            const listener = state.eventListeners[i];
            if (listener.element && (listener.element.classList?.contains('quiz-option') || listener.element.dataset?.index)) {
                listener.element.removeEventListener(listener.event, listener.handler);
                state.eventListeners.splice(i, 1);
            }
        }
    }

    function removeEventListeners() {
        state.eventListeners.forEach(({ element, event, handler }) => {
            if (element) {
                element.removeEventListener(event, handler);
            }
        });
        state.eventListeners = [];
    }

    function setupCategoryButtons() {
        const categoryScreen = document.getElementById('quizCategoryScreen');
        if (!categoryScreen) return;

        // Clean up old listeners first
        removeEventListeners();

        const categoryBtns = categoryScreen.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                startQuiz(btn.dataset.category);
            };
            btn.addEventListener('click', handler);
            state.eventListeners.push({ element: btn, event: 'click', handler });
        });
    }

    function setupQuestionScreenButtons() {
        const nextBtn = document.getElementById('nextBtn');
        const restartBtn = document.getElementById('quizRestart');
        const restartResultsBtn = document.getElementById('restartFromResults');
        const restartZeroBtn = document.getElementById('restartQuizZero');

        if (nextBtn) {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                nextQuestion();
            };
            nextBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: nextBtn, event: 'click', handler });
        }

        if (restartBtn) {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (state.currentQuestionIndex > 0) {
                    showConfirmModal({
                        icon: '🔙',
                        title: 'Back to Categories?',
                        message: 'Your quiz progress will be lost. Continue?',
                        onConfirm: () => restartQuiz()
                    });
                } else {
                    restartQuiz();
                }
            };
            restartBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: restartBtn, event: 'click', handler });
        }

        if (restartResultsBtn) {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                restartQuiz();
            };
            restartResultsBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: restartResultsBtn, event: 'click', handler });
        }

        if (restartZeroBtn) {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                showConfirmModal({
                    icon: '🔄',
                    title: 'Reset Quiz?',
                    message: 'This will reset your quiz and return to category selection. Continue?',
                    onConfirm: () => {
                        restartQuizFromZero();
                        showToast({
                            type: 'info',
                            icon: '🔄',
                            title: 'Quiz Reset',
                            message: 'Quiz has been reset.',
                            duration: 2000
                        });
                    }
                });
            };
            restartZeroBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: restartZeroBtn, event: 'click', handler });
        }
    }

    function restartQuizFromZero() {
        removeEventListeners();
        showCategorySelection();
        updateScoreDisplay();
    }

    return {
        init() {
            // Always cleanup first
            removeEventListeners();
            stopTimer();
            setupCategoryButtons();
            setupQuestionScreenButtons();
            updateScoreDisplay();
        },
        activate() {
            showCategorySelection();
        },
        pause() {
            stopTimer();
            removeQuestionEventListeners();
            state.gameActive = false;
        },
        cleanup() {
            stopTimer();
            removeEventListeners();
            removeQuestionEventListeners();
        }
    };
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

        const config = difficultyConfig[difficulty];
        state.totalTime = config.timeLimit;
        state.timeRemaining = config.timeLimit;
        
        // Create pairs of symbols (cardCount / 2 pairs)
        const pairsNeeded = config.cardCount / 2;
        const usedSymbols = symbols.slice(0, pairsNeeded);
        state.cards = [...usedSymbols, ...usedSymbols];

        shuffleCards();

        // Update grid columns
        const grid = document.getElementById('memoryGrid');
        if (grid) {
            grid.style.gridTemplateColumns = `repeat(${config.columns}, 1fr)`;
        }

        // Show game screen
        const difficultyScreen = document.getElementById('difficultySelection');
        const gameScreen = document.getElementById('memoryGameScreen');

        if (difficultyScreen) difficultyScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');

        // Render cards and attach event delegation listener
        renderCards();
        setGridLocked(false);
        updateCounters();
        startTimer();

        // Show toast for starting game
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

        // Update timer color based on time remaining
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
            playSound('moveSound');
            
            // Show lose modal
            showGameModal({
                type: 'lose',
                icon: '⏰',
                title: "Time's Up!",
                message: `You matched ${pairsMatched}/${totalPairs} pairs with ${state.score} points. Try again!`,
                onPlayAgain: () => resetGame()
            });
        } else if (reason === 'won') {
            // This is handled in gameWon()
        }
    }

    function setupGame() {
        state.cards = [...symbols, ...symbols];
        shuffleCards();
        renderCards();
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

        // Clear old cards and unlock the grid
        grid.innerHTML = '';
        grid.classList.remove('locked');


        state.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            card.textContent = '?';
            
            // Attach click handler directly to each card
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

    function setupMemoryGridListener() {
        const grid = document.getElementById('memoryGrid');
        if (!grid) {
            return;
        }
        if (state.gridListenerAttached) {
            return;
        }

        // Use event delegation on the grid container
        const handler = (e) => {
            const card = e.target.closest('.memory-card');
            if (!card) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            const index = parseInt(card.dataset.index);
            if (!isNaN(index)) {
                flipCard(index);
            }
        };

        grid.addEventListener('click', handler);
        state.eventListeners.push({ element: grid, event: 'click', handler });
        state.gridListenerAttached = true;
    }

    function flipCard(index) {
        
        // Strict guards to prevent interaction during animations or when inappropriate
        if (!state.gameActive) {
            return;
        }
        if (state.isProcessing) {
            return;
        }
        if (state.flipped.includes(index)) {
            return;
        }
        if (state.matched.includes(index)) {
            return;
        }
        if (state.flipped.length >= 2) {
            return;
        }

        const card = document.querySelector(`#memoryGrid [data-index="${index}"]`);
        if (!card) {
            console.warn(`[Memory] Card element not found for index ${index}`);
            return;
        }

        card.classList.add('flipped');
        const emoji = state.cards[index];
        card.textContent = emoji;
        state.flipped.push(index);
        playSound('flipSound');


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
        // Lock input immediately
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
                playSound('winSound');

                if (state.matched.length === state.cards.length) {
                    gameWon();
                }
            }, 300);
        } else {
            // Input stays locked during unflip animation
            setTimeout(() => {
                unflipCards();
                state.flipped = [];
                state.isProcessing = false;
                setGridLocked(false);
                playSound('moveSound');
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
        playSound('winSound');
        
        // Show win modal
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

    function restartMemoryFromZero() {
        stopTimer();
        state.isProcessing = false;
        setGridLocked(false);
        state.flipped = [];
        state.matched = [];
        state.moves = 0;
        state.score = 0;
        state.gameActive = false;
        state.cards = [];
        showDifficultySelection();
        updateCounters();
    }

    function playSound(soundId) {
        try {
            const audio = document.getElementById(soundId);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        } catch (e) {}
    }

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
            // Remove flag for fresh attachment
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
        const mainMenuBtn = document.getElementById('memoryMainMenu');
        const restartZeroBtn = document.getElementById('restartMemoryZero');
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

        if (mainMenuBtn) {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (state.gameActive && state.matched.length > 0) {
                    showConfirmModal({
                        icon: '🏠',
                        title: 'Return to Main Menu?',
                        message: 'Your current game progress will be lost. Continue?',
                        onConfirm: () => {
                            stopTimer();
                            switchGame('tictactoe');
                        }
                    });
                } else {
                    stopTimer();
                    switchGame('tictactoe');
                }
            };
            mainMenuBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: mainMenuBtn, event: 'click', handler });
        }

        if (restartZeroBtn) {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                showConfirmModal({
                    icon: '🔄',
                    title: 'Reset Game?',
                    message: 'This will reset all your progress. Are you sure?',
                    onConfirm: () => {
                        restartMemoryFromZero();
                        showToast({
                            type: 'info',
                            icon: '🔄',
                            title: 'Game Reset',
                            message: 'Memory game has been reset.',
                            duration: 2000
                        });
                    }
                });
            };
            restartZeroBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: restartZeroBtn, event: 'click', handler });
        }

        state.controlsBound = true;
    }

    return {
        init() {
            // Init runs once; attach listeners only once
            stopTimer();
            
            // CRITICAL: Fully reset game state to completely unlock any locked state
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
            // NOTE: Don't call setupMemoryGridListener() here - grid doesn't exist yet
            // It will be called when cards are rendered after difficulty selection
            showDifficultySelection();
        },
        activate() {
            // CRITICAL: Reset all state flags that might be locked from previous game
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
            
            // Show difficulty selection
            showDifficultySelection();
        },
        pause() {
            state.gameActive = false;
            stopTimer();
            // CRITICAL: Do NOT set isProcessing = true - this locks the game permanently
            // Just pause without locking input
        },
        cleanup() {
            stopTimer();
            // Reset all state to ensure clean state for next activation
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

// Initialize wrapper functions for backward compatibility
function initTicTacToe() {
    gameState.gameInstances.tictactoe?.init();
}

function initQuiz() {
    gameState.gameInstances.quiz?.init();
}

function initMemoryGame() {
    gameState.gameInstances.memory?.init();
}

function initSnakeGame() {
    gameState.gameInstances.snake?.init();
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
            if (gameState.currentGame !== 'snake') return;
            
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
            playSound('winSound');
            
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
        playSound('moveSound');
        
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

    function playSound(soundId) {
        try {
            const audio = document.getElementById(soundId);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        } catch (e) {}
    }

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

// ============================================
// MEMORY MAZE GAME - Factory Pattern
// Combines maze navigation with Simon-says color memory
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
            if (gameState.currentGame !== 'maze') return;
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
        
        // Sound toggle
        const soundToggle = document.getElementById('mazeSoundToggle');
        if (soundToggle) {
            soundToggle.checked = state.soundEnabled;
            const handler = () => {
                state.soundEnabled = soundToggle.checked;
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
            playSound('moveSound');
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
        playSound('flipSound');
        
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
        
        playSound('winSound');
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
        
        playSound('moveSound');
        
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
        
        playSound('winSound');
        
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
    
    function playSound(soundId) {
        if (!state.soundEnabled) return;
        try {
            const audio = document.getElementById(soundId);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        } catch (e) {}
    }

    function playColorSound(color) {
        // Play a simple tone for each color (using the available sounds)
        if (!state.soundEnabled) return;
        playSound('flipSound');
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

// ============================================
// DEBUG UTILITIES - For testing interactions
// ============================================
window.DEBUG_GAME = {
    testClickHandlers: () => {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, idx) => {
            if (cell.onclick) console.warn(`Cell ${idx} has inline onclick!`);
            const listeners = getEventListeners?.(cell)?.click;
        });
        
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((opt, idx) => {
            if (opt.onclick) console.warn(`Option ${idx} has inline onclick!`);
            const listeners = getEventListeners?.(opt)?.click;
        });
        
        const cards = document.querySelectorAll('.memory-card');
        cards.forEach((card, idx) => {
            if (card.onclick) console.warn(`Card ${idx} has inline onclick!`);
            const listeners = getEventListeners?.(card)?.click;
        });
    },
    
    verifyPointerEvents: () => {
        const testElements = {
            'cells': document.querySelectorAll('.cell'),
            'quiz-options': document.querySelectorAll('.quiz-option'),
            'memory-cards': document.querySelectorAll('.memory-card'),
            'buttons': document.querySelectorAll('button'),
            'difficulty-buttons': document.querySelectorAll('.difficulty-btn')
        };
        
        for (const [name, elements] of Object.entries(testElements)) {
            elements.forEach((el, idx) => {
                const pointerEvents = window.getComputedStyle(el).pointerEvents;
                if (pointerEvents !== 'auto') {
                    console.warn(`${name}[${idx}] has pointer-events: ${pointerEvents}`);
                }
            });
        }
    },
    
    verifyListeners: () => {
        // Debug function - removed console logs
    }
};


