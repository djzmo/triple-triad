import AICalculationResult from "../data/AICalculationResult";
import Board from "../Board";
import Hand from "../Hand";

export default interface AI {
  calculate(board: Board, hand: Hand): AICalculationResult;
}
