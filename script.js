// ============================================
// CONSTANTS
// ============================================
const MAX_WRONG_GUESSES = 6;
const CONFETTI_COUNT = 30;
const CONFETTI_DURATION_MIN = 1000;
const CONFETTI_DURATION_MAX = 3000;
const HINT_TOAST_DURATION = 1000;
const GAME_START_DELAY = 500;

const CONFETTI_COLORS = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
    '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
];

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const CONSONANTS = [
    'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
    'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
];

// Game data - words organized by category
const wordCategories = {
    animals: [
        "CAT", "DOG", "COW", "PIG", "BAT", "ANT", "BEE", "OWL", "FOX", "CHICKEN",
        "LION", "TIGER", "HORSE", "MOUSE", "SHEEP", "GOAT", "BEAR", "WOLF", "FROG", "DUCK",
        "RABBIT", "SNAKE", "FISH", "LIZARD", "PANDA", "ZEBRA", "KANGAROO", "PIGEON", "PENGUIN", "TURTLE"
    ],
    colors: [
        "RED", "BLUE", "YELLOW",
        "GREEN", "ORANGE", "PURPLE",
        "WHITE", "BLACK", "GREY"
    ],
    numbers: [
        "ONE", "TWO", "TEN", "SIX", "FIVE", "FOUR", "NINE", "ZERO", "EIGHT", "THREE", "SEVEN",
        "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN", "TWENTY"
    ],
    fruits: [
        "APPLE", "PEAR", "KIWI", "MANGO", "GRAPE", "LEMON", "BANANA", "ORANGE", "PEACH", "MELON",
        "PLUM", "CHERRY", "PINEAPPLE", "PAPAYA", "GUAVA", "APRICOT", "FIG", "COCONUT", "LYCHEE", "WATERMELON"
    ],
    shapes: [
        "CIRCLE", "SQUARE", "STAR", "HEART", "OVAL", "ELLIPSE", "PENTAGON", "HEXAGON", "OCTAGON", "TRIANGLE", "DIAMOND", "CROSS", "ARC", "LINE", "RECTANGLE"
    ],
    countries: [
        "CANADA", "BRAZIL", "FRANCE", "JAPAN", "INDIA", "EGYPT", "SPAIN", "CHINA", "ITALY", "KENYA",
        "GERMANY", "AUSTRALIA", "MEXICO", "ARGENTINA", "RUSSIA", "TURKEY", "THAILAND", "NIGERIA", "NORWAY", "GREECE"
    ],
    sports: [
        "SOCCER", "BASKETBALL", "BASEBALL", "TENNIS", "GOLF", "CRICKET", "RUGBY", "HOCKEY", "SWIMMING", "CYCLING",
        "BOXING", "SKIING", "SKATEBOARDING", "SURFING", "VOLLEYBALL", "BADMINTON", "WRESTLING", "FENCING", "ROWING", "HANDBALL"
    ],
    body: [
        "HEAD", "EYES", "EARS", "NOSE", "MOUTH", "LIPS", "TOOTH", "TEETH",
        "TONGUE", "NECK", "SHOULDER", "ARMS", "ELBOW", "HANDS", "FINGERS", "THUMB", "CHEST",
        "BACK", "STOMACH", "HIP", "LEGS", "KNEE", "FOOT", "FEET", "TOES"
    ]
};

// ============================================
// GAME STATE
// ============================================
const gameState = {
    currentWord: "",
    guessedLetters: [],
    wrongGuesses: 0,
    gameActive: false,
    currentCategory: "",
    hintUsed: false
};

// ============================================
// DOM ELEMENTS (cached for performance)
// ============================================
const elements = {
    wordDisplay: document.getElementById('word-display'),
    categoryDisplay: document.getElementById('category-display'),
    keyboard: document.getElementById('keyboard'),
    gameStatus: document.getElementById('game-status'),
    newGameBtn: document.getElementById('new-game-btn'),
    hintBtn: document.getElementById('hint-btn'),
    winFace: document.getElementById('win-face'),
    loseFace: document.getElementById('lose-face'),
    subtitle: document.getElementById('subtitle')
};

// Hangman parts in reveal order
const HANGMAN_PART_ORDER = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
const hangmanParts = HANGMAN_PART_ORDER.map(id => document.getElementById(id));

// ============================================
// KEYBOARD CREATION
// ============================================

/**
 * Creates the virtual keyboard with vowels and consonants
 */
function createKeyboard() {
    elements.keyboard.innerHTML = '';

    // Create vowels row
    const vowelsRow = createKeyboardRow(VOWELS, 'mb-2');
    elements.keyboard.appendChild(vowelsRow);

    // Create consonants row
    const consonantsRow = createKeyboardRow(CONSONANTS, '');
    elements.keyboard.appendChild(consonantsRow);
}

