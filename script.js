// =============================================
// TYPING GAME — Vanilla JavaScript (upgraded)
// Username + persistent stats + local leaderboard
// Gameplay preserved: 60s, score, WPM, accuracy
// =============================================

// ---- 1. WORD LIST ----
// Same gameplay as before. A few capitalized words are included
// on purpose so case-insensitive typing can be verified
// (typing "hello" for "Hello" counts as correct).
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
  "design", "modern", "typing", "accuracy", "second", "minute",
  "Hello", "World", "JavaScript", "Typing", "Focus", "Speed",
  "Winner", "Future", "Challenge", "Create", "Code", "Game"
];

// ---- 2. GET DOM ELEMENTS ----
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
const finalBestWpm = document.getElementById("final-best-wpm");
const newBestMsg = document.getElementById("new-best");
const newBestWpmMsg = document.getElementById("new-best-wpm");

// Username / stats / leaderboard elements
const usernameModal = document.getElementById("username-modal");
const usernameTitle = document.getElementById("username-title");
const usernameInput = document.getElementById("username-input");
const usernameSaveBtn = document.getElementById("username-save-btn");
const usernameError = document.getElementById("username-error");
const currentUsernameEl = document.getElementById("current-username");
const changeUsernameBtn = document.getElementById("change-username-btn");
const resetDataBtn = document.getElementById("reset-data-btn");

const myUsernameEl = document.getElementById("my-username");
const myBestScoreEl = document.getElementById("my-best-score");
const myBestWpmEl = document.getElementById("my-best-wpm");
const myBestAccuracyEl = document.getElementById("my-best-accuracy");
const myGamesEl = document.getElementById("my-games");
const myCorrectEl = document.getElementById("my-correct");
const myWrongEl = document.getElementById("my-wrong");

const leaderboardList = document.getElementById("leaderboard-list");
const leaderboardEmpty = document.getElementById("leaderboard-empty");

// ---- 3. STORAGE (localStorage only, no backend) ----
// Only these keys belong to this game. Reset deletes just these.
const LS_USERNAME = "typingGame.username";
const LS_BOARD = "typingGame.leaderboard";
const LS_LEGACY_SCORE = "typingGameHighScore"; // v1 key, kept for migration

function loadUsername() {
  return (localStorage.getItem(LS_USERNAME) || "").trim();
}

function saveUsername(name) {
  localStorage.setItem(LS_USERNAME, name);
}

