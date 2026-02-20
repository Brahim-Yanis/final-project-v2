// ============================================
// SHARED SOUND SYSTEM - GAME HUB
// ============================================

const GameSounds = (function() {
    // Audio context for Web Audio API (mobile-friendly)
    let audioContext = null;
    let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default: enabled
    let initialized = false;

    // Sound definitions using oscillator-based synthesis (no external files needed)
    const soundDefinitions = {
        click: { type: 'square', frequency: 600, duration: 0.05, gain: 0.15 },
        gameStart: { type: 'sine', frequency: 440, duration: 0.15, gain: 0.2, sweep: 880 },
        win: { type: 'sine', frequency: 523, duration: 0.3, gain: 0.25, pattern: [523, 659, 784] },
        lose: { type: 'sawtooth', frequency: 200, duration: 0.4, gain: 0.2, sweep: 100 },
        correct: { type: 'sine', frequency: 880, duration: 0.12, gain: 0.2 },
        wrong: { type: 'square', frequency: 200, duration: 0.2, gain: 0.15 },
        flip: { type: 'sine', frequency: 400, duration: 0.08, gain: 0.12, sweep: 600 },
        match: { type: 'sine', frequency: 660, duration: 0.15, gain: 0.2 },
        eat: { type: 'sine', frequency: 500, duration: 0.08, gain: 0.15, sweep: 700 },
        move: { type: 'sine', frequency: 300, duration: 0.04, gain: 0.08 },
        levelUp: { type: 'sine', frequency: 440, duration: 0.4, gain: 0.25, pattern: [440, 554, 659, 880] },
        colorTone: { type: 'sine', duration: 0.25, gain: 0.3 } // Frequency set dynamically
    };

    // Color frequencies for maze game
    const colorFrequencies = {
        red: 261.63,    // C4
        yellow: 329.63, // E4
        green: 392.00,  // G4
        blue: 523.25,   // C5
        purple: 659.25  // E5
    };

    // Initialize audio context on first user interaction
    function init() {
        if (initialized) return true;
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            initialized = true;
            return true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            return false;
        }
    }

    // Ensure audio context is ready (call on user interaction)
    function unlock() {
        if (!audioContext) {
            init();
        } else if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    // Play a sound by name
    function play(soundName) {
        if (!soundEnabled) return;
        if (!init()) return;
        
        // Unlock audio context if needed
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const sound = soundDefinitions[soundName];
        if (!sound) {
            console.warn(`Sound "${soundName}" not found`);
            return;
        }

        try {
            if (sound.pattern) {
                // Play a sequence of notes
                playPattern(sound.pattern, sound.type, sound.duration / sound.pattern.length, sound.gain);
            } else {
                playTone(sound.type, sound.frequency, sound.duration, sound.gain, sound.sweep);
            }
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    // Play a single tone
    function playTone(type, frequency, duration, gain, sweep) {
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        if (sweep) {
            oscillator.frequency.exponentialRampToValueAtTime(sweep, audioContext.currentTime + duration);
        }

        gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    // Play a pattern of notes
    function playPattern(frequencies, type, noteDuration, gain) {
        if (!audioContext) return;

        frequencies.forEach((freq, index) => {
            const startTime = audioContext.currentTime + (index * noteDuration);
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(freq, startTime);

            gainNode.gain.setValueAtTime(gain, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration * 0.9);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + noteDuration);
        });
    }

    // Play color-specific tone for maze game
    function playColorTone(color) {
        if (!soundEnabled) return;
        if (!init()) return;

        const frequency = colorFrequencies[color];
        if (!frequency) return;

        const sound = soundDefinitions.colorTone;
        playTone(sound.type, frequency, sound.duration, sound.gain);
    }

    // Toggle sound on/off
    function toggle() {
        soundEnabled = !soundEnabled;
        localStorage.setItem('soundEnabled', soundEnabled);
        return soundEnabled;
    }

    // Set sound state
    function setEnabled(enabled) {
        soundEnabled = enabled;
        localStorage.setItem('soundEnabled', soundEnabled);
    }

    // Check if sound is enabled
    function isEnabled() {
        return soundEnabled;
    }

    // Public API
    return {
        init,
        unlock,
        play,
        playColorTone,
        toggle,
        setEnabled,
        isEnabled
    };
})();

// ============================================
// SOUND TOGGLE UI COMPONENT
// ============================================

function createSoundToggle() {
    // Check if toggle already exists
    if (document.getElementById('soundToggleBtn')) return;

    const toggle = document.createElement('button');
    toggle.id = 'soundToggleBtn';
    toggle.className = 'sound-toggle-btn';
    toggle.setAttribute('aria-label', 'Toggle sound');
    toggle.innerHTML = GameSounds.isEnabled() ? '🔊' : '🔇';
    
    toggle.addEventListener('click', () => {
        GameSounds.unlock(); // Ensure audio context is unlocked
        const enabled = GameSounds.toggle();
        toggle.innerHTML = enabled ? '🔊' : '🔇';
        toggle.classList.toggle('muted', !enabled);
    });

    // Add to page
    document.body.appendChild(toggle);
}

// ============================================
// LEGACY SOUND FUNCTION WRAPPERS
// For backwards compatibility with existing code
// ============================================

function playSound(soundName) {
    // Map legacy sound names to new system
    const soundMap = {
        'winSound': 'win',
        'moveSound': 'wrong',
        'flipSound': 'flip',
        'correct': 'correct',
        'wrong': 'wrong',
        'click': 'click',
        'gameStart': 'gameStart',
        'win': 'win',
        'lose': 'lose',
        'match': 'match',
        'eat': 'eat',
        'move': 'move',
        'levelUp': 'levelUp'
    };

    const mappedName = soundMap[soundName] || soundName;
    GameSounds.play(mappedName);
}

function playColorSound(color) {
    GameSounds.playColorTone(color);
}

// ============================================
// AUTO-INITIALIZATION
// ============================================

// Initialize sound toggle on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    createSoundToggle();
    
    // Unlock audio on first user interaction
    const unlockAudio = () => {
        GameSounds.unlock();
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
});
