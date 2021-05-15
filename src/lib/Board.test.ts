import Board from "./Board";
import Card from "./data/Card";
import Combo from "./data/Combo";
import Player from "./data/Player";

describe("Board", () => {
  const standardRule = {
    open: true,
    random: false,
    elemental: false,
    suddenDeath: false,
    same: true,
    plus: true,
    combo: true,
  };

  test("Put card at index", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "Test",
      ranks: { top: 1, left: 1, right: 1, bottom: 1 },
    };

    const board = new Board(standardRule);
    const result = board.put(4, a, Player.SELF);
    const cells = board.getCells();

    expect(result.length).toBe(0);
    expect(cells.length).toBeGreaterThan(0);
    expect(cells[4].card).toBeDefined();
    expect(cells[4].card.name).toBe(a.name);
  });

  test("Put card at index with bottom capture", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 0, right: 0, bottom: 2 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 1, left: 0, right: 0, bottom: 0 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(3, b, Player.OPPONENT),
      board.put(0, a, Player.SELF),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(1);
    expect(result[1][0].capturedCellIndices.length).toBe(1);
    expect(result[1][0].capturedCellIndices[0]).toBe(3);
    expect(result[1][0].newOwner).toBe(Player.SELF);
  });

  test("Put card at index with top capture", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 0, right: 0, bottom: 2 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 3, left: 0, right: 0, bottom: 0 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(1, a, Player.SELF),
      board.put(4, b, Player.OPPONENT),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(1);
    expect(result[1][0].capturedCellIndices.length).toBe(1);
    expect(result[1][0].capturedCellIndices[0]).toBe(1);
    expect(result[1][0].newOwner).toBe(Player.OPPONENT);
  });

  test("Put card at index with left capture", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 0, right: 3, bottom: 0 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 0, left: 4, right: 0, bottom: 0 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(1, a, Player.SELF),
      board.put(2, b, Player.OPPONENT),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(1);
    expect(result[1][0].capturedCellIndices.length).toBe(1);
    expect(result[1][0].capturedCellIndices[0]).toBe(1);
    expect(result[1][0].newOwner).toBe(Player.OPPONENT);
  });

  test("Put card at index with right capture", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 4, right: 0, bottom: 0 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 0, left: 0, right: 5, bottom: 0 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(8, a, Player.OPPONENT),
      board.put(7, b, Player.SELF),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(1);
    expect(result[1][0].capturedCellIndices.length).toBe(1);
    expect(result[1][0].capturedCellIndices[0]).toBe(8);
    expect(result[1][0].newOwner).toBe(Player.SELF);
  });

  test("Put card at index with non-capturing same rank", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 0, right: 5, bottom: 0 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 0, left: 5, right: 0, bottom: 0 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(0, a, Player.OPPONENT),
      board.put(1, b, Player.SELF),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(0);
  });

  test("Put card at index with SAME rule capture", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 5, right: 0, bottom: 0 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 5, left: 0, right: 0, bottom: 0 },
    };
    const c: Card = {
      id: 0,
      level: 0,
      name: "C",
      ranks: { top: 0, left: 0, right: 5, bottom: 5 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(1, a, Player.OPPONENT),
      board.put(3, b, Player.OPPONENT),
      board.put(0, c, Player.SELF),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(0);
    expect(result[2].length).toBe(1);
    expect(result[2][0].capturedCellIndices.length).toBe(2);
    expect(result[2][0].capturedCellIndices[0]).toBe(1);
    expect(result[2][0].capturedCellIndices[1]).toBe(3);
    expect(result[2][0].newOwner).toBe(Player.SELF);
    expect(result[2][0].combo).toBe(Combo.SAME);
  });

  test("Put card at index with PLUS rule capture", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 3, right: 0, bottom: 0 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 4, left: 0, right: 0, bottom: 0 },
    };
    const c: Card = {
      id: 0,
      level: 0,
      name: "C",
      ranks: { top: 0, left: 0, right: 4, bottom: 3 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(1, a, Player.OPPONENT),
      board.put(3, b, Player.OPPONENT),
      board.put(0, c, Player.SELF),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(0);
    expect(result[2].length).toBe(1);
    expect(result[2][0].capturedCellIndices.length).toBe(2);
    expect(result[2][0].capturedCellIndices[0]).toBe(1);
    expect(result[2][0].capturedCellIndices[1]).toBe(3);
    expect(result[2][0].newOwner).toBe(Player.SELF);
    expect(result[2][0].combo).toBe(Combo.PLUS);
  });

  test("Put card at index with SAME rule capture on four directions", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 0, right: 0, bottom: 5 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 0, left: 0, right: 5, bottom: 0 },
    };
    const c: Card = {
      id: 0,
      level: 0,
      name: "C",
      ranks: { top: 0, left: 5, right: 0, bottom: 0 },
    };
    const d: Card = {
      id: 0,
      level: 0,
      name: "D",
      ranks: { top: 5, left: 0, right: 0, bottom: 0 },
    };
    const e: Card = {
      id: 0,
      level: 0,
      name: "E",
      ranks: { top: 5, left: 5, right: 5, bottom: 5 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(1, a, Player.SELF),
      board.put(3, b, Player.SELF),
      board.put(5, c, Player.SELF),
      board.put(7, d, Player.SELF),
      board.put(4, e, Player.OPPONENT),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(0);
    expect(result[2].length).toBe(0);
    expect(result[3].length).toBe(0);
    expect(result[4].length).toBe(1);
    expect(result[4][0].capturedCellIndices.length).toBe(4);
    expect(result[4][0].capturedCellIndices[0]).toBe(1);
    expect(result[4][0].capturedCellIndices[1]).toBe(3);
    expect(result[4][0].capturedCellIndices[2]).toBe(5);
    expect(result[4][0].capturedCellIndices[3]).toBe(7);
    expect(result[4][0].newOwner).toBe(Player.OPPONENT);
    expect(result[4][0].combo).toBe(Combo.SAME);
  });

  test("Put card at index with PLUS rule capture on four directions", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 0, right: 0, bottom: 1 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 0, left: 0, right: 2, bottom: 0 },
    };
    const c: Card = {
      id: 0,
      level: 0,
      name: "C",
      ranks: { top: 0, left: 3, right: 0, bottom: 0 },
    };
    const d: Card = {
      id: 0,
      level: 0,
      name: "D",
      ranks: { top: 4, left: 0, right: 0, bottom: 0 },
    };
    const e: Card = {
      id: 0,
      level: 0,
      name: "E",
      ranks: { top: 4, left: 3, right: 2, bottom: 1 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(1, a, Player.OPPONENT),
      board.put(3, b, Player.OPPONENT),
      board.put(5, c, Player.OPPONENT),
      board.put(7, d, Player.OPPONENT),
      board.put(4, e, Player.SELF),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(0);
    expect(result[2].length).toBe(0);
    expect(result[3].length).toBe(0);
    expect(result[4].length).toBe(1);
    expect(result[4][0].capturedCellIndices.length).toBe(4);
    expect(result[4][0].capturedCellIndices[0]).toBe(1);
    expect(result[4][0].capturedCellIndices[1]).toBe(3);
    expect(result[4][0].capturedCellIndices[2]).toBe(5);
    expect(result[4][0].capturedCellIndices[3]).toBe(7);
    expect(result[4][0].newOwner).toBe(Player.SELF);
    expect(result[4][0].combo).toBe(Combo.PLUS);
  });

  test("Put card at index with one directional COMBO", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 3, right: 3, bottom: 0 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 0, left: 2, right: 0, bottom: 0 },
    };
    const c: Card = {
      id: 0,
      level: 0,
      name: "C",
      ranks: { top: 3, left: 0, right: 0, bottom: 3 },
    };
    const d: Card = {
      id: 0,
      level: 0,
      name: "D",
      ranks: { top: 2, left: 0, right: 0, bottom: 0 },
    };
    const e: Card = {
      id: 0,
      level: 0,
      name: "E",
      ranks: { top: 0, left: 0, right: 3, bottom: 3 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(1, a, Player.OPPONENT),
      board.put(2, b, Player.OPPONENT),
      board.put(3, c, Player.OPPONENT),
      board.put(6, d, Player.OPPONENT),
      board.put(0, e, Player.SELF),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(0);
    expect(result[2].length).toBe(0);
    expect(result[3].length).toBe(0);
    expect(result[4].length).toBe(3);
    expect(result[4][0].capturedCellIndices.length).toBe(2);
    expect(result[4][0].capturedCellIndices[0]).toBe(1);
    expect(result[4][0].capturedCellIndices[1]).toBe(3);
    expect(result[4][0].newOwner).toBe(Player.SELF);
    expect(result[4][0].combo).toBe(Combo.SAME);
    expect(result[4][1].capturedCellIndices.length).toBe(1);
    expect(result[4][1].capturedCellIndices[0]).toBe(2);
    expect(result[4][1].newOwner).toBe(Player.SELF);
    expect(result[4][1].combo).toBe(Combo.COMBO);
    expect(result[4][2].capturedCellIndices.length).toBe(1);
    expect(result[4][2].capturedCellIndices[0]).toBe(6);
    expect(result[4][2].newOwner).toBe(Player.SELF);
    expect(result[4][2].combo).toBe(Combo.COMBO);
  });

  test("Put card at index non-capturing potential combo", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 3, right: 0, bottom: 0 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 0, left: 4, right: 4, bottom: 0 },
    };
    const c: Card = {
      id: 0,
      level: 0,
      name: "C",
      ranks: { top: 0, left: 0, right: 5, bottom: 0 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(1, a, Player.OPPONENT),
      board.put(2, b, Player.OPPONENT),
      board.put(0, c, Player.SELF),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(0);
    expect(result[2].length).toBe(1);
    expect(result[2][0].capturedCellIndices.length).toBe(1);
    expect(result[2][0].capturedCellIndices[0]).toBe(1);
    expect(result[2][0].newOwner).toBe(Player.SELF);
  });

  test("Put card at index with SAME + whole board COMBO", () => {
    const a: Card = {
      id: 0,
      level: 0,
      name: "A",
      ranks: { top: 0, left: 3, right: 3, bottom: 3 },
    };
    const b: Card = {
      id: 0,
      level: 0,
      name: "B",
      ranks: { top: 0, left: 2, right: 0, bottom: 3 },
    };
    const c: Card = {
      id: 0,
      level: 0,
      name: "C",
      ranks: { top: 3, left: 0, right: 0, bottom: 3 },
    };
    const d: Card = {
      id: 0,
      level: 0,
      name: "D",
      ranks: { top: 2, left: 0, right: 0, bottom: 3 },
    };
    const e: Card = {
      id: 0,
      level: 0,
      name: "E",
      ranks: { top: 2, left: 0, right: 0, bottom: 3 },
    };
    const f: Card = {
      id: 0,
      level: 0,
      name: "F",
      ranks: { top: 2, left: 0, right: 0, bottom: 0 },
    };
    const g: Card = {
      id: 0,
      level: 0,
      name: "G",
      ranks: { top: 2, left: 0, right: 0, bottom: 0 },
    };
    const h: Card = {
      id: 0,
      level: 0,
      name: "H",
      ranks: { top: 2, left: 0, right: 0, bottom: 0 },
    };
    const i: Card = {
      id: 0,
      level: 0,
      name: "I",
      ranks: { top: 0, left: 0, right: 3, bottom: 3 },
    };

    const board = new Board(standardRule);
    const result = [
      board.put(1, a, Player.OPPONENT),
      board.put(2, b, Player.OPPONENT),
      board.put(3, c, Player.OPPONENT),
      board.put(4, d, Player.OPPONENT),
      board.put(5, e, Player.OPPONENT),
      board.put(6, f, Player.OPPONENT),
      board.put(7, g, Player.OPPONENT),
      board.put(8, h, Player.OPPONENT),
      board.put(0, i, Player.SELF),
    ];

    expect(result[0].length).toBe(0);
    expect(result[1].length).toBe(0);
    expect(result[2].length).toBe(0);
    expect(result[3].length).toBe(0);
    expect(result[4].length).toBe(0);
    expect(result[5].length).toBe(0);
    expect(result[6].length).toBe(0);
    expect(result[7].length).toBe(0);
    expect(result[8].length).toBe(6);

    let capturedIndices = [];
    for (const singleResult of result[8]) {
      capturedIndices = capturedIndices.concat(
        singleResult.capturedCellIndices
      );
    }

    capturedIndices.sort();

    for (let i = 1; i < 9; i++) {
      expect(capturedIndices[i - 1]).toBe(i);
    }
  });
});
