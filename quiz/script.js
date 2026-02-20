// ============================================
// QUIZ - STANDALONE JAVASCRIPT
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
    gameState.gameInstance = QuizGame();
    gameState.gameInstance.init();
    showGameActiveNotification('Quiz');
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

        playSound('gameStart');
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
                    selectAnswer(-1);
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
                playSound('correct');
                showToast({
                    type: 'success',
                    icon: '🎉',
                    title: 'Correct!',
                    message: 'Great job! You got it right!',
                    duration: 2000
                });
            } else {
                playSound('wrong');
                showToast({
                    type: 'error',
                    icon: '😔',
                    title: 'Wrong Answer',
                    message: `The correct answer was: ${question.options[question.correct]}`,
                    duration: 3000
                });
            }
        } else {
            options.forEach((option, idx) => {
                option.classList.add('disabled');
                if (idx === question.correct) {
                    option.classList.add('correct');
                }
            });
            playSound('wrong');
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

        // Play appropriate sound based on performance
        playSound(percentage >= 60 ? 'win' : 'lose');

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

    // playSound is provided globally by sounds.js

    function removeQuestionEventListeners() {
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
