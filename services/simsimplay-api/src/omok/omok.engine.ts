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

type Position = { row: number; column: number };

function getCandidateMoves(board: Board): Position[] {
  const candidates = new Map<number, Position>();
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      if (board[row][column] === 0) continue;
      for (let rowOffset = -2; rowOffset <= 2; rowOffset++) {
        for (let columnOffset = -2; columnOffset <= 2; columnOffset++) {
          const candidateRow = row + rowOffset;
          const candidateColumn = column + columnOffset;
          if (
            candidateRow >= 0 && candidateRow < BOARD_SIZE &&
            candidateColumn >= 0 && candidateColumn < BOARD_SIZE &&
            board[candidateRow][candidateColumn] === 0
          ) {
            const index = candidateRow * BOARD_SIZE + candidateColumn;
            candidates.set(index, { row: candidateRow, column: candidateColumn });
          }
        }
      }
    }
  }

  const center = Math.floor(BOARD_SIZE / 2);
  return [...candidates.values()].sort((a, b) => {
    const distanceA = Math.abs(a.row - center) + Math.abs(a.column - center);
    const distanceB = Math.abs(b.row - center) + Math.abs(b.column - center);
    return distanceA - distanceB || a.row - b.row || a.column - b.column;
  });
}

function scoreLine(board: Board, row: number, column: number, player: 1 | 2, dr: number, dc: number): number {
  const nextBoard = applyMove(board, row, column, player);
  let count = 1;
  let openEnds = 0;

  for (const direction of [-1, 1]) {
    for (let step = 1; step < 5; step++) {
      const nextRow = row + dr * step * direction;
      const nextColumn = column + dc * step * direction;
      if (nextRow < 0 || nextRow >= BOARD_SIZE || nextColumn < 0 || nextColumn >= BOARD_SIZE) break;
      const cell = nextBoard[nextRow][nextColumn];
      if (cell === player) {
        count++;
      } else {
        if (cell === 0) openEnds++;
        break;
      }
    }
  }

  if (count >= 5) return 100_000_000;
  if (count === 4) return openEnds === 2 ? 10_000_000 : openEnds === 1 ? 1_000_000 : 0;
  if (count === 3) return openEnds === 2 ? 100_000 : openEnds === 1 ? 10_000 : 0;
  if (count === 2) return openEnds === 2 ? 2_000 : openEnds === 1 ? 200 : 0;
  return openEnds === 2 ? 20 : 0;
}

function scoreMove(board: Board, position: Position, player: 1 | 2): number {
  const nextBoard = applyMove(board, position.row, position.column, player);
  if (checkWinner(nextBoard, position.row, position.column, player)) return 100_000_000;
  return DIRECTIONS.reduce(
    (score, [dr, dc]) => score + scoreLine(board, position.row, position.column, player, dr, dc),
    0,
  );
}

export function pickAiMove(board: Board): Position {
  const center = Math.floor(BOARD_SIZE / 2);
  const candidates = getCandidateMoves(board);
  if (candidates.length === 0) {
    if (board.every((row) => row.every((cell) => cell === 0))) return { row: center, column: center };
    throw new Error("No moves available");
  }

  for (const move of candidates) {
    if (checkWinner(applyMove(board, move.row, move.column, 2), move.row, move.column, 2)) return move;
  }

  const opponentWinningMoves = candidates.filter((move) =>
    checkWinner(applyMove(board, move.row, move.column, 1), move.row, move.column, 1),
  );
  if (opponentWinningMoves.length === 1) return opponentWinningMoves[0];

  let bestMove = candidates[0];
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const move of candidates) {
    const attackScore = scoreMove(board, move, 2);
    const defenseScore = scoreMove(board, move, 1);
    const centerScore = BOARD_SIZE - Math.abs(move.row - center) - Math.abs(move.column - center);
    const score = attackScore + defenseScore * 1.1 + centerScore;
    if (score > bestScore) {
      bestMove = move;
      bestScore = score;
    }
  }
  return bestMove;
}
