const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cellSize: number = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 100);
const gridWidth: number = Math.floor(canvas.width / cellSize);
const gridHeight: number = Math.floor(canvas.height / cellSize);

const gridPaddingHorizontal: number = Math.floor(gridWidth / 4);
const gridPaddingVertical: number = Math.floor(gridHeight / 4);

const context = canvas.getContext("2d") as CanvasRenderingContext2D;

interface Cell {
    isAlive: boolean;
    hue: number;
}

start();

function start() {
    let grid: Cell[][] = createGrid(gridWidth, gridHeight);
    randomizeGrid(grid);
    function step() {
        drawGrid(grid);
        grid = updateGrid(grid);
        requestAnimationFrame(step);
    }
    step();
}

function createGrid(width: number, height: number): Cell[][] {
    const grid: Cell[][] = [];
    for (let i = 0; i < width; i++) {
        grid[i] = [];
        for (let j = 0; j < height; j++) {
            grid[i][j] = {
                isAlive: false,
                hue: 0,
            };
        }
    }
    return grid;
}

function randomizeGrid(grid: Cell[][]): void {
    for (let i = gridPaddingHorizontal; i < (gridWidth - gridPaddingHorizontal); i++) {
        for (let j = gridPaddingVertical; j < (gridHeight - gridPaddingVertical); j++) {
            grid[i][j] = {
                isAlive: (Math.round(Math.random()) === 1),
                hue: Math.floor(Math.random() * 360),
            };
        }
    }
}

function drawGrid(grid: Cell[][]): void {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            if (grid[i][j].isAlive) {
                context.fillStyle = `hsl(${grid[i][j].hue}, 100%, 50%)`;
                context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
}

function updateGrid(grid: Cell[][]): Cell[][] {
    const newGrid = createGrid(gridWidth, gridHeight);
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            const numberOfNeighbors = countNeighbors(grid, i, j);
            if (!grid[i][j].isAlive && numberOfNeighbors === 3) {
                newGrid[i][j].isAlive = true;
                newGrid[i][j].hue = calculateAverageHue(getNeighborHues(grid, i, j));
            } else if (grid[i][j].isAlive && (numberOfNeighbors < 2 || numberOfNeighbors > 3)) {
                newGrid[i][j].isAlive = false;
            } else {
                newGrid[i][j].isAlive = grid[i][j].isAlive;
                newGrid[i][j].hue = grid[i][j].hue;
            }
        }
    }
    return newGrid;
}

function countNeighbors(grid: Cell[][], x: number, y: number): number {
    let numberOfNeighbors = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if ((dx === 0 && dy === 0) ||
                ((x + dx < 0) || (x + dx >= gridWidth)) ||
                ((y + dy < 0) || (y + dy >= gridHeight))) {
                continue;
            }
            if (grid[x + dx][y + dy].isAlive) {
                numberOfNeighbors++;
            }
        }
    }
    return numberOfNeighbors;
}

function getNeighborHues(grid: Cell[][], x: number, y: number): number[] {
    const hues: number[] = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if ((dx === 0 && dy === 0) ||
                ((x + dx < 0) || (x + dx >= gridWidth)) ||
                ((y + dy < 0) || (y + dy >= gridHeight))) {
                continue;
            }
            if (grid[x + dx][y + dy].isAlive) {
                hues.push(grid[x + dx][y + dy].hue);
            }
        }
    }
    return hues;
}

function calculateAverageHue(hues: number[]): number {
    let x = 0;
    let y = 0;
    for (const hue of hues) {
        x += Math.cos(convertDegreesToRadians(hue));
        y += Math.sin(convertDegreesToRadians(hue));
    }
    const averageHue = convertRadiansToDegrees(Math.atan2(y, x));
    return averageHue;
}

function convertDegreesToRadians(degrees: number): number {
    return ((degrees / 360) * 2 * Math.PI);
}

function convertRadiansToDegrees(radians: number): number {
    return ((radians / (2 * Math.PI)) * 360);
}
