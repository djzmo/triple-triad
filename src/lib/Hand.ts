import Card from "./data/Card";

export default class Hand {
  private readonly cards: Card[];

  constructor(cards: Card[] = []) {
    this.cards = cards;
  }

  draw(cardIndex: number): Card | null {
    if (cardIndex >= this.cards.length) {
      return null;
    }
    return this.cards.splice(cardIndex, 1)[0];
  }

  push(...cards: Card[]): void {
    this.cards.push(...cards);
  }

  getCards(): Card[] {
    return this.cards;
  }

  countCards(): number {
    return this.cards.length;
  }
}
