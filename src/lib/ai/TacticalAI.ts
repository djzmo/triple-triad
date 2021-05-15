import random from "random";
import AI from "./AI";
import AICalculationResult from "../data/AICalculationResult";
import Board from "../Board";
import Hand from "../Hand";
import Player from "../data/Player";
import { oppositeSide } from "../Util";

export default class TacticalAI implements AI {
  calculate(board: Board, hand: Hand): AICalculationResult | null {
    if (board.isEmpty()) {
      return TacticalAI.calculateDefensiveCornerMove(board, hand);
    } else {
      const capturingMove = TacticalAI.calculateCapturingMove(board, hand);
      const defensiveCornerMove = TacticalAI.calculateDefensiveCornerMove(
        board,
        hand
      );
      if (capturingMove) {
        return capturingMove;
      } else if (defensiveCornerMove) {
        return defensiveCornerMove;
      }
      return TacticalAI.calculateRandomMove(board, hand);
    }
  }

  private static calculateCapturingMove(
    board: Board,
    hand: Hand
  ): AICalculationResult | null {
    const capturableCellIndices = TacticalAI.findCapturableCellIndices(
      board,
      hand
    );

    if (!capturableCellIndices.length) {
      return null;
    }

    capturableCellIndices.sort((a, b) =>
      a.exposedDefense < b.exposedDefense ? 1 : -1
    );
    const bestMove = capturableCellIndices[0];

    return {
      targetCellIndex: bestMove.attackCellIndex,
      selectedCardIndex: bestMove.attackCardIndex,
    };
  }

  private static calculateDefensiveCornerMove(
    board: Board,
    hand: Hand
  ): AICalculationResult | null {
    const availableCorners = TacticalAI.findAvailableCorners(board);
    if (!availableCorners.length) {
      return null;
    }

    const [topLeftSum, topLeftIndex] = TacticalAI.findMaxSumFromHand(hand, [
      "top",
      "left",
    ]);
    const [topRightSum, topRightIndex] = TacticalAI.findMaxSumFromHand(hand, [
      "top",
      "right",
    ]);
    const [bottomLeftSum, bottomLeftIndex] = TacticalAI.findMaxSumFromHand(
      hand,
      ["bottom", "left"]
    );
    const [bottomRightSum, bottomRightIndex] = TacticalAI.findMaxSumFromHand(
      hand,
      ["bottom", "right"]
    );

    const [candidateCellIndex, candidateSum, candidateCardIndex] =
      TacticalAI.reduceAvailableCorners(
        availableCorners,
        [8, 6, 2, 0],
        [topLeftSum, topRightSum, bottomLeftSum, bottomRightSum],
        [topLeftIndex, topRightIndex, bottomLeftIndex, bottomRightIndex]
      );

    const result = TacticalAI.findMaxIndex(candidateSum);

    return {
      targetCellIndex: candidateCellIndex[result],
      selectedCardIndex: candidateCardIndex[result],
    };
  }

  private static calculateRandomMove(
    board: Board,
    hand: Hand
  ): AICalculationResult | null {
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

  private static findMaxSumFromHand(
    hand: Hand,
    sides: string[]
  ): [maxSum: number, maxCardIndex: number] {
    let maxSum = 0,
      maxCardIndex = 0;
    for (let i = 0; i < hand.getCards().length; i++) {
      const card = hand.getCards()[i];

      let sum = 0;
      for (const side of sides) {
        sum += card.ranks[side];
      }

      if (sum > maxSum) {
        maxSum = sum;
        maxCardIndex = i;
      }
    }

    return [maxSum, maxCardIndex];
  }

  private static findMaxIndex(arr: number[]) {
    let max = arr[0],
      maxIndex = 0;
    let i;
    for (i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        max = arr[i];
        maxIndex = i;
      }
    }
    return maxIndex;
  }

  private static findAvailableCorners(board: Board) {
    const cornerIndices = [0, 2, 6, 8];
    const availableCorners = [];
    for (const index of cornerIndices) {
      if (!board.getCells()[index].card) {
        availableCorners.push(index);
      }
    }
    return availableCorners;
  }

