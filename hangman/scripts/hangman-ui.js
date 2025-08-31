/**
 * This file implements the UI for the Hangman game
 */

document.addEventListener('DOMContentLoaded', function() {
    // Make sure the HangmanGame class is loaded
    if (typeof HangmanGame === 'undefined') {
        console.error('HangmanGame class not found');
        return;
    }

    // Only initialize if the hangman container exists
    const hangmanContainer = document.getElementById('hangman-game');
    if (!hangmanContainer) return;

    // Game instance
    let game = null;
    
    // Game elements
    let wordDisplay = null;
    let keyboardContainer = null;
    let messageDisplay = null;
    let hangmanFigure = null;
    let newGameBtn = null;
    
    // Initialize the game UI
    function initializeGame() {
        // Create game UI
        hangmanContainer.innerHTML = `
            <div class="hangman-wrapper glass">
                <h3>Hangman Game</h3>
                <div class="game-rules">
                    <p>Rules:</p>
                    <ul>
                        <li>Guess one letter at a time to reveal the hidden word</li>
                        <li>You have 6 attempts before the hangman is complete</li>
                        <li>Each wrong guess adds a part to the hangman</li>
                        <li>Win by guessing the word before the hangman is complete!</li>
                    </ul>
                </div>
                <div class="hangman-figure" id="hangman-figure">
                    <svg width="200" height="250" viewBox="0 0 200 250">
                        <!-- Gallows -->
                        <line x1="20" y1="230" x2="120" y2="230" stroke-width="3" stroke="currentColor" />
                        <line x1="40" y1="230" x2="40" y2="30" stroke-width="3" stroke="currentColor" />
                        <line x1="40" y1="30" x2="100" y2="30" stroke-width="3" stroke="currentColor" />
                        <line x1="100" y1="30" x2="100" y2="50" stroke-width="3" stroke="currentColor" />
                        
                        <!-- Head (part 1) -->
                        <circle id="hangman-head" cx="100" cy="70" r="20" stroke-width="3" stroke="currentColor" fill="none" class="hidden" />
                        
                        <!-- Body (part 2) -->
                        <line id="hangman-body" x1="100" y1="90" x2="100" y2="150" stroke-width="3" stroke="currentColor" class="hidden" />
                        
                        <!-- Left Arm (part 3) -->
                        <line id="hangman-arm-left" x1="100" y1="110" x2="70" y2="100" stroke-width="3" stroke="currentColor" class="hidden" />
                        
                        <!-- Right Arm (part 4) -->
                        <line id="hangman-arm-right" x1="100" y1="110" x2="130" y2="100" stroke-width="3" stroke="currentColor" class="hidden" />
                        
                        <!-- Left Leg (part 5) -->
                        <line id="hangman-leg-left" x1="100" y1="150" x2="70" y2="180" stroke-width="3" stroke="currentColor" class="hidden" />
                        
                        <!-- Right Leg (part 6) -->
                        <line id="hangman-leg-right" x1="100" y1="150" x2="130" y2="180" stroke-width="3" stroke="currentColor" class="hidden" />
                    </svg>
                </div>
                <div class="hangman-word" id="hangman-word"></div>
                <div class="hangman-message" id="hangman-message"></div>
                <div class="hangman-keyboard" id="hangman-keyboard"></div>
                <button class="hangman-btn" id="hangman-new-game">New Game</button>
            </div>
        `;
        
        // Get UI elements
        wordDisplay = document.getElementById('hangman-word');
        keyboardContainer = document.getElementById('hangman-keyboard');
        messageDisplay = document.getElementById('hangman-message');
        newGameBtn = document.getElementById('hangman-new-game');
        
        // Add event listeners
        newGameBtn.addEventListener('click', startNewGame);
        
        // Create the keyboard
        createKeyboard();
        
        // Start a new game
        startNewGame();
    }
    
    // Create the onscreen keyboard
    function createKeyboard() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const keyboard = document.createElement('div');
        keyboard.classList.add('hangman-keyboard-layout');
        
        for (let letter of letters) {
            const key = document.createElement('button');
            key.classList.add('hangman-key');
            key.textContent = letter;
            key.dataset.letter = letter;
            key.addEventListener('click', function() {
                processGuess(letter);
            });
            keyboard.appendChild(key);
        }
        
        keyboardContainer.appendChild(keyboard);
    }
    
    // Start a new game
    function startNewGame() {
        // Create a new instance of HangmanGame
        game = new HangmanGame();
        
        // Reset the UI
        updateWordDisplay();
        resetKeyboard();
        resetHangmanFigure();
        messageDisplay.textContent = 'Guess a letter to start!';
        messageDisplay.classList.remove('hangman-message-win', 'hangman-message-lose');
    }
    
    // Process a letter guess
    function processGuess(letter) {
        if (!game || game.isGameOver()) return;
        
        const correct = game.guess(letter);
        updateWordDisplay();
        updateKeyboard(letter, correct);
        updateHangmanFigure();
        
        // Check if the game is over
        if (game.isGameOver()) {
            if (game.hasPlayerWon()) {
                messageDisplay.textContent = 'Congratulations! You won!';
                messageDisplay.classList.add('hangman-message-win');
            } else {
                messageDisplay.textContent = `Game over! The word was "${game.getWord()}"`;
                messageDisplay.classList.add('hangman-message-lose');
            }
        }
    }
    
    // Update the display of the word
    function updateWordDisplay() {
        wordDisplay.textContent = game.getWordState();
    }
    
    // Update the keyboard based on the guess
    function updateKeyboard(letter, correct) {
        const key = keyboardContainer.querySelector(`button[data-letter="${letter}"]`);
        if (key) {
            key.disabled = true;
            if (correct) {
                key.classList.add('hangman-key-correct');
            } else {
                key.classList.add('hangman-key-wrong');
            }
        }
    }
    
    // Reset the keyboard UI
    function resetKeyboard() {
        const keys = keyboardContainer.querySelectorAll('.hangman-key');
        keys.forEach(key => {
            key.disabled = false;
            key.classList.remove('hangman-key-correct', 'hangman-key-wrong');
        });
    }
    
    // Update the hangman figure based on wrong guesses
    function updateHangmanFigure() {
        const wrongGuesses = game.getWrongGuesses();
        const parts = [
            document.getElementById('hangman-head'),
            document.getElementById('hangman-body'),
            document.getElementById('hangman-arm-left'),
            document.getElementById('hangman-arm-right'),
            document.getElementById('hangman-leg-left'),
            document.getElementById('hangman-leg-right')
        ];
        
        // Show the parts corresponding to the number of wrong guesses
        for (let i = 0; i < parts.length; i++) {
            if (i < wrongGuesses) {
                parts[i].classList.remove('hidden');
            } else {
                parts[i].classList.add('hidden');
            }
        }
    }
    
    // Reset the hangman figure
    function resetHangmanFigure() {
        const parts = document.querySelectorAll('#hangman-figure .hidden');
        parts.forEach(part => {
            part.classList.add('hidden');
        });
    }

    // Initialize the game
    initializeGame();
    
    // Handle keyboard events
    document.addEventListener('keydown', function(event) {
        const key = event.key.toUpperCase();
        
        // Only process if it's a single letter and the game is active
        if (game && !game.isGameOver() && /^[A-Z]$/.test(key)) {
            processGuess(key);
        }
    });
}); 