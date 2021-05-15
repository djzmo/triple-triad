import Combo from "./Combo";
import Player from "./Player";

export default interface CaptureResult {
  capturedCellIndices: number[];
  newOwner: Player;
  combo?: Combo;
}
