const gridWidth = 10;
const gridHeight = 20;
let grid = [];
for (let i = 0; i < gridHeight; i++) {
  grid.push(Array(gridWidth).fill(0));
}

const colors = [
  '#000', // ブロックなし
  '#f00', // 赤
  '#0f0', // 緑
  '#00f', // 青
  '#ff0', // 黄
  '#f0f', // 紫
  '#0ff', // シアン
  '#f80', // オレンジ
];

let currentBlock = null;

function drawGrid() {
  const gridElement = document.getElementById('grid');
  gridElement.innerHTML = '';

  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.backgroundColor = colors[grid[i][j]];
      gridElement.appendChild(cell);
    }
  }
}

function drawBlock() {
  if (currentBlock) {
    for (let i = 0; i < currentBlock.shape.length; i++) {
      for (let j = 0; j < currentBlock.shape[i].length; j++) {
        if (currentBlock.shape[i][j]) {
          grid[currentBlock.y + i][currentBlock.x + j] = currentBlock.color;
        }
      }
    }
  }
}

function clearBlock() {
  if (currentBlock) {
    for (let i = 0; i < currentBlock.shape.length; i++) {
      for (let j = 0; j < currentBlock.shape[i].length; j++) {
        if (currentBlock.shape[i][j]) {
          grid[currentBlock.y + i][currentBlock.x + j] = 0;
        }
      }
    }
  }
}

let totalPoints = 0;
const pointsPerRow = [100, 200, 300, 500]; // 行を消したときのポイント
const consecutiveBonusFactor = 2; // 連続ボーナスの係数

function calculatePoints(rowsRemoved) {
  if (rowsRemoved > 0 && rowsRemoved <= pointsPerRow.length) {
    const basePoints = pointsPerRow[rowsRemoved - 1];
    const consecutiveBonus = Math.pow(consecutiveBonusFactor, rowsRemoved - 1);
    return basePoints * consecutiveBonus;
  } else {
    return 0;
  }
}

function updateTotalPoints(points) {
  totalPoints += points;
  const pointsElement = document.getElementById('points');
  pointsElement.textContent = `Total Points: ${totalPoints}`;
}

function moveBlockDown() {
  clearBlock();
  currentBlock.y++;
  if (isCollision()) {
    currentBlock.y--;
    drawBlock();
    removeCompletedRows();
    currentBlock = generateRandomBlock();
    if (isCollision()) {
      alert('Game Over!');
      clearInterval(gameInterval);
    }
  }
  drawBlock();
}

function moveBlockLeft() {
  clearBlock();
  currentBlock.x--;
  if (isCollision()) {
    currentBlock.x++;
  }
  drawBlock();
}

function moveBlockRight() {
  clearBlock();
  currentBlock.x++;
  if (isCollision()) {
    currentBlock.x--;
  }
  drawBlock();
}

function rotateBlock() {
  clearBlock();
  const newShape = [];
  for (let i = 0; i < currentBlock.shape[0].length; i++) {
    newShape[i] = [];
    for (let j = 0; j < currentBlock.shape.length; j++) {
      newShape[i][j] = currentBlock.shape[currentBlock.shape.length - 1 - j][i];
    }
  }
  currentBlock.shape = newShape;
  if (isCollision()) {
    // 回転した結果、衝突する場合は回転を元に戻す
    const prevShape = currentBlock.shape;
    currentBlock.shape = currentBlock.prevShape;
    currentBlock.prevShape = prevShape;
  }
  drawBlock();
}

function generateRandomBlock() {
  const shapes = [
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1], [1, 1]], // 四角
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 1, 0], [0, 1, 1]], // S
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 0, 1]], // L
    [[1, 1, 1], [1, 0, 0]], // J
  ];
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  return {
    shape: randomShape,
    prevShape: randomShape, // 前の状態の形状を記録しておく（回転時に使用）
    x: Math.floor((gridWidth - randomShape[0].length) / 2),
    y: 0,
    color: Math.floor(Math.random() * (colors.length - 1)) + 1,
  };
}

function isCollision() {
  for (let i = 0; i < currentBlock.shape.length; i++) {
    for (let j = 0; j < currentBlock.shape[i].length; j++) {
      if (
        currentBlock.shape[i][j] &&
        (currentBlock.x + j >= gridWidth ||
          currentBlock.x + j < 0 ||
          currentBlock.y + i >= gridHeight ||
          grid[currentBlock.y + i][currentBlock.x + j])
      ) {
        return true;
      }
    }
  }
  return false;
}

function removeCompletedRows() {
  let rowsToRemove = [];
  for (let i = gridHeight - 1; i >= 0; i--) {
    if (grid[i].every((cell) => cell !== 0)) {
      rowsToRemove.push(i);
    }
  }
  const rowsRemoved = rowsToRemove.length;
  if (rowsRemoved > 0) {
    for (const rowIndex of rowsToRemove) {
      grid.splice(rowIndex, 1);
      grid.unshift(Array(gridWidth).fill(0));
    }
    const pointsEarned = calculatePoints(rowsRemoved);
    updateTotalPoints(pointsEarned);
  }
}

function gameLoop() {
  moveBlockDown();
  drawGrid();
}

currentBlock = generateRandomBlock();
const gameInterval = setInterval(gameLoop, 500);

function handleKeyDown(event) {
  switch (event.key) {
    case 'ArrowLeft':
      moveBlockLeft();
      break;
    case 'ArrowRight':
      moveBlockRight();
      break;
    case 'ArrowDown':
      moveBlockDown();
      break;
    case ' ':
      rotateBlock();
      break; // スペースキーで回転
  }
}

document.addEventListener('keydown', handleKeyDown);

// タッチイベントの追加
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
  const touchEndX = event.changedTouches[0].clientX;
  const touchEndY = event.changedTouches[0].clientY;

  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  // 水平方向の移動
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      moveBlockRight();
    } else {
      moveBlockLeft();
    }
  } else { // 垂直方向の移動
    if (dy > 0) {
      moveBlockDown();
    } else {
      rotateBlock();
    }
  }
}

document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchend', handleTouchEnd);
