import { describe, expect, it } from "vitest";
import { applyMove, checkWinner, createEmptyBoard, pickAiMove } from "../src/omok/omok.engine";

describe("pickAiMove", () => {
  it("opens at the center of an empty board", () => {
    expect(pickAiMove(createEmptyBoard())).toEqual({ row: 7, column: 7 });
  });

  it("takes an immediate winning move", () => {
    const board = createEmptyBoard();
    for (let column = 5; column <= 8; column++) board[7][column] = 2;

    const move = pickAiMove(board);
    expect(checkWinner(applyMove(board, move.row, move.column, 2), move.row, move.column, 2)).toBe(true);
  });

  it("blocks an opponent's immediate win", () => {
    const board = createEmptyBoard();
    for (let column = 4; column <= 7; column++) board[7][column] = 1;

    const move = pickAiMove(board);
    expect(move.row).toBe(7);
    expect([3, 8]).toContain(move.column);
  });
});