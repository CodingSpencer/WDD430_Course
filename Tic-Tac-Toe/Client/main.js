// Define variables
let board = Array(9).fill('');
let currentPlayer = 'X';
let isGameActive = true;

// DOM References
const boardElement = document.getElementById('board');
const resetButton = document.getElementById('reset');
const saveButton = document.getElementById('save');
const resultsElement = document.getElementById('results');
const historyListElement = document.querySelector('.history-list');
const clearHistoryButton = document.getElementById('clear-history');

// Server endpoint
const API_URL = 'http://localhost:3000';

// Winning combinations
const winCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Save handler
function saveGame() {
    const boardState = board.map((cell) => cell || '_').join('');
    fetch(`${API_URL}/boards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boardState }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            renderHistory();
        })
        .catch((error) => {
            console.error(error);
        });
}

// Function to reset the game
function resetGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    isGameActive = true;
    boardElement.classList.remove('game-over');
    resultsElement.innerHTML = '';
    renderBoard();
}

// Build markup for a single cell
function cellTemplate(item, index) {
    return `<button class="cell" data-index="${index}">${item}</button>`;
}

// Build markup for a whole board. Pass container = true to wrap in <section class="board">
function boardTemplate(savedBoard, container = false) {
    const cells = savedBoard.map(cellTemplate).join('');
    return container ? `<section class="board">${cells}</section>` : cells;
}

// Function to render the board
function renderBoard() {
    boardElement.innerHTML = boardTemplate(board);
}

// Board click event listener
boardElement.addEventListener('click', (event) => {
    const target = event.target;

    if (!target.classList.contains('cell') || !isGameActive) return;

    const cellIndex = Number(target.dataset.index);

    if (board[cellIndex] !== '') return;

    board[cellIndex] = currentPlayer;
    renderBoard();

    if (checkWin()) {
        resultsElement.innerHTML = `${currentPlayer} wins!`;
        isGameActive = false;
    } else if (checkDraw()) {
        resultsElement.innerHTML = 'Draw!';
        isGameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
});

// Game checks
function checkWin() {
    return winCombinations.some((combination) => {
        return combination.every((index) => board[index] === currentPlayer);
    });
}

function checkDraw() {
    return board.every((cell) => cell);
}

// Render the saved games returned by the server
async function renderHistory() {
    try {
        const res = await fetch(`${API_URL}/boards`);
        if (!res.ok) return;
        const data = await res.json();
        // Each saved game is { boardState: "XO__X___O" }; convert it back to a 9-item array
        const html = data
            .map((game) => game.boardState.split('').map((c) => (c === '_' ? '' : c)))
            .map((savedBoard) => boardTemplate(savedBoard, true))
            .join('');
        historyListElement.innerHTML = html;
    } catch (error) {
        console.error(error);
    }
}

// Clear all saved games and refresh the history display
async function clearHistory() {
    try {
        const res = await fetch(`${API_URL}/boards`, { method: 'DELETE' });
        if (res.ok) renderHistory();
    } catch (error) {
        console.error(error);
    }
}

// Save button event listener
saveButton.addEventListener('click', saveGame);
resetButton.addEventListener('click', resetGame);
clearHistoryButton.addEventListener('click', clearHistory);

renderBoard();
renderHistory();