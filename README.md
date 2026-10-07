# Typing Game

A fun, beginner-friendly browser typing game. Type the words shown on the screen as quickly and accurately as possible in 60 seconds.

## Features

- Start Game button
- One word displayed at a time
- Text input area with live green/red feedback
- 60-second countdown timer (red warning at 10s)
- Score counter
- Live Words-Per-Minute (WPM) calculation
- Live accuracy percentage
- Correct and incorrect word tracking
- Game Over result screen with final stats
- Restart Game button (or press Enter)
- Responsive design for desktop and mobile
- Clean dark / black-and-white theme
- Username system (asked once, saved locally)
- Persistent player statistics (survive refresh / browser restart)
- Local Top 10 leaderboard (sorted by best score)
- My Stats / Player Stats section
- Case-insensitive typing (`Hello` = `hello`)
- Reset My Data option (with confirmation)

## Technologies Used

- HTML
- CSS
- Vanilla JavaScript (no frameworks, no libraries)
- `localStorage` for persistence (no backend, no database)

## Username System

- On first visit, a modal asks for a username (1–15 characters: letters, numbers, space, `_`, `-`).
- The username is saved in `localStorage` (`typingGame.username`).
- It is NOT asked again on refresh.
- The current username is shown in the header and in My Stats.
- Use **Change Username** to switch players. Stats and leaderboard update to the selected player.

## Persistent Player Statistics

Saved in `localStorage` (`typingGame.leaderboard`) per username:

- username
- best score
- best WPM
- best accuracy
- games played
- total correct (words)
- total wrong (words)
- total correct characters
- total wrong characters

Data remains after refreshing, closing, and reopening the browser. The old v1 key (`typingGameHighScore`) is migrated automatically so the best score is never lost.

## Local Leaderboard

- Shows the Top 10 players, sorted by best score (highest first).
- Each entry shows: rank, username, best score, best WPM.
- Same username (case-insensitive) UPDATES its existing entry — no duplicates.
- A lower new score keeps the previous best; a higher new WPM updates best WPM.
- Stored in `localStorage`, so it is **local to the user's browser/device and is NOT an online global leaderboard**.

## Case-Insensitive Typing

Typing ignores letter case:

- Target `Hello` + typed `hello` = CORRECT
- `HELLO`, `HeLlO` are also correct
- Spaces, numbers, and punctuation still matter: target `hello!` + typed `hello` = INCORRECT (missing `!`)

## How the Game Works

1. Enter a username when asked (first visit only).
2. Click **Start Game**.
3. A word appears. Type it and press **Space** to submit.
4. Scoring (unchanged from v1):
   - Score = number of correct words
   - WPM = `(correct characters / 5) / minutes`
   - Accuracy = `correct / total typed × 100`
5. After 60 seconds the Game Over screen shows: score, WPM, accuracy, correct, wrong, best score, best WPM — plus "New Best" badges when earned.
6. Every finished game updates your stats and the leaderboard automatically.

## How to Run It Locally

No build step, no server needed.

1. Open the `typing-game` folder.
2. Double-click `index.html` in any modern browser (Chrome, Edge, Firefox).

```text
typing-game/
├── index.html   # Start/game/result screens + modal + stats + leaderboard
├── style.css    # Dark theme, modal, panels, leaderboard, responsive
├── script.js    # Timer, scoring, username, persistence, leaderboard
└── README.md    # Documentation
```

## Reset My Data

Click **Reset My Data** → confirm → only this game's keys are deleted:

- `typingGame.username`
- `typingGame.leaderboard`
- `typingGameHighScore`

No other websites' data is touched. After reset, the game asks for a username again like a first-time visit.

## Future Improvements

- Multiple difficulty levels (easy / medium / hard)
- Different game modes (time attack, endless, sentences)
- Sound effects
- Typing challenges (code snippets, quotes)
- GitHub Pages deployment
- Online multiplayer (would need a backend)
