/**
 * This file implements the Hangman game for web play
 */
class HangmanGame {
    // Maximum number of wrong guesses allowed
    static MAX_WRONG_GUESSES = 6;
    
    /**
     * Creates a new Hangman game with a random word.
     */
    constructor(word = null) {
        // Use provided word or get a random one
        this.word = (word || HangmanGame.getRandomWord()).toUpperCase();
        this.guessedLetters = new Set();
        this.wrongGuesses = 0;
        this.gameOver = false;
        this.playerWon = false;
    }
    
    /**
     * Makes a guess of the specified letter.
     * @param letter The letter to guess (case insensitive)
     * @return true if the letter is in the word, false otherwise
     */
    guess(letter) {
        if (this.gameOver) {
            return false;
        }
        
        // Convert to uppercase
        letter = letter.toUpperCase();
        
        // Check if the letter has already been guessed
        if (this.guessedLetters.has(letter)) {
            return false;
        }
        
        // Add the letter to the set of guessed letters
        this.guessedLetters.add(letter);
        
        // Check if the letter is in the word
        const correctGuess = this.word.indexOf(letter) >= 0;
        
        // If the guess is wrong, increment the wrong guess counter
        if (!correctGuess) {
            this.wrongGuesses++;
            
            // Check if the player has reached the maximum number of wrong guesses
            if (this.wrongGuesses >= HangmanGame.MAX_WRONG_GUESSES) {
                this.gameOver = true;
                this.playerWon = false;
            }
        } else {
            // Check if the player has won
            if (this.isWordGuessed()) {
                this.gameOver = true;
                this.playerWon = true;
            }
        }
        
        return correctGuess;
    }
    
    /**
     * Returns the current state of the word, with unguessed letters replaced by underscores.
     * @return The current state of the word
     */
    getWordState() {
        let result = '';
        
        for (let i = 0; i < this.word.length; i++) {
            const c = this.word.charAt(i);
            
            if (this.guessedLetters.has(c)) {
                result += c;
            } else {
                result += '_';
            }
            
            result += ' ';
        }
        
        return result.trim();
    }
    
    /**
     * Returns an array of all letters that have been guessed, in alphabetical order.
     * @return An array of guessed letters
     */
    getGuessedLettersList() {
        return Array.from(this.guessedLetters).sort();
    }
    
    /**
     * Returns the number of wrong guesses so far.
     * @return The number of wrong guesses
     */
    getWrongGuesses() {
        return this.wrongGuesses;
    }
    
    /**
     * Returns whether the game is over.
     * @return true if the game is over, false otherwise
     */
    isGameOver() {
        return this.gameOver;
    }
    
    /**
     * Returns whether the player has won.
     * @return true if the player has won, false otherwise
     */
    hasPlayerWon() {
        return this.playerWon;
    }
    
    /**
     * Returns the word to guess.
     * @return The word to guess
     */
    getWord() {
        return this.word;
    }
    