function loadBoard() {
  try {
    const raw = localStorage.getItem(LS_BOARD);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBoard(board) {
  localStorage.setItem(LS_BOARD, JSON.stringify(board));
}

// Find a player entry without creating duplicates (case-insensitive).
function findPlayer(board, username) {
  const key = username.toLowerCase();
  return board.find((p) => (p.username || "").toLowerCase() === key) || null;
}

function ensurePlayer(board, username) {
  let player = findPlayer(board, username);
  if (!player) {
    player = {
      username: username,
      bestScore: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      gamesPlayed: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalCorrectChars: 0,
      totalWrongChars: 0
    };
    board.push(player);
  }
  return player;
}

// ---- 4. GAME STATE ----
// Scoring/WPM/accuracy formulas are unchanged from v1.
let currentWord = "";
let score = 0;
let timeLeft = 60;
let timer = null;
let isPlaying = false;

let correctCount = 0;
let incorrectCount = 0;
let totalTyped = 0;
let correctChars = 0;
let wrongChars = 0; // wrong characters this game (for persistent totals)

let currentUsername = loadUsername();
let board = loadBoard();

// Migrate v1 best score so refresh never loses it.
(function migrateLegacyScore() {
  const legacy = Number(localStorage.getItem(LS_LEGACY_SCORE) || 0);
  if (legacy > 0 && currentUsername) {
    const player = ensurePlayer(board, currentUsername);
    if (player.bestScore < legacy) player.bestScore = legacy;
    saveBoard(board);
  }
})();

// ---- 5. USERNAME SYSTEM ----

function isModalOpen() {
  return !usernameModal.classList.contains("hidden");
}

function openUsernameModal(mode) {
  usernameTitle.textContent =
    mode === "change" ? "Change username" : "Choose your username";
  usernameInput.value = currentUsername || "";
  usernameError.classList.add("hidden");
  usernameModal.classList.remove("hidden");
  setTimeout(() => usernameInput.focus(), 50);
}

function closeUsernameModal() {
  usernameModal.classList.add("hidden");
}

function validUsername(name) {
  return /^[A-Za-z0-9 _-]{1,15}$/.test(name);
}

function handleSaveUsername() {
  const name = usernameInput.value.trim().replace(/\s+/g, " ");
  if (!validUsername(name)) {
    usernameError.classList.remove("hidden");
    usernameInput.focus();
    return;
  }
  currentUsername = name;
  saveUsername(currentUsername);
  ensurePlayer(board, currentUsername);
  saveBoard(board);
  closeUsernameModal();
  renderAll();
  inputField.focus();
}

// ---- 6. RENDER (header, My Stats, leaderboard) ----

function getCurrentPlayer() {
  if (!currentUsername) return null;
  return findPlayer(board, currentUsername);
}

function renderHeader() {
  currentUsernameEl.textContent = currentUsername || "Guest";
  const player = getCurrentPlayer();
  const best = player ? player.bestScore : 0;
  highScoreEl.textContent = best;
}

function renderMyStats() {
  const player = getCurrentPlayer();
  myUsernameEl.textContent = currentUsername || "—";
  myBestScoreEl.textContent = player ? player.bestScore : 0;
  myBestWpmEl.textContent = player ? player.bestWpm : 0;
  myBestAccuracyEl.textContent = (player ? player.bestAccuracy : 0) + "%";
  myGamesEl.textContent = player ? player.gamesPlayed : 0;
  myCorrectEl.textContent = player ? player.totalCorrect : 0;
  myWrongEl.textContent = player ? player.totalWrong : 0;
}

function renderLeaderboard() {
  leaderboardList.innerHTML = "";
  const sorted = [...board]
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 10);

  leaderboardEmpty.style.display = sorted.length === 0 ? "block" : "none";

  sorted.forEach((player, index) => {
    const li = document.createElement("li");
    if (
      currentUsername &&
      player.username.toLowerCase() === currentUsername.toLowerCase()
    ) {
      li.classList.add("current");
    }

    const rank = document.createElement("span");
    rank.className = "rank";
    rank.textContent = (index + 1) + ".";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = player.username;

    const scoreWrap = document.createElement("span");
    scoreWrap.className = "lb-score";
    scoreWrap.textContent = "Score ";
    const scoreStrong = document.createElement("strong");
    scoreStrong.textContent = player.bestScore;
    scoreWrap.appendChild(scoreStrong);

    const wpmWrap = document.createElement("span");
    wpmWrap.className = "lb-wpm";
    wpmWrap.textContent = "WPM ";
    const wpmStrong = document.createElement("strong");
    wpmStrong.textContent = player.bestWpm;
    wpmWrap.appendChild(wpmStrong);

    li.appendChild(rank);
    li.appendChild(name);
    li.appendChild(scoreWrap);
    li.appendChild(wpmWrap);
    leaderboardList.appendChild(li);
  });
}

function renderAll() {
  renderHeader();
  renderMyStats();
  renderLeaderboard();
}

// ---- 7. GAME HELPERS (preserved) ----

function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

function showNewWord() {
  currentWord = getRandomWord();
  wordDisplay.textContent = currentWord;
  wordDisplay.style.animation = "none";
  void wordDisplay.offsetWidth;
  wordDisplay.style.animation = "";
}

// Same live stats formulas as v1.
function updateStats() {
  scoreEl.textContent = score;
  correctEl.textContent = correctCount;
  incorrectEl.textContent = incorrectCount;

  const accuracy =
    totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);
  accuracyEl.textContent = accuracy + "%";

  const elapsedSeconds = 60 - timeLeft;
  if (elapsedSeconds > 0) {
    const minutes = elapsedSeconds / 60;
    wpmEl.textContent = Math.round(correctChars / 5 / minutes);
  } else {
    wpmEl.textContent = 0;
  }
}

// ---- 8. START / END GAME (gameplay preserved) ----