/**
 * Creates a row of keyboard keys
 * @param {string[]} letters - Array of letters to create keys for
 * @param {string} extraClasses - Additional CSS classes
 * @returns {HTMLElement} - Container div with keys
 */
function createKeyboardRow(letters, extraClasses) {
    const row = document.createElement('div');
    row.className = `keyboard-row ${extraClasses}`.trim();

    letters.forEach(letter => {
        const key = createKeyboardKey(letter);
        row.appendChild(key);
    });

    return row;
}

/**
 * Creates a single keyboard key button
 * @param {string} letter - The letter for this key
 * @returns {HTMLElement} - Button element
 */
function createKeyboardKey(letter) {
    const key = document.createElement('button');
    key.textContent = letter;
    key.className = 'key';
    key.dataset.letter = letter;
    key.disabled = false;
    key.addEventListener('click', () => handleGuess(letter));
    return key;
}

// ============================================
// GAME LOGIC
// ============================================

/**
 * Starts a new game with the specified category
 * @param {string} category - The word category to use
 */
function startNewGame(category) {
    // Validate category
    if (!wordCategories[category]) {
        console.error(`Invalid category: ${category}. Defaulting to 'animals'.`);
        category = 'animals';
    }

    // Reset game state
    gameState.guessedLetters = [];
    gameState.wrongGuesses = 0;
    gameState.gameActive = true;
    gameState.currentCategory = category;
    gameState.hintUsed = false;

    // Select a random word from the category
    const words = wordCategories[category];
    gameState.currentWord = words[Math.floor(Math.random() * words.length)];

    // Update UI
    updateWordDisplay();
    updateKeyboard();
    resetHangman();
    updateGameStatus();

    // Show category with word count
    elements.categoryDisplay.textContent = `Category: ${capitalize(category)} (${words.length} words)`;

    // Reset hint button
    elements.hintBtn.disabled = false;

    // Show message
    setGameStatus("Guess the word!", "status--purple");
}

/**
 * Updates the word display showing guessed and hidden letters
 */
function updateWordDisplay() {
    elements.wordDisplay.innerHTML = '';
    let allLettersFound = true;

    for (const letter of gameState.currentWord) {
        const letterBox = createLetterBox(letter, gameState.guessedLetters.includes(letter));
        elements.wordDisplay.appendChild(letterBox);

        if (!gameState.guessedLetters.includes(letter)) {
            allLettersFound = false;
        }
    }

    // Check if player won (only if game is still active)
    if (allLettersFound && gameState.gameActive) {
        endGame(true);
    }
}

/**
 * Creates a letter box element
 * @param {string} letter - The letter to display
 * @param {boolean} isGuessed - Whether the letter has been guessed
 * @returns {HTMLElement} - Div element for the letter
 */
function createLetterBox(letter, isGuessed) {
    const letterBox = document.createElement('div');

    if (isGuessed) {
        letterBox.textContent = letter;
        letterBox.className = 'letter letter--found';
    } else {
        letterBox.className = 'letter letter--hidden';
        letterBox.textContent = '_';
    }

    return letterBox;
}

/**
 * Updates keyboard key styles based on guess status
 */
function updateKeyboard() {
    const keys = elements.keyboard.querySelectorAll('.key');
    keys.forEach(key => {
        const letter = key.dataset.letter;
        const keyClass = getKeyClass(letter);
        key.className = keyClass;
        key.disabled = gameState.guessedLetters.includes(letter);
    });
}

/**
 * Gets the appropriate CSS class for a keyboard key
 * @param {string} letter - The letter to check
 * @returns {string} - CSS class string
 */
function getKeyClass(letter) {
    if (!gameState.guessedLetters.includes(letter)) {
        return 'key';
    }

    if (gameState.currentWord.includes(letter)) {
        return 'key key--correct';
    }

    return 'key key--wrong';
}

/**
 * Handles a letter guess from the user
 * @param {string} letter - The guessed letter
 */
function handleGuess(letter) {
    if (!gameState.gameActive || gameState.guessedLetters.includes(letter)) {
        return;
    }

    gameState.guessedLetters.push(letter);

    if (!gameState.currentWord.includes(letter)) {
        gameState.wrongGuesses++;
        updateHangman();
    }

    updateWordDisplay();
    updateKeyboard();
    updateGameStatus();

    // Check if player lost
    if (gameState.wrongGuesses >= MAX_WRONG_GUESSES) {
        endGame(false);
    }
}

/**
 * Reveals the next hangman body part based on wrong guesses
 */
function updateHangman() {
    const partIndex = gameState.wrongGuesses - 1;
    if (partIndex >= 0 && partIndex < hangmanParts.length && hangmanParts[partIndex]) {
        hangmanParts[partIndex].classList.add('show');
    }
}

/**
 * Resets the hangman drawing to initial state
 */
function resetHangman() {
    hangmanParts.forEach(part => part?.classList.remove('show'));
    elements.winFace?.classList.add('hidden');
    elements.loseFace?.classList.add('hidden');
}