    /**
     * Checks if the word has been fully guessed.
     * @return true if the word has been guessed, false otherwise
     */
    isWordGuessed() {
        for (let i = 0; i < this.word.length; i++) {
            if (!this.guessedLetters.has(this.word.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns a random word from the list.
     * All words are uppercase.
     */
    static getRandomWord() {
        return HangmanGame.WORDS[Math.floor(Math.random() * HangmanGame.WORDS.length)];
    }

    // Word list for the game
    static WORDS = [
        "ABSTRACT", "ADVANCED", "AIRPLANE", "ALPHABET", "ANALYSIS", 
        "APPROACH", "ARGUMENT", "ARTISTIC", "AUDIENCE", "BASEBALL",
        "BATHROOM", "BEAUTIFUL", "BIRTHDAY", "BRILLIANT", "BUSINESS",
        "CAMPAIGN", "CAPACITY", "CATEGORY", "CHAMPION", "CHEMICAL",
        "CHILDREN", "CIRCUIT", "CLASSIC", "CLIMATE", "COMPUTER",
        "CONCRETE", "CONDUCTOR", "CONSIDER", "CREATIVE", "CRITICAL",
        "CULTURAL", "CUSTOMER", "DATABASE", "DECISION", "DEDICATED",
        "DELIVERY", "DEMOCRACY", "DESIGNER", "DETAILED", "DETECTIVE",
        "DIABETES", "DIALOGUE", "DIFFICULT", "DINOSAUR", "DIRECTOR",
        "DISCOVERY", "DOCUMENT", "DOMESTIC", "DRAMATIC", "ECONOMIC",
        "EDUCATED", "EGYPTIAN", "ELECTION", "ELEPHANT", "ENGINEER",
        "ENORMOUS", "ENTRANCE", "ENVIRONMENT", "ESTIMATE", "EXCHANGE",
        "EXCITING", "EXERCISE", "EXPLICIT", "EXTERNAL", "FACILITY",
        "FAMILIAR", "FAVORITE", "FESTIVAL", "FINANCIAL", "FLAGSHIP",
        "FOOTBALL", "FORECAST", "FRAGMENT", "FUNCTION", "FURNITURE",
        "GAMBLING", "GENEROUS", "GRADUATE", "GRAPHICS", "GRATITUDE",
        "GUARDIAN", "GUIDANCE", "HAMBURGER", "HARDWARE", "HEADLINE",
        "HERITAGE", "HIGHLAND", "HISTORIC", "HUMANITY", "IDENTICAL",
        "IMPERIAL", "INCIDENT", "INDUSTRY", "INFERIOR", "INNOCENT",
        "INSTANCE", "INSULTING", "INTEGRAL", "INVASION", "INVESTOR",
        "JEALOUSY", "JUDGMENT", "KEYBOARD", "KNOWLEDGE", "LANGUAGE",
        "LAUGHTER", "LEARNING", "LEVERAGE", "LIFESTYLE", "LIGHTNING",
        "LITERARY", "LOCATION", "MAGAZINE", "MAGNETIC", "MAJORITY",
        "MARATHON", "MARKETING", "MATERIAL", "MEDICINE", "MEMORIAL",
        "MIDNIGHT", "MILITARY", "MINORITY", "MOMENTUM", "MOUNTAIN",
        "NATIONAL", "NEGATIVE", "NEIGHBOR", "NEWSPAPER", "OBJECTIVE",
        "OBSTACLE", "OFFERING", "OFFICIAL", "OPERATOR", "OPTIMISM",
        "ORIGINAL", "OVERSIGHT", "PAINTING", "PARALLEL", "PARENTAL",
        "PASSWORD", "PATIENCE", "PERIODIC", "PERSONAL", "PHYSICAL",
        "PLANNING", "PLATFORM", "PLEASURE", "POLITICS", "PORTABLE",
        "PORTRAIT", "POSITION", "POSITIVE", "POSSIBLE", "POTENTIAL",
        "PRACTICE", "PRECIOUS", "PREGNANT", "PRESENCE", "PRESSURE",
        "PREVIOUS", "PRINCESS", "PRIORITY", "PROGRESS", "PROPERTY",
        "PROPOSAL", "PROTOCOL", "PROVINCE", "PSYCHIC", "PURCHASE",
        "QUANTITY", "QUESTION", "RATIONAL", "REACTION", "RECEIVER",
        "RECOVERY", "REGIONAL", "REGISTER", "RELATION", "RELATIVE",
        "REMEMBER", "REPUBLIC", "RESEARCH", "RESOURCE", "RESPONSE",
        "SANDWICH", "SCHEDULE", "SCIENTIST", "SEASONAL", "SECURITY",
        "SENTENCE", "SEPARATE", "SEQUENCE", "SERGEANT", "SHIPPING",
        "SHORTAGE", "SHOULDER", "SIMPLICITY", "SOLUTION", "SOMEWHAT",
        "SOUTHERN", "SPECIALIST", "SPIRITUAL", "SPOKESMAN", "STANDARD",
        "STRATEGY", "STRENGTH", "STRICTLY", "STRUCTURE", "STUDENT",
        "SUBJECTIVE", "SUBMARINE", "SUBSTANCE", "SUBSTITUTE", "SUBURBAN",
        "SUFFERING", "SUGGESTION", "SURROUND", "SURVIVAL", "SWIMMING",
        "SYMPATHY", "SYNDROME", "TACTICAL", "TEACHING", "TECHNICAL",
        "TEENAGER", "TELEPHONE", "TELESCOPE", "TERRIBLE", "TERRITORY",
        "THINKING", "THOUSAND", "TOMORROW", "TRAINING", "TRIANGLE",
        "TROPICAL", "ULTIMATE", "UMBRELLA", "UNIVERSE", "VACATION",
        "VARIABLE", "VERTICAL", "VICTORIA", "VIOLENCE", "VOLATILE",
        "WALLPAPER", "WAREHOUSE", "WARRANTY", "WEAKNESS", "WEATHER",
        "WEDDING", "WEEKEND", "WILDLIFE", "WIRELESS", "WITHDRAW",
        "WOODLAND", "WORKSHOP", "YOURSELF", "ZEPPELIN"
    ];
} 