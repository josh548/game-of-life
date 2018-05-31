const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cellSize: number = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 100);
const gridWidth: number = Math.floor(canvas.width / cellSize);
const gridHeight: number = Math.floor(canvas.height / cellSize);

const gridPaddingHorizontal: number = Math.floor(gridWidth / 4);
const gridPaddingVertical: number = Math.floor(gridHeight / 4);

const context = canvas.getContext("2d") as CanvasRenderingContext2D;
context.fillStyle = "#4a4a4a";

start();

function start() {
    let grid: number[][] = createGrid(gridWidth, gridHeight);
    randomizeGrid(grid);
    let hue: number = 0;
    function step() {
        drawGrid(grid);
        grid = updateGrid(grid);
        requestAnimationFrame(step);
        hue++;
        if (hue > 360) {
            hue = 0;
        }
    }
    step();
}

function createGrid(width: number, height: number): number[][] {
    const grid: number[][] = [];
    for (let i = 0; i < width; i++) {
        grid[i] = [];
        for (let j = 0; j < height; j++) {
            grid[i][j] = 0;
        }
    }
    return grid;
}

function randomizeGrid(grid: number[][]): void {
    for (let i = gridPaddingHorizontal; i < (gridWidth - gridPaddingHorizontal); i++) {
        for (let j = gridPaddingVertical; j < (gridHeight - gridPaddingVertical); j++) {
            grid[i][j] = Math.round(Math.random());
        }
    }
}

function drawGrid(grid: number[][]): void {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            if (grid[i][j] === 1) {
                context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
}

function updateGrid(grid: number[][]): number[][] {
    const newGrid = createGrid(gridWidth, gridHeight);
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            const numberOfNeighbors = countNeighbors(grid, i, j);
            if (grid[i][j] === 0 && numberOfNeighbors === 3) {
                newGrid[i][j] = 1;
            } else if (grid[i][j] === 1 && (numberOfNeighbors < 2 || numberOfNeighbors > 3)) {
                newGrid[i][j] = 0;
            } else {
                newGrid[i][j] = grid[i][j];
            }
        }
    }
    return newGrid;
}

function countNeighbors(grid: number[][], x: number, y: number): number {
    let numberOfNeighbors = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if ((dx === 0 && dy === 0) ||
                ((x + dx < 0) || (x + dx >= gridWidth)) ||
                ((y + dy < 0) || (y + dy >= gridHeight))) {
                continue;
            }
            numberOfNeighbors += grid[x + dx][y + dy];
        }
    }
    return numberOfNeighbors;
}