function startGame() {
  // Require a username before playing (but only ask once via localStorage).
  if (!currentUsername) {
    openUsernameModal("new");
    return;
  }

  score = 0;
  timeLeft = 60;
  correctCount = 0;
  incorrectCount = 0;
  totalTyped = 0;
  correctChars = 0;
  wrongChars = 0;
  isPlaying = true;

  timeEl.textContent = timeLeft;
  timeEl.classList.remove("danger");
  inputField.value = "";
  inputField.disabled = false;
  inputField.className = "input-field";

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  showNewWord();
  updateStats();
  inputField.focus();

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 10) timeEl.classList.add("danger");
    updateStats();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  isPlaying = false;
  clearInterval(timer);
  inputField.disabled = true;

  // Same final calculations as v1 (full game = 1 minute).
  const finalWpmValue = Math.round(correctChars / 5);
  const accuracy =
    totalTyped === 0 ? 0 : Math.round((correctCount / totalTyped) * 100);

  // Save/update persistent stats + leaderboard (one entry per username).
  let prevBest = 0;
  let prevBestWpm = 0;
  if (currentUsername) {
    const player = ensurePlayer(board, currentUsername);
    prevBest = player.bestScore;
    prevBestWpm = player.bestWpm;

    player.username = currentUsername; // keep latest casing
    player.gamesPlayed += 1;
    player.totalCorrect += correctCount;
    player.totalWrong += incorrectCount;
    player.totalCorrectChars += correctChars;
    player.totalWrongChars += wrongChars;
    if (score > player.bestScore) player.bestScore = score;
    if (finalWpmValue > player.bestWpm) player.bestWpm = finalWpmValue;
    if (accuracy > player.bestAccuracy) player.bestAccuracy = accuracy;

    saveBoard(board);
    // Keep legacy key in sync so the old best score is never lost.
    localStorage.setItem(LS_LEGACY_SCORE, String(player.bestScore));
  }

  const isNewBest = score > prevBest && score > 0;
  const isNewBestWpm = finalWpmValue > prevBestWpm && finalWpmValue > 0;

  finalScore.textContent = score;
  finalWpm.textContent = finalWpmValue;
  finalAccuracy.textContent = accuracy + "%";
  finalCorrect.textContent = correctCount;
  finalWrong.textContent = incorrectCount;
  finalBest.textContent = prevBest > score ? prevBest : score;
  finalBestWpm.textContent = Math.max(prevBestWpm, finalWpmValue);

  newBestMsg.classList.toggle("hidden", !isNewBest);
  newBestWpmMsg.classList.toggle("hidden", !isNewBestWpm);

  renderAll();

  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
}

// ---- 9. TYPING CHECK — CASE-INSENSITIVE ----
// "Hello" == "hello" == "HELLO". Spaces, numbers and
// punctuation must still match exactly (only case is ignored).
inputField.addEventListener("input", () => {
  if (!isPlaying) return;

  const typed = inputField.value;

  if (typed === "") {
    inputField.classList.remove("good", "bad");
  } else if (
    currentWord.toLowerCase().startsWith(typed.trim().toLowerCase())
  ) {
    inputField.classList.add("good");
    inputField.classList.remove("bad");
  } else {
    inputField.classList.add("bad");
    inputField.classList.remove("good");
  }

  if (typed.includes(" ")) {
    const submittedWord = typed.trim();
    totalTyped++;

    if (submittedWord.toLowerCase() === currentWord.toLowerCase()) {
      score++;
      correctCount++;
      correctChars += currentWord.length + 1; // +1 for the space
      inputField.classList.remove("flash-bad");
      inputField.classList.add("flash-good");
    } else {
      incorrectCount++;
      wrongChars += submittedWord.length + 1;
      inputField.classList.remove("flash-good");
      inputField.classList.add("flash-bad");
    }

    inputField.value = "";
    inputField.classList.remove("good", "bad");
    showNewWord();
    updateStats();

    setTimeout(() => {
      inputField.classList.remove("flash-good", "flash-bad");
    }, 300);
  }
});

// ---- 10. RESET MY DATA (only this game's keys) ----

function handleResetData() {
  if (isPlaying) return; // avoid wiping stats mid-game
  const ok = confirm(
    "Reset your typing game data on this device?\n\nThis clears your username, stats and local leaderboard."
  );
  if (!ok) return;

  localStorage.removeItem(LS_USERNAME);
  localStorage.removeItem(LS_BOARD);
  localStorage.removeItem(LS_LEGACY_SCORE);

  currentUsername = "";
  board = [];
  score = 0;
  timeLeft = 60;
  correctCount = 0;
  incorrectCount = 0;
  totalTyped = 0;
  correctChars = 0;
  wrongChars = 0;

  timeEl.textContent = "60";
  timeEl.classList.remove("danger");
  updateStats();
  gameScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  renderAll();
  openUsernameModal("new");
}

// ---- 11. EVENTS + INIT ----

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
usernameSaveBtn.addEventListener("click", handleSaveUsername);
changeUsernameBtn.addEventListener("click", () => {
  if (isPlaying) return;
  openUsernameModal("change");
});
resetDataBtn.addEventListener("click", handleResetData);

usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSaveUsername();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !isPlaying && !isModalOpen()) {
    startGame();
  }
});

// Close modal by clicking outside it (only if a username already exists).
usernameModal.addEventListener("click", (e) => {
  if (e.target === usernameModal && currentUsername) closeUsernameModal();
});

// First load: render saved data, ask for username only for new players.
renderAll();
if (!currentUsername) {
  openUsernameModal("new");
}
