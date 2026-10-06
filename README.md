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
- Highest score saved with `localStorage`
- Responsive design for desktop and mobile
- Clean dark / black-and-white theme

## Technologies Used

- HTML
- CSS
- Vanilla JavaScript (no frameworks, no libraries)
- `localStorage` for high score

## How to Run the Project

No build step, no server needed.

1. Download or clone this repository.
2. Open the `typing-game` folder.
3. Double-click `index.html` to open it in any modern browser (Chrome, Edge, Firefox).

Or with Git:

```bash
git clone <your-repo-url>
cd typing-game
# then open index.html in your browser
```

To play:

1. Click **Start Game**.
2. Type the shown word and press **Space** to submit.
3. Keep typing until the 60-second timer reaches zero.
4. Check your score, WPM, and accuracy on the Game Over screen.
5. Click **Restart Game** to play again.

## Project Structure

```text
typing-game/
├── index.html   # Page structure: start, game, and result screens
├── style.css    # Dark theme, layout, animations, responsive design
├── script.js    # Game logic: timer, scoring, WPM, accuracy, high score
└── README.md    # Project documentation
```

## Future Improvements

- Multiple difficulty levels (easy / medium / hard)
- Different game modes (time attack, endless, sentences)
- Leaderboard
- Sound effects
- Typing challenges (code snippets, quotes)
- GitHub Pages deployment
- Online multiplayer
