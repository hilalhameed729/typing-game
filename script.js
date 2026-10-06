// =============================================
// TYPING GAME — Vanilla JavaScript
// Beginner-friendly, commented version
// =============================================

// ---- 1. WORD LIST ----
// Pool of words shown one at a time.
// Keep them short and common for beginners.
const words = [
  "time", "code", "fast", "game", "type", "word", "speed", "focus",
  "keyboard", "practice", "learn", "build", "fun", "quick", "brain",
  "light", "dark", "power", "skill", "level", "mouse", "screen",
  "house", "water", "happy", "music", "dream", "cloud", "green",
  "black", "white", "night", "day", "sun", "star", "river",
  "apple", "table", "chair", "phone", "laptop", "plane", "train",
  "tiger", "zebra", "ocean", "mountain", "forest", "simple",
  "clean", "sharp", "brave", "calm", "smart", "strong", "great",
  "hello", "world", "javascript", "html", "style", "button",
  "score", "timer", "player", "winner", "future", "create",
  "design", "modern", "typing", "accuracy", "second", "minute"
];

// ---- 2. GET DOM ELEMENTS ----
// We grab everything we need from index.html once, at the top.
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const wordDisplay = document.getElementById("word-display");
const inputField = document.getElementById("input-field");

const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const correctEl = document.getElementById("correct-count");
const incorrectEl = document.getElementById("incorrect-count");
const highScoreEl = document.getElementById("high-score");

const finalScore = document.getElementById("final-score");
const finalWpm = document.getElementById("final-wpm");
const finalAccuracy = document.getElementById("final-accuracy");
const finalCorrect = document.getElementById("final-correct");
const finalWrong = document.getElementById("final-wrong");
const finalBest = document.getElementById("final-best");
const newBestMsg = document.getElementById("new-best");

// ---- 3. GAME STATE VARIABLES ----
// These keep track of the current game.
let currentWord = "";
let score = 0;
let timeLeft = 60;
let timer = null;          // setInterval reference
let isPlaying = false;

let correctCount = 0;      // correct words
let incorrectCount = 0;    // wrong words
let totalTyped = 0;        // correct + wrong (for accuracy)
let correctChars = 0;      // correct characters (for WPM)
let startTime = null;

// ---- 4. HIGH SCORE (localStorage) ----
// localStorage keeps data even after closing the browser.
let highScore = localStorage.getItem("typingGameHighScore") || 0;
highScore = Number(highScore);
highScoreEl.textContent = highScore;

// ---- 5. HELPER FUNCTIONS ----

// Pick a random word from the list
function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

// Show a new word on screen with a small pop animation
function showNewWord() {
  currentWord = getRandomWord();
  wordDisplay.textContent = currentWord;
  // Restart the pop animation each time
  wordDisplay.style.animation = "none";
  void wordDisplay.offsetWidth; // trick to restart CSS animation
  wordDisplay.style.animation = "";
}

// Update score, WPM, accuracy on screen (called live)
function updateStats() {
  scoreEl.textContent = score;
  correctEl.textContent = correctCount;
  incorrectEl.textContent = incorrectCount;

  // Accuracy = correct / total * 100
  const accuracy =
    totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);
  accuracyEl.textContent = accuracy + "%";

  // Live WPM (standard formula: chars / 5 = "words", divided by minutes)
  const elapsedSeconds = 60 - timeLeft;
  if (elapsedSeconds > 0) {
    const minutes = elapsedSeconds / 60;
    const wpm = Math.round(correctChars / 5 / minutes);
    wpmEl.textContent = wpm;
  } else {
    wpmEl.textContent = 0;
  }
}

// ---- 6. START GAME ----
function startGame() {
  // Reset everything
  score = 0;
  timeLeft = 60;
  correctCount = 0;
  incorrectCount = 0;
  totalTyped = 0;
  correctChars = 0;
  isPlaying = true;
  startTime = Date.now();

  // Reset UI
  timeEl.textContent = timeLeft;
  timeEl.classList.remove("danger");
  inputField.value = "";
  inputField.disabled = false;
  inputField.className = "input-field"; // clear feedback colors

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  showNewWord();
  updateStats();
  inputField.focus(); // put cursor in typing box

  // Clear old timer if any, then start 60-second countdown
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    // Red warning when 10 seconds or less remain
    if (timeLeft <= 10) {
      timeEl.classList.add("danger");
    }

    updateStats();

    // Time is up -> end the game
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ---- 7. END GAME ----
function endGame() {
  isPlaying = false;
  clearInterval(timer);
  inputField.disabled = true;

  // Final WPM: full game = 1 minute, so WPM = correctChars / 5
  const finalWpmValue = Math.round(correctChars / 5);
  const accuracy =
    totalTyped === 0 ? 0 : Math.round((correctCount / totalTyped) * 100);

  // Check for new best score and save it
  const isNewBest = score > highScore;
  if (isNewBest) {
    highScore = score;
    localStorage.setItem("typingGameHighScore", highScore);
  }

  // Fill result screen
  finalScore.textContent = score;
  finalWpm.textContent = finalWpmValue;
  finalAccuracy.textContent = accuracy + "%";
  finalCorrect.textContent = correctCount;
  finalWrong.textContent = incorrectCount;
  finalBest.textContent = highScore;
  highScoreEl.textContent = highScore;

  // Show / hide "New Best" message
  if (isNewBest && score > 0) {
    newBestMsg.classList.remove("hidden");
  } else {
    newBestMsg.classList.add("hidden");
  }

  // Switch screens
  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
}

// ---- 8. CHECK TYPED WORD ----
// Runs on every keystroke inside the input box.
inputField.addEventListener("input", () => {
  if (!isPlaying) return;

  const typed = inputField.value;

  // --- Live feedback (before pressing Space) ---
  // Green border if what you typed so far matches the start of the word.
  if (typed === "") {
    inputField.classList.remove("good", "bad");
  } else if (currentWord.startsWith(typed.trim())) {
    inputField.classList.add("good");
    inputField.classList.remove("bad");
  } else {
    inputField.classList.add("bad");
    inputField.classList.remove("good");
  }

  // --- Submit check: user pressed Space ---
  // We check if input contains a space = word submitted.
  if (typed.includes(" ")) {
    const submittedWord = typed.trim(); // remove the space
    totalTyped++;

    if (submittedWord === currentWord) {
      // ✅ Correct
      score++;
      correctCount++;
      // +1 for the space character (standard WPM counts spaces too)
      correctChars += currentWord.length + 1;

      inputField.classList.remove("flash-bad");
      inputField.classList.add("flash-good");
    } else {
      // ❌ Wrong
      incorrectCount++;

      inputField.classList.remove("flash-good");
      inputField.classList.add("flash-bad");
    }

    // Clear box + show next word
    inputField.value = "";
    inputField.classList.remove("good", "bad");
    showNewWord();
    updateStats();

    // Remove flash animation after it plays (so it can replay next word)
    setTimeout(() => {
      inputField.classList.remove("flash-good", "flash-bad");
    }, 300);
  }
});

// ---- 9. BUTTON EVENTS ----
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

// Extra: allow pressing Enter on start/result screens to start
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !isPlaying) {
    startGame();
  }
});
