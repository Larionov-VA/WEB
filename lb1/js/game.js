const COLS = 10;
const ROWS = 20;
const CELL = 30;

const START_SPEED = 700;
const MIN_SPEED = 100;
const LINES_PER_LEVEL = 2;

const SHAPES = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
};

const COLORS = {
    I: '#00f0f0',
    J: '#0000f0',
    L: '#f0a000',
    O: '#f0f000',
    S: '#00f000',
    T: '#a000f0',
    Z: '#f00000'
};

const canvas = document.getElementById('playfield');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const playerElement = document.getElementById('playerName');

canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;

const url = new URLSearchParams(window.location.search);
const playerName = url.get('username') || 'Игрок';
playerElement.textContent = playerName;

let board = createBoard();
let currentType = randomType();
let nextType = randomType();
let currentMatrix = copyMatrix(SHAPES[currentType]);
let currentX = Math.floor((COLS - currentMatrix[0].length) / 2);
let currentY = 0;

let score = 0;
let lines = 0;
let level = 0;
let dropInterval = START_SPEED;
let lastDrop = 0;
let gameOver = false;
let gameOverSaved = false;

function createBoard() {
    const result = [];

    for (let y = 0; y < ROWS; y++) {
        result.push(new Array(COLS).fill(0));
    }

    return result;
}

function randomType() {
    const types = Object.keys(SHAPES);
    const index = Math.floor(Math.random() * types.length);
    return types[index];
}

function copyMatrix(matrix) {
    return matrix.map(row => row.slice());
}

function rotateMatrix(matrix) {
    const result = [];

    for (let x = 0; x < matrix[0].length; x++) {
        const row = [];

        for (let y = matrix.length - 1; y >= 0; y--) {
            row.push(matrix[y][x]);
        }

        result.push(row);
    }

    return result;
}

function isCollision(matrix, x, y) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] === 0) {
                continue;
            }

            const boardX = x + col;
            const boardY = y + row;

            if (boardX < 0 || boardX >= COLS) {
                return true;
            }

            if (boardY >= ROWS) {
                return true;
            }

            if (boardY >= 0 && board[boardY][boardX] !== 0) {
                return true;
            }
        }
    }

    return false;
}

function spawnPiece() {
    currentType = nextType;
    nextType = randomType();
    currentMatrix = copyMatrix(SHAPES[currentType]);
    currentX = Math.floor((COLS - currentMatrix[0].length) / 2);
    currentY = 0;

    if (isCollision(currentMatrix, currentX, currentY)) {
        gameOver = true;
        saveScore();
    }
}

function move(dx, dy) {
    const newX = currentX + dx;
    const newY = currentY + dy;

    if (isCollision(currentMatrix, newX, newY)) {
        return false;
    }

    currentX = newX;
    currentY = newY;
    return true;
}

function rotatePiece() {
    const rotated = rotateMatrix(currentMatrix);

    if (!isCollision(rotated, currentX, currentY)) {
        currentMatrix = rotated;
    }
}

function lockPiece() {
    for (let row = 0; row < currentMatrix.length; row++) {
        for (let col = 0; col < currentMatrix[row].length; col++) {
            if (currentMatrix[row][col] === 0) {
                continue;
            }

            board[currentY + row][currentX + col] = COLORS[currentType];
        }
    }

    clearLines();
    spawnPiece();
}

function dropPiece() {
    if (!move(0, 1)) {
        lockPiece();
    }
}

function hardDrop() {
    while (move(0, 1)) {}
    lockPiece();
}

function clearLines() {
    let cleared = 0;

    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(new Array(COLS).fill(0));
            cleared++;
            row++;
        }
    }

    if (cleared === 0) {
        return;
    }

    lines += cleared;
    score += cleared * 100 * (level + 1);

    const newLevel = Math.floor(lines / LINES_PER_LEVEL);

    if (newLevel > level) {
        level = newLevel;
        dropInterval = Math.max(MIN_SPEED, START_SPEED - level * 100);
    }

    updateInfo();
}

function updateInfo() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
}

function drawCell(context, x, y, color, size = CELL) {
    context.fillStyle = color;
    context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#071229';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] !== 0) {
                drawCell(ctx, x, y, board[y][x]);
            }
        }
    }

    for (let row = 0; row < currentMatrix.length; row++) {
        for (let col = 0; col < currentMatrix[row].length; col++) {
            if (currentMatrix[row][col] !== 0 && currentY + row >= 0) {
                drawCell(ctx, currentX + col, currentY + row, COLORS[currentType]);
            }
        }
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL + 0.5);
        ctx.lineTo(canvas.width, y * CELL + 0.5);
        ctx.stroke();
    }

    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL + 0.5, 0);
        ctx.lineTo(x * CELL + 0.5, canvas.height);
        ctx.stroke();
    }

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }
}

function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    const matrix = SHAPES[nextType];
    const size = 30;
    const width = matrix[0].length * size;
    const height = matrix.length * size;
    const startX = Math.floor((nextCanvas.width - width) / 2);
    const startY = Math.floor((nextCanvas.height - height) / 2);

    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] !== 0) {
                nextCtx.fillStyle = COLORS[nextType];
                nextCtx.fillRect(
                    startX + col * size + 1,
                    startY + row * size + 1,
                    size - 2,
                    size - 2
                );
            }
        }
    }
}

function saveScore() {
    if (gameOverSaved) {
        return;
    }

    gameOverSaved = true;

    const scores = JSON.parse(localStorage.getItem('tetris.scores') || '[]');

    scores.push({
        name: playerName,
        score: score,
        date: new Date().toISOString()
    });

    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('tetris.scores', JSON.stringify(scores.slice(0, 20)));

    setTimeout(() => {
        window.location.href = 'scores.html';
    }, 700);
}

document.addEventListener('keydown', event => {
    if (gameOver) {
        return;
    }

    if (event.code === 'ArrowLeft') {
        event.preventDefault();
        move(-1, 0);
    }

    if (event.code === 'ArrowRight') {
        event.preventDefault();
        move(1, 0);
    }

    if (event.code === 'ArrowDown') {
        event.preventDefault();
        dropPiece();
    }

    if (event.code === 'ArrowUp') {
        event.preventDefault();
        rotatePiece();
    }

    if (event.code === 'Space') {
        event.preventDefault();
        hardDrop();
    }
});

function gameLoop(time) {
    if (!gameOver && time - lastDrop >= dropInterval) {
        dropPiece();
        lastDrop = time;
    }

    drawBoard();
    drawNext();
    updateInfo();

    requestAnimationFrame(gameLoop);
}

gameLoop(dropInterval);