/**
 * Updates the game status message
 */
function updateGameStatus() {
    if (!gameState.gameActive) return;

    const remainingGuesses = MAX_WRONG_GUESSES - gameState.wrongGuesses;
    if (remainingGuesses > 0) {
        setGameStatus(`Wrong guesses left: ${remainingGuesses}`, "status--purple");
    }
}

/**
 * Sets the game status message with styling
 * @param {string} message - The status message
 * @param {string} colorClass - Status color class
 */
function setGameStatus(message, colorClass) {
    elements.gameStatus.textContent = message;
    elements.gameStatus.className = `game-status ${colorClass}`;
}

/**
 * Ends the game with win or loss state
 * @param {boolean} win - Whether the player won
 */
function endGame(win) {
    gameState.gameActive = false;

    if (win) {
        handleWin();
    } else {
        handleLoss();
    }
}

/**
 * Handles win state - shows celebration
 */
function handleWin() {
    setGameStatus("You won! Great job!", "status--win bounce");
    elements.winFace?.classList.remove('hidden');

    // Confetti celebration
    for (let i = 0; i < CONFETTI_COUNT; i++) {
        setTimeout(createConfetti, i * 100);
    }
}

/**
 * Handles loss state - reveals word
 */
function handleLoss() {
    setGameStatus(`Game over! The word was: ${gameState.currentWord}`, "status--lose");
    elements.loseFace?.classList.remove('hidden');

    // Reveal all letters
    revealRemainingLetters();
    updateWordDisplay();
}

/**
 * Reveals all unguessed letters in the word
 */
function revealRemainingLetters() {
    for (const letter of gameState.currentWord) {
        if (!gameState.guessedLetters.includes(letter)) {
            gameState.guessedLetters.push(letter);
        }
    }
}

/**
 * Creates a falling confetti particle
 */
function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti fade-in';
    confetti.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animation = `fall ${CONFETTI_DURATION_MIN + Math.random() * (CONFETTI_DURATION_MAX - CONFETTI_DURATION_MIN)}ms cubic-bezier(0.1, 0.8, 0.3, 1) forwards`;

    document.body.appendChild(confetti);

    // Clean up after animation
    setTimeout(() => confetti.remove(), CONFETTI_DURATION_MAX);
}

/**
 * Provides a hint by revealing a random unguessed letter
 */
function giveHint() {
    if (!gameState.gameActive || gameState.hintUsed) {
        return;
    }

    const unguessedLetters = getUnguessedLetters();

    if (unguessedLetters.length > 0) {
        const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
        gameState.guessedLetters.push(hintLetter);
        gameState.hintUsed = true;

        updateWordDisplay();
        updateKeyboard();
        showHintToast(hintLetter);

        // Disable hint button after use
        elements.hintBtn.disabled = true;
    }
}

/**
 * Gets all unique letters in the word that haven't been guessed
 * @returns {string[]} - Array of unguessed letters
 */
function getUnguessedLetters() {
    const unguessedLetters = [];
    for (const letter of gameState.currentWord) {
        if (!gameState.guessedLetters.includes(letter) && !unguessedLetters.includes(letter)) {
            unguessedLetters.push(letter);
        }
    }
    return unguessedLetters;
}

/**
 * Shows a toast notification with the hint letter
 * @param {string} letter - The hinted letter
 */
function showHintToast(letter) {
    const toast = document.createElement('div');
    toast.className = 'hint-toast fade-in';
    toast.textContent = `Hint: ${letter}`;
    toast.style.top = '50%';
    toast.style.left = '50%';
    toast.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -100%)';
        setTimeout(() => toast.remove(), 500);
    }, HINT_TOAST_DURATION);
}

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// EVENT LISTENERS
// ============================================

elements.newGameBtn.addEventListener('click', () => {
    const category = gameState.currentCategory || 'animals';
    startNewGame(category);
});

elements.hintBtn.addEventListener('click', giveHint);

// Category buttons
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        startNewGame(button.dataset.category);
    });
});

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initializes the game UI and starts the first game
 */
function initGame() {
    createKeyboard();
    updateSubtitle();
    updateCategoryLabels();

    // Start with animals by default
    setTimeout(() => {
        startNewGame('animals');
    }, GAME_START_DELAY);
}

/**
 * Updates the subtitle with total word count
 */
function updateSubtitle() {
    const totalWords = Object.values(wordCategories).reduce((sum, arr) => sum + arr.length, 0);
    elements.subtitle.textContent = `Learn ${totalWords} English words while having fun!`;
}

/**
 * Updates category button labels with word counts
 */
function updateCategoryLabels() {
    document.querySelectorAll('.category-label').forEach(label => {
        const category = label.getAttribute('data-label');
        if (wordCategories[category]) {
            const count = wordCategories[category].length;
            label.textContent = `${capitalize(category)} (${count})`;
        }
    });
}

// Start the game
initGame();

