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
    console.log('DOM fully loaded - initializing Game Hub');
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
    
    // Create global accessor functions for debugging
    window.initTicTacToe = () => gameState.gameInstances.tictactoe?.init();
    window.initQuiz = () => gameState.gameInstances.quiz?.init();
    window.initMemoryGame = () => gameState.gameInstances.memory?.init();
    
    console.log('Initializing all games');
    Object.values(gameState.gameInstances).forEach(game => game.init());
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

    console.log(`Switching from ${gameState.currentGame} to ${gameId}`);

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
    console.log(`Re-initializing ${gameId} game`);
    activateGame(gameId);
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

                scheduleAutoReset();
                return { winner };
            }
        }

        if (!state.board.includes('')) {
            state.scores.draw += 1;
            saveScores();
            updateScoreDisplay();

            const status = document.getElementById('gameStatus');
            if (status) status.textContent = "It's a Draw!";

            scheduleAutoReset();
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
        
        console.log('[TTT] Board event delegation listener attached');
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
                restartFromZero();
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
        console.log(`[TTT] Cell clicked: index=${index}, gameActive=${state.gameActive}, board[${index}]=${state.board[index]}`);
        
        if (state.board[index] !== '' || !state.gameActive) {
            console.log(`[TTT] Click rejected - cell occupied or game inactive`);
            return;
        }

        state.board[index] = state.currentPlayer;
        updateBoardDisplay();
        playSound('moveSound');

        const result = checkGameState();
        if (result) {
            state.gameActive = false;
            console.log(`[TTT] Game ended with result:`, result);
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
            console.log('Initializing Tic-Tac-Toe game');
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
            console.log('Activating Tic-Tac-Toe game');
            state.gameActive = true;
            resetGame();
            updateStatusDisplay();
            updateScoreDisplay();
        },
        pause() {
            console.log('Pausing Tic-Tac-Toe game');
            state.gameActive = false;
            if (state.autoResetTimeout) {
                clearTimeout(state.autoResetTimeout);
            }
        },
        cleanup() {
            console.log('Cleaning up Tic-Tac-Toe game');
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
            } else {
                playSound('moveSound');
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

        if (percentage === 100) {
            message = '🎉 Perfect Score! You are a quiz master!';
        } else if (percentage >= 80) {
            message = '🌟 Excellent! You did great!';
        } else if (percentage >= 60) {
            message = '👍 Good job! Keep practicing!';
        } else {
            message = '💪 You can do better! Try again!';
        }

        const resultsMessage = document.getElementById('resultsMessage');
        if (resultsMessage) resultsMessage.textContent = message;
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
                restartQuiz();
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
                restartQuizFromZero();
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
            console.log('Initializing Quiz game');
            // Always cleanup first
            removeEventListeners();
            stopTimer();
            setupCategoryButtons();
            setupQuestionScreenButtons();
            updateScoreDisplay();
        },
        activate() {
            console.log('Activating Quiz game');
            showCategorySelection();
        },
        pause() {
            console.log('Pausing Quiz game');
            stopTimer();
            removeQuestionEventListeners();
            state.gameActive = false;
        },
        cleanup() {
            console.log('Cleaning up Quiz game');
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
    const symbols = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍓', '🍒', '🍑', '🥝', '🍐', '🍍', '🥭', '🍓', '🍒'];

    const difficultyConfig = {
        easy: { cardCount: 9, columns: 3, rows: 3, symbols: 4, name: 'Easy', timeLimit: 90 },
        medium: { cardCount: 16, columns: 4, rows: 4, symbols: 8, name: 'Medium', timeLimit: 120 },
        hard: { cardCount: 25, columns: 5, rows: 5, symbols: 12, name: 'Hard', timeLimit: 150 }
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

        console.log(`Starting Memory game with difficulty: ${difficulty}`);

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
        
        // Create pairs of symbols
        const requiredSymbols = Math.min(config.symbols, symbols.length);
        const usedSymbols = symbols.slice(0, requiredSymbols);
        state.cards = [...usedSymbols, ...usedSymbols];

        // Validate card count
        if (state.cards.length !== config.cardCount) {
            while (state.cards.length < config.cardCount) {
                state.cards.push(symbols[state.cards.length % symbols.length]);
            }
            state.cards = state.cards.slice(0, config.cardCount);
        }

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
            if (message) {
                message.textContent = `⏰ Time's Up! You matched ${state.matched.length / 2} pairs with ${state.score} points. Try again!`;
            }
            playSound('moveSound');
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

        // Clear old cards
        grid.innerHTML = '';

        state.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            card.textContent = '?';
            
            card.style.pointerEvents = 'auto';
            card.style.cursor = 'pointer';

            if (state.matched.includes(index)) {
                card.classList.add('matched');
                card.classList.add('flipped');
                card.textContent = symbol;
            }

            grid.appendChild(card);
        });

        // Ensure event delegation listener is attached to grid
        setupMemoryGridListener();
        console.log('[Memory] Cards rendered and grid listener attached');
    }

    function setupMemoryGridListener() {
        const grid = document.getElementById('memoryGrid');
        if (!grid) return;
        if (state.gridListenerAttached) return;

        // Use event delegation on the grid container
        const handler = (e) => {
            const card = e.target.closest('.memory-card');
            if (!card) return;
            
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
        console.log('[Memory] Grid event delegation listener attached');
    }

    function flipCard(index) {
        console.log(`[Memory] Card clicked: index=${index}, gameActive=${state.gameActive}, isProcessing=${state.isProcessing}`);
        
        // Strict guards to prevent interaction during animations or when inappropriate
        if (!state.gameActive) {
            console.log(`[Memory] Click rejected - game not active`);
            return;
        }
        if (state.isProcessing) {
            console.log(`[Memory] Click rejected - processing/locked`);
            return;
        }
        if (state.flipped.includes(index)) {
            console.log(`[Memory] Click rejected - already flipped`);
            return;
        }
        if (state.matched.includes(index)) {
            console.log(`[Memory] Click rejected - already matched`);
            return;
        }
        if (state.flipped.length >= 2) {
            console.log(`[Memory] Click rejected - already flipped 2 cards`);
            return;
        }

        const card = document.querySelector(`[data-index="${index}"]`);
        if (!card) {
            console.warn(`[Memory] Card element not found for index ${index}`);
            return;
        }

        card.classList.add('flipped');
        card.textContent = state.cards[index];
        state.flipped.push(index);
        playSound('flipSound');

        console.log(`[Memory] Card flipped, flipped count: ${state.flipped.length}`);

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
                const firstCard = document.querySelector(`[data-index="${first}"]`);
                const secondCard = document.querySelector(`[data-index="${second}"]`);
                if (firstCard) {
                    firstCard.classList.add('matched');
                    firstCard.style.pointerEvents = 'auto';
                }
                if (secondCard) {
                    secondCard.classList.add('matched');
                    secondCard.style.pointerEvents = 'auto';
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
            const card = document.querySelector(`[data-index="${index}"]`);
            if (card) {
                card.classList.remove('flipped');
            }
        });    card.textContent = '?';
            
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
                resetGame();
            };
            resetBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: resetBtn, event: 'click', handler });
        }

        if (mainMenuBtn) {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                stopTimer();
                switchGame('tictactoe');
            };
            mainMenuBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: mainMenuBtn, event: 'click', handler });
        }

        if (restartZeroBtn) {
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                restartMemoryFromZero();
            };
            restartZeroBtn.addEventListener('click', handler);
            state.eventListeners.push({ element: restartZeroBtn, event: 'click', handler });
        }

        state.controlsBound = true;
    }

    return {
        init() {
            console.log('Initializing Memory game');
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
            console.log('Activating Memory game');
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
            console.log('Pausing Memory game');
            state.gameActive = false;
            stopTimer();
            // CRITICAL: Do NOT set isProcessing = true - this locks the game permanently
            // Just pause without locking input
        },
        cleanup() {
            console.log('Cleaning up Memory game');
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
    console.log('[INIT] Called initTicTacToe()');
    gameState.gameInstances.tictactoe?.init();
}

function initQuiz() {
    console.log('[INIT] Called initQuiz()');
    gameState.gameInstances.quiz?.init();
}

function initMemoryGame() {
    console.log('[INIT] Called initMemoryGame()');
    gameState.gameInstances.memory?.init();
}

// ============================================
// DEBUG UTILITIES - For testing interactions
// ============================================
window.DEBUG_GAME = {
    testClickHandlers: () => {
        console.log('=== CLICK HANDLER TEST ===');
        console.log('Testing Tic-Tac-Toe cells...');
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, idx) => {
            if (cell.onclick) console.warn(`Cell ${idx} has inline onclick!`);
            const listeners = getEventListeners?.(cell)?.click;
            console.log(`Cell ${idx} listeners:`, listeners ? listeners.length : 'none');
        });
        
        console.log('Testing Quiz options...');
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((opt, idx) => {
            if (opt.onclick) console.warn(`Option ${idx} has inline onclick!`);
            const listeners = getEventListeners?.(opt)?.click;
            console.log(`Option ${idx} listeners:`, listeners ? listeners.length : 'none');
        });
        
        console.log('Testing Memory cards...');
        const cards = document.querySelectorAll('.memory-card');
        cards.forEach((card, idx) => {
            if (card.onclick) console.warn(`Card ${idx} has inline onclick!`);
            const listeners = getEventListeners?.(card)?.click;
            console.log(`Card ${idx} listeners:`, listeners ? listeners.length : 'none');
        });
    },
    
    verifyPointerEvents: () => {
        console.log('=== POINTER EVENTS TEST ===');
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
        console.log('Pointer events verification complete');
    },
    
    verifyListeners: () => {
        console.log('=== GAME INSTANCES ===');
        console.log('Game state:', gameState);
        Object.entries(gameState.gameInstances).forEach(([name, game]) => {
            console.log(`${name}:`, {
                init: typeof game.init,
                activate: typeof game.activate,
                pause: typeof game.pause,
                cleanup: typeof game.cleanup
            });
        });
    }
};

console.log('%c✅ Game Hub Ready! Available debug commands:\n- window.DEBUG_GAME.testClickHandlers()\n- window.DEBUG_GAME.verifyPointerEvents()\n- window.DEBUG_GAME.verifyListeners()', 'color: green; font-weight: bold;');

