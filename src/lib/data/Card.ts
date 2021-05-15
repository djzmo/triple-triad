import Element from "./Element";
import Ranks from "./Ranks";

export default interface Card {
  id: number;
  name: string;
  ranks: Ranks;
  level: number;
  element?: Element;
}
