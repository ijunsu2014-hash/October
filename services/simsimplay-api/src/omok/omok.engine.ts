export const BOARD_SIZE = 15;

export type Cell = 0 | 1 | 2;
export type Board = Cell[][];

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array<Cell>(BOARD_SIZE).fill(0));
}

export function applyMove(board: Board, row: number, column: number, player: 1 | 2): Board {
  if (row < 0 || row >= BOARD_SIZE || column < 0 || column >= BOARD_SIZE) {
    throw new Error("Move is outside the board");
  }
  if (board[row][column] !== 0) {
    throw new Error("Cell is already occupied");
  }
  const next = board.map((r) => [...r]);
  next[row][column] = player;
  return next;
}

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export function checkWinner(board: Board, row: number, column: number, player: 1 | 2): boolean {
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1;
    for (let step = 1; step < 5; step++) {
      const r = row + dr * step;
      const c = column + dc * step;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break;
      count++;
    }
    for (let step = 1; step < 5; step++) {
      const r = row - dr * step;
      const c = column - dc * step;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

// Simple heuristic AI: pick the empty cell adjacent to the most existing stones.
export function pickAiMove(board: Board): { row: number; column: number } {
  let best = { row: -1, column: -1, score: -1 };
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 0) continue;
      let score = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] !== 0) score++;
        }
      }
      if (score > best.score) best = { row: r, column: c, score };
    }
  }
  if (best.row === -1) {
    const mid = Math.floor(BOARD_SIZE / 2);
    return { row: mid, column: mid };
  }
  return { row: best.row, column: best.column };
}
