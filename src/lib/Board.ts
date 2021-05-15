import random from "random";
import CaptureResult from "./data/CaptureResult";
import Card from "./data/Card";
import Cell from "./data/Cell";
import Combo from "./data/Combo";
import Player from "./data/Player";
import Rule from "./data/Rule";
import { oppositeSide } from "./Util";

export default class Board {
  private readonly cells: Cell[];
  private readonly rule: Rule;

  constructor(rule: Rule) {
    this.cells = [];
    this.rule = rule;
    for (let i = 0; i < 9; i++) {
      const cell: Cell = {};
      if (rule.elemental && random.int(1, 10) % 4 === 0) {
        cell.element = random.int(0, 7);
      }
      this.cells.push(cell);
    }
  }

  put(cellIndex: number, card: Card, owner: Player): CaptureResult[] {
    if (this.cells[cellIndex].card) {
      return [];
    }

    this.cells[cellIndex] = {
      card,
      owner,
      element: this.cells[cellIndex].element,
    };

    return this.captureAdjacent(Number(cellIndex));
  }

  private captureAdjacent(
    cellIndex: number,
    isCombo?: boolean
  ): CaptureResult[] {
    const attackerCell = this.cells[cellIndex];

    if (!attackerCell) {
      return [];
    }

    let result: CaptureResult[] = [];

    const attackQueue = {
      top: cellIndex - 3,
      left: cellIndex - 1,
      right: cellIndex + 1,
      bottom: cellIndex + 3,
    };

    if (cellIndex % 3 === 0) {
      delete attackQueue.left;
    }

    if (cellIndex < 3) {
      delete attackQueue.top;
    }

    if (cellIndex % 3 === 2) {
      delete attackQueue.right;
    }

    if (cellIndex >= 6) {
      delete attackQueue.bottom;
    }

    const capturedCellIndices: number[] = [];
    const comboRanks = {};
    for (const sourceSide in attackQueue) {
      const againstIndex = attackQueue[sourceSide];
      const againstCell = this.cells[againstIndex];

      if (!againstCell?.card) {
        continue;
      }

      let attackerRank = attackerCell.card.ranks[sourceSide];
      let againstRank = againstCell.card?.ranks[oppositeSide[sourceSide]];

      if (this.rule.elemental) {
        if (attackerCell.element != null) {
          if (attackerCell.element === attackerCell.card.element) {
            attackerRank += 1;
          } else {
            attackerRank -= 1;
          }
        }

        if (againstCell.element != null) {
          if (againstCell.element === againstCell.card.element) {
            againstRank += 1;
          } else {
            againstRank -= 1;
          }
        }
      }

      if (attackerCell.owner != againstCell.owner) {
        if (attackerRank > againstRank) {
          this.cells[againstIndex].owner = attackerCell.owner;
          capturedCellIndices.push(againstIndex);
        }

        if (!isCombo) {
          comboRanks[againstIndex] = [attackerRank, againstRank];
        }
      }
    }

    const comboMap = {};
    for (const againstIndex in comboRanks) {
      const ranks = comboRanks[againstIndex];
      const added = ranks[0] + ranks[1];
      if (!comboMap[added]) {
        comboMap[added] = {};
      }
      comboMap[added][againstIndex] = ranks;
    }

    for (const added in comboMap) {
      const againstIndices = Object.keys(comboMap[added]).map((s) =>
        parseInt(s, 10)
      );
      if (againstIndices.length > 1) {
        const firstRanks = comboMap[added][againstIndices[0]];
        const combo = isCombo
          ? Combo.COMBO
          : firstRanks[0] != firstRanks[1]
          ? Combo.PLUS
          : Combo.SAME;
        result.push({
          capturedCellIndices: againstIndices,
          newOwner: attackerCell.owner,
          combo,
        });
        for (const againstIndex of againstIndices) {
          capturedCellIndices.splice(
            capturedCellIndices.indexOf(againstIndex),
            1
          );
          this.cells[againstIndex].owner = attackerCell.owner;
          result = result.concat(
            this.captureAdjacent(Number(againstIndex), true)
          );
        }
      }
    }

    if (capturedCellIndices.length) {
      result.push({
        capturedCellIndices,
        newOwner: attackerCell.owner,
        combo: isCombo ? Combo.COMBO : undefined,
      });
      if (isCombo) {
        for (const index of capturedCellIndices) {
          result = result.concat(this.captureAdjacent(Number(index), true));
        }
      }
    }

    return result;
  }

  isFullyOccupied(): boolean {
    for (const cell of this.cells) {
      if (!cell.card) {
        return false;
      }
    }

    return true;
  }

  isEmpty(): boolean {
    for (const cell of this.cells) {
      if (cell.card) {
        return false;
      }
    }

    return true;
  }

  getCells(): Cell[] {
    return this.cells;
  }

  getRule(): Rule {
    return this.rule;
  }
}
