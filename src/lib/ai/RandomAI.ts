import random from "random";
import AI from "./AI";
import AICalculationResult from "../data/AICalculationResult";
import Board from "../Board";
import Hand from "../Hand";

export default class RandomAI implements AI {
  calculate(board: Board, hand: Hand): AICalculationResult | null {
    const emptyIndices = [];
    for (const index in board.getCells()) {
      const cell = board.getCells()[index];
      if (!cell.card) {
        emptyIndices.push(index);
      }
    }
    const randomCellIndex = random.int(0, emptyIndices.length - 1);
    const targetCellIndex = emptyIndices[randomCellIndex];
    const selectedCardIndex = random.int(0, hand.getCards().length - 1);
    return !emptyIndices.length ? null : { targetCellIndex, selectedCardIndex };
  }
}
