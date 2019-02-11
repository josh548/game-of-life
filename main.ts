const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
canvas.width = window.innerWidth / window.devicePixelRatio;
canvas.height = window.innerHeight / window.devicePixelRatio;

const computedWidth: number = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
const computedHeight: number = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
canvas.setAttribute("width", `${computedWidth * window.devicePixelRatio}px`);
canvas.setAttribute("height", `${computedHeight * window.devicePixelRatio}px`);

const cellSize: number = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 100);
const gridWidth: number = Math.floor(canvas.width / cellSize);
const gridHeight: number = Math.floor(canvas.height / cellSize);

const gridPaddingHorizontal: number = Math.floor(gridWidth / 4);
const gridPaddingVertical: number = Math.floor(gridHeight / 4);

const context = canvas.getContext("2d")!;

interface Cell {
    isAlive: boolean;
    hue: number;
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
            const livingNeighbors = getLivingNeighbors(grid, i, j);
            const oldCell = grid[i][j];
            const newCell = newGrid[i][j];
            if (!oldCell.isAlive && livingNeighbors.length === 3) {
                newCell.isAlive = true;
                newCell.hue = computeMeanHue(livingNeighbors.map((cell) => cell.hue));
            } else if (oldCell.isAlive && (livingNeighbors.length < 2 || livingNeighbors.length > 3)) {
                newCell.isAlive = false;
            } else {
                newCell.isAlive = oldCell.isAlive;
                newCell.hue = oldCell.hue;
            }
        }
    }
    return newGrid;
}

function getLivingNeighbors(grid: Cell[][], x: number, y: number): Cell[] {
    const livingNeighbors: Cell[] = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if ((dx === 0 && dy === 0) ||
                ((x + dx < 0) || (x + dx >= gridWidth)) ||
                ((y + dy < 0) || (y + dy >= gridHeight))) {
                continue;
            }
            const cell = grid[x + dx][y + dy];
            if (cell.isAlive) {
                livingNeighbors.push(cell);
            }
        }
    }
    return livingNeighbors;
}

function computeMeanHue(hues: number[]): number {
    let x = 0;
    let y = 0;
    for (const hue of hues) {
        x += Math.cos(convertDegreesToRadians(hue));
        y += Math.sin(convertDegreesToRadians(hue));
    }
    return convertRadiansToDegrees(Math.atan2(y, x));
}

function convertDegreesToRadians(degrees: number): number {
    return ((degrees / 180) * Math.PI);
}

function convertRadiansToDegrees(radians: number): number {
    return ((radians / Math.PI) * 180);
}

function start() {
    let grid: Cell[][] = createGrid(gridWidth, gridHeight);
    randomizeGrid(grid);

    function animate() {
        drawGrid(grid);
        grid = updateGrid(grid);
        requestAnimationFrame(animate);
    }

    animate();
}

start();