  private static reduceAvailableCorners(
    availableCorners: number[],
    candidateCellIndex: number[],
    candidateSum: number[],
    candidateCardIndex: number[]
  ): [
    candidateCellIndex: number[],
    candidateSum: number[],
    candidateCardIndex: number[]
  ] {
    const possibleCellIndex = [];
    const possibleSum = [];
    const possibleCardIndex = [];
    for (let i = 0; i < candidateCellIndex.length; i++) {
      if (availableCorners.includes(candidateCellIndex[i])) {
        possibleCellIndex.push(candidateCellIndex[i]);
        possibleSum.push(candidateSum[i]);
        possibleCardIndex.push(candidateCardIndex[i]);
      }
    }
    return [possibleCellIndex, possibleSum, possibleCardIndex];
  }

  private static findCapturableCellIndices(
    board: Board,
    hand: Hand
  ): {
    targetCellIndex: number;
    attackCellIndex: number;
    attackCardIndex: number;
    exposedDefense: number;
  }[] {
    const result = [];
    for (let i = 0; i < board.getCells().length; i++) {
      const cell = board.getCells()[i];
      if (!cell.card || cell.owner !== Player.SELF) {
        continue;
      }

      const adjacent = this.findExposedAdjacentSides(board, i);
      for (const side in adjacent) {
        const playerRank = cell.card.ranks[side];
        const opponentSide = oppositeSide[side];
        const capableCardIndices = TacticalAI.findCapableCardIndicesFromHand(
          hand,
          opponentSide,
          playerRank
        );
        const exposedSides = Object.keys(
          this.findExposedAdjacentSides(board, adjacent[side])
        );

        if (!capableCardIndices.length || !exposedSides.length) {
          continue;
        }

        const cardIndexDefenses = {};
        for (const capableCardIndex of capableCardIndices) {
          cardIndexDefenses[capableCardIndex] =
            hand.getCards()[capableCardIndex].ranks[exposedSides[0]] +
            (exposedSides[1]
              ? hand.getCards()[capableCardIndex].ranks[exposedSides[1]]
              : 10);
        }

        let highestDefenseCardIndex = Number(Object.keys(cardIndexDefenses)[0]);
        for (const capableCardIndex in cardIndexDefenses) {
          const exposure = cardIndexDefenses[capableCardIndex];
          if (exposure > cardIndexDefenses[highestDefenseCardIndex]) {
            highestDefenseCardIndex = Number(capableCardIndex);
          }
        }

        result.push({
          targetCellIndex: i,
          attackCellIndex: adjacent[side],
          attackCardIndex: highestDefenseCardIndex,
          exposedDefense: cardIndexDefenses[highestDefenseCardIndex],
        });
      }
    }

    return result;
  }

  private static findExposedAdjacentSides(
    board: Board,
    cellIndex: number
  ): { top?: number; left?: number; right?: number; bottom?: number } {
    const adjacent = {
      top: cellIndex - 3,
      left: cellIndex - 1,
      right: cellIndex + 1,
      bottom: cellIndex + 3,
    };

    if (cellIndex % 3 === 0 || board.getCells()[adjacent.left]?.card) {
      delete adjacent.left;
    }

    if (cellIndex < 3 || board.getCells()[adjacent.top]?.card) {
      delete adjacent.top;
    }

    if (cellIndex % 3 === 2 || board.getCells()[adjacent.right]?.card) {
      delete adjacent.right;
    }

    if (cellIndex >= 6 || board.getCells()[adjacent.bottom]?.card) {
      delete adjacent.bottom;
    }

    return adjacent;
  }

  private static findCapableCardIndicesFromHand(
    hand: Hand,
    side: string,
    againstRank: number
  ): number[] {
    const capableCardIndices = [];
    for (let i = 0; i < hand.getCards().length; i++) {
      const card = hand.getCards()[i];
      const rank = card.ranks[side];

      if (rank > againstRank) {
        capableCardIndices.push(i);
      }
    }

    return capableCardIndices;
  }
}
