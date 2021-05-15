import Card from "./Card";
import Element from "./Element";
import Player from "./Player";

export default interface Cell {
  card?: Card;
  owner?: Player;
  element?: Element;
}
