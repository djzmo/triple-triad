import "phaser";
import random from "random";
import shuffle from "shuffle-array";
import AI from "../lib/ai/AI";
import TacticalAI from "../lib/ai/TacticalAI";
import Board from "../lib/Board";
import CaptureResult from "../lib/data/CaptureResult";
import Card from "../lib/data/Card";
import Combo from "../lib/data/Combo";
import Deck from "../lib/Deck";
import Element from "../lib/data/Element";
import Hand from "../lib/Hand";
import Player from "../lib/data/Player";
import TurnShapeObject from "../objects/TurnShapeObject";
import CardObject from "../objects/CardObject";
import CursorObject from "../objects/CursorObject";
import HandObject from "../objects/HandObject";
import BaseSound = Phaser.Sound.BaseSound;
import BitmapText = Phaser.GameObjects.BitmapText;
import Sprite = Phaser.GameObjects.Sprite;
import KeyboardPlugin = Phaser.Input.Keyboard.KeyboardPlugin;

enum State {
  WAIT,
  SELECT_CARD,
  SELECT_CELL,
}

export default class BoardScene extends Phaser.Scene {
  private ai: AI;
  private board: Board;
  private playerHand: Hand;
  private opponentHand: Hand;
  private playerScore: number;
  private opponentScore: number;
  private currentTurn: Player;
  private selectedCardIndex: number;
  private selectedCellIndex: number;
  private state: State;

  private playerHandObject: HandObject;
  private opponentHandObject: HandObject;
  private playerScoreText: BitmapText;
  private opponentScoreText: BitmapText;
  private bgmSound: BaseSound;
  private cancelSound: BaseSound;
  private captureSound: BaseSound;
  private comboSound: BaseSound;
  private forbiddenSound: BaseSound;
  private selectSound: BaseSound;
  private backgroundSprite: Sprite;
  private boardCursor: CursorObject;
  private cardCursor: CursorObject;
  private turnShape: TurnShapeObject;
  private cellObjects: CardObject[];
  private elementModifierSprites: Sprite[];
  private elementSprites: Sprite[];
  private captureSameSprite: Sprite;
  private capturePlusSprite: Sprite;
  private captureComboSprite: Sprite;
  private resultDrawSprite: Sprite;
  private resultLoseSprite: Sprite;
  private resultWinSprite: Sprite;

  constructor() {
    super("BoardScene");
    this.endTurn = this.endTurn.bind(this);
    this.onUpKeyUp = this.onUpKeyUp.bind(this);
    this.onDownKeyUp = this.onDownKeyUp.bind(this);
    this.onLeftKeyUp = this.onLeftKeyUp.bind(this);
    this.onRightKeyUp = this.onRightKeyUp.bind(this);
    this.onEnterKeyUp = this.onEnterKeyUp.bind(this);
    this.onEscapeKeyUp = this.onEscapeKeyUp.bind(this);

    this.ai = new TacticalAI();
  }

  reset(): void {
    if (this.board) {
      delete this.board;
    }

    if (this.playerHand) {
      delete this.playerHand;
    }

    if (this.opponentHand) {
      delete this.opponentHand;
    }

    if (this.cellObjects?.length) {
      for (const object of this.cellObjects) {
        if (object) {
          object.destroy();
        }
      }
    }

    this.board = new Board({
      open: true,
      elemental: true,
      suddenDeath: false,
      random: false,
      same: true,
      plus: true,
      combo: true,
    });

    this.playerHand = new Hand();
    this.opponentHand = new Hand();

    this.elementSprites = [];
    this.selectedCardIndex = 0;
    this.selectedCellIndex = 4;
    this.state = State.WAIT;
    this.cellObjects = [];
    this.elementModifierSprites = [];

    for (let i = 0; i < 9; i++) {
      this.cellObjects.push(null);
      this.elementModifierSprites.push(null);
    }
  }

  preload(): void {
    this.reset();

    this.currentTurn =
      random.int(1, 10) % 2 === 0 ? Player.SELF : Player.OPPONENT;

    this.load.audio("bgm", ["assets/sounds/shuffle-or-boogie.ogg"]);
    this.load.audio("card", ["assets/sounds/card.wav"]);
    this.load.audio("cancel", ["assets/sounds/cancel.wav"]);
    this.load.audio("capture", ["assets/sounds/capture.wav"]);
    this.load.audio("combo", ["assets/sounds/combo.wav"]);
    this.load.audio("forbidden", ["assets/sounds/forbidden.wav"]);
    this.load.audio("select", ["assets/sounds/select.wav"]);
    this.load.audio("spread", ["assets/sounds/spread.wav"]);

    this.load.atlas(
      "element-earth",
      "assets/elements/earth.png",
      "assets/elements/earth.json"
    );
    this.load.atlas(
      "element-fire",
      "assets/elements/fire.png",
      "assets/elements/fire.json"
    );
    this.load.atlas(
      "element-holy",
      "assets/elements/holy.png",
      "assets/elements/holy.json"
    );
    this.load.atlas(
      "element-ice",
      "assets/elements/ice.png",
      "assets/elements/ice.json"
    );
    this.load.atlas(
      "element-poison",
      "assets/elements/poison.png",
      "assets/elements/poison.json"
    );
    this.load.atlas(
      "element-thunder",
      "assets/elements/thunder.png",
      "assets/elements/thunder.json"
    );
    this.load.atlas(
      "element-water",
      "assets/elements/water.png",
      "assets/elements/water.json"
    );
    this.load.atlas(
      "element-wind",
      "assets/elements/wind.png",
      "assets/elements/wind.json"
    );

    this.load.image("board", "assets/bg-board.jpg");
    this.load.image("card-back", "assets/card-back.png");
    this.load.image("cursor", "assets/cursor.png");
    this.load.image("capture-same", "assets/capture-same.png");
    this.load.image("capture-plus", "assets/capture-plus.png");
    this.load.image("capture-combo", "assets/capture-combo.png");
    this.load.image(
      "element-positive-text",
      "assets/element-positive-text.png"
    );
    this.load.image(
      "element-negative-text",
      "assets/element-negative-text.png"
    );
    this.load.image("result-draw", "assets/result-draw.png");
    this.load.image("result-lose", "assets/result-lose.png");
    this.load.image("result-win", "assets/result-win.png");

    this.load.bitmapFont(
      "rank-text",
      "assets/rank-text.png",
      "assets/rank-text.xml"
    );
    this.load.bitmapFont(
      "score-text",
      "assets/score-text.png",
      "assets/score-text.xml"
    );

    const shuffledDeck = shuffle(Deck.slice(0));
    this.playerHand.push(...shuffledDeck.slice(0, 5));
    this.opponentHand.push(...shuffledDeck.slice(5, 10));

    for (const card of [
      ...this.playerHand.getCards(),
      ...this.opponentHand.getCards(),
    ]) {
      this.load.image("card." + card.id, "assets/cards/" + card.id + ".png");
    }

    this.playerScore = this.playerHand.countCards();
    this.opponentScore = this.opponentHand.countCards();
  }

  create(): void {
    this.bgmSound = this.sound.add("bgm");
    this.cancelSound = this.sound.add("cancel");
    this.captureSound = this.sound.add("capture");
    this.comboSound = this.sound.add("combo");
    this.selectSound = this.sound.add("select");
    this.forbiddenSound = this.sound.add("forbidden");

    if (!this.bgmSound.isPlaying) {
      this.bgmSound.play({ loop: true });
    }

    for (const value in Element) {
      this.anims.create({
        key: "element-" + value.toLowerCase(),
        frames: this.anims.generateFrameNames("element-" + value.toLowerCase()),
        repeat: -1,
        duration: 750,
      });
    }

    this.backgroundSprite = this.add.sprite(0, 0, "board").setOrigin(0);

    for (const index in this.board.getCells()) {
      const cell = this.board.getCells()[index];
      if (cell.element == null) {
        continue;
      }

      const elementName = Element[cell.element].toLowerCase();
      this.elementSprites.push(
        this.add
          .sprite(
            this.getCellX(Number(index)),
            this.getCellY(Number(index)),
            "element-" + elementName
          )
          .setScale(0.5)
          .setAlpha(0.75)
          .play("element-" + elementName)
      );
    }

    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    const playerHandX = gameWidth - gameWidth / 15 - CardObject.CARD_WIDTH_PX;
    const opponentHandX = gameWidth / 15;

    this.playerHandObject = new HandObject(
      this,
      this.playerHand.getCards(),
      Player.SELF,
      true,
      true,
      playerHandX,
      50
    );
    this.opponentHandObject = new HandObject(
      this,
      this.opponentHand.getCards(),
      Player.OPPONENT,
      this.board.getRule().open,
      true,
      opponentHandX,
      50
    );
    this.turnShape = new TurnShapeObject(this, CardObject.CARD_WIDTH_PX);
    this.boardCursor = new CursorObject(this, 0, 0, "cursor")
      .setScale(0.25, 0.25)
      .setOrigin(1);
    this.cardCursor = new CursorObject(this, 0, 0, "cursor")
      .setScale(0.25, 0.25)
      .setOrigin(1);
    this.captureSameSprite = this.add
      .sprite(gameWidth + 512, gameHeight / 2, "capture-same")
      .setScale(0.75);
    this.capturePlusSprite = this.add
      .sprite(gameWidth + 512, gameHeight / 2, "capture-plus")
      .setScale(0.75);
    this.captureComboSprite = this.add
      .sprite(gameWidth + 512, gameHeight / 2, "capture-combo")
      .setScale(0.75);
    this.resultDrawSprite = this.add
      .sprite(gameWidth / 2, gameHeight / 2, "result-draw")
      .setAlpha(0)
      .setDepth(1);
    this.resultLoseSprite = this.add
      .sprite(gameWidth / 2, gameHeight / 2, "result-lose")
      .setAlpha(0)
      .setDepth(1);
    this.resultWinSprite = this.add
      .sprite(gameWidth / 2, gameHeight / 2, "result-win")
      .setAlpha(0)
      .setDepth(1);

    this.playerScoreText = this.add
      .bitmapText(
        playerHandX + CardObject.CARD_WIDTH_PX / 2 - 20,
        gameHeight - 90,
        "score-text",
        this.playerScore.toString(),
        75
      )
      .setOrigin(0);
    this.opponentScoreText = this.add
      .bitmapText(
        opponentHandX + CardObject.CARD_WIDTH_PX / 2 - 20,
        gameHeight - 90,
        "score-text",
        this.opponentScore.toString(),
        75
      )
      .setOrigin(0.5);

    this.boardCursor.hide();
    this.cardCursor.hide();

    this.cameras.main.on("camerafadeincomplete", () => {
      this.spread();
    });

    this.cameras.main.on("camerafadeoutcomplete", () => {
      this.reset();
      this.scene.restart();
    });

    this.cameras.main.fadeIn(500);
    this.createInput();
  }

  spread(): void {
    this.opponentHandObject.spread({
      onComplete: () => {
        this.playerHandObject.spread({
          onComplete: () => {
            this.turnShape.randomizeTurn(this.currentTurn, {
              onComplete: () => {
                if (this.currentTurn === Player.SELF) {
                  this.cardCursor.show();
                  this.selectCard(0, Player.SELF);
                  this.state = State.SELECT_CARD;
                } else {
                  this.moveOpponent();
                }
              },
            });
          },
        });
      },
    });
  }

  endMatch(): void {
    const resultSprite =
      this.playerScore === this.opponentScore
        ? this.resultDrawSprite
        : this.playerScore < this.opponentScore
        ? this.resultLoseSprite
        : this.resultWinSprite;

    this.tweens.add({
      targets: resultSprite,
      alpha: 1,
      hold: 1000,
      duration: 1000,
      onComplete: () => this.cameras.main.fadeOut(1000),
    });
  }

  endTurn(): void {
    if (this.board.isFullyOccupied()) {
      this.endMatch();
      return;
    }

    if (this.currentTurn === Player.SELF) {
      if (!this.opponentHand.getCards().length) {
        this.endMatch();
        return;
      }

      this.currentTurn = Player.OPPONENT;
      this.selectedCardIndex = 0;
      this.turnShape.switchTurn(this.currentTurn);
      this.moveOpponent();
    } else {
      if (!this.playerHand.getCards().length) {
        this.endMatch();
        return;
      }

      this.currentTurn = Player.SELF;
      this.cardCursor.show();
      this.state = State.SELECT_CARD;
      this.turnShape.switchTurn(this.currentTurn);
      this.selectCard(0, Player.SELF);
    }
  }

  showCaptureCombo(
    combo: Combo,
    holdMs = 0,
    onHold?: () => void,
    onComplete?: () => void
  ): void {
    const sprite =
      combo === Combo.SAME
        ? this.captureSameSprite
        : combo === Combo.PLUS
        ? this.capturePlusSprite
        : this.captureComboSprite;

    const timeline = this.tweens.createTimeline();
    timeline.add({
      targets: sprite,
      x: this.cameras.main.width / 2,
      hold: holdMs / 2,
      duration: 100,
      onComplete: onHold,
    });
    timeline.add({
      targets: sprite,
      x: -512,
      delay: holdMs / 2,
      duration: 100,
      onComplete: () => {
        sprite.setX(this.cameras.main.width + 512);
        if (onComplete) {
          onComplete();
        }
      },
    });
    timeline.play();
  }

  selectCard(index: number, owner: Player): void {
    if (owner === Player.SELF) {
      this.playerHandObject.select(index, this.cardCursor);
    } else {
      this.opponentHandObject.select(index);
    }
  }

  selectCell(index: number): void {
    this.boardCursor.setPosition(this.getCellX(index), this.getCellY(index));
  }

  putCardAtCell(
    cellIndex: number,
    card: Card,
    owner: Player,
    onComplete?: (result: CaptureResult[]) => void
  ): void {
    if (
      cellIndex < 0 ||
      cellIndex >= this.cellObjects.length ||
      this.cellObjects[cellIndex]
    ) {
      return;
    }

    const result = this.board.put(cellIndex, card, owner);

    this.cellObjects[cellIndex] = new CardObject(
      this,
      card,
      owner,
      true,
      this.cameras.main.width / 2,
      -this.cameras.main.height
    );

    this.reorderCellCards([this.cellObjects[cellIndex]]);

    const cellX = this.getCellX(cellIndex) - CardObject.CARD_WIDTH_PX / 2;
    const cellY = this.getCellY(cellIndex) - CardObject.CARD_HEIGHT_PX / 2;
    this.tweens.add({
      targets: this.cellObjects[cellIndex],
      x: cellX,
      y: cellY,
      duration: 500,
      onComplete: () => {
        const cellElement = this.board.getCells()[cellIndex].element;
        const elementModifierTexture =
          cellElement != card.element
            ? "element-negative-text"
            : "element-positive-text";
        if (cellElement != null) {
          this.elementModifierSprites[cellIndex] = this.add
            .sprite(
              cellX + CardObject.CARD_WIDTH_PX / 2,
              cellY + CardObject.CARD_HEIGHT_PX / 2,
              elementModifierTexture
            )
            .setScale(0.5);
        }

        if (onComplete) {
          onComplete(result);
        }
      },
    });
  }

  reorderCellCards(expose: CardObject[]): void {
    for (const cardObject of expose) {
      this.children.sendToBack(cardObject);
    }

    this.cellObjects.map((object) => {
      if (object && !expose.includes(object)) {
        this.children.sendToBack(object);
      }
    });

    for (const elementSprite of this.elementSprites) {
      this.children.sendToBack(elementSprite);
    }

    this.children.sendToBack(this.backgroundSprite);
  }

  moveOpponent(): void {
    const { targetCellIndex, selectedCardIndex } =
      this.ai.calculate(this.board, this.opponentHand) || {};
    if (targetCellIndex == null) {
      return;
    }
    this.selectCard(0, Player.OPPONENT);
    this.opponentHandObject.thinkingSelect(selectedCardIndex, {
      onComplete: () => {
        this.opponentHandObject.draw(selectedCardIndex, {
          onComplete: () => {
            const selectedCard = this.opponentHand.draw(selectedCardIndex);
            this.putCardAtCell(
              targetCellIndex,
              selectedCard,
              Player.OPPONENT,
              (result) => this.applyResult(result, this.endTurn)
            );
          },
        });
      },
    });
  }

  applyResult(resultList: CaptureResult[], onComplete?: () => void): void {
    if (!resultList.length) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const applyIndex = (index) => {
      const result = resultList[index];

      this.captureSound.play();
      const cardObjects = result.capturedCellIndices.map(
        (index) => this.cellObjects[index]
      );
      this.reorderCellCards(cardObjects);

      for (const cellIndex of result.capturedCellIndices) {
        if (!this.elementModifierSprites[cellIndex]) {
          continue;
        }

        this.tweens.add({
          targets: this.elementModifierSprites[cellIndex],
          alpha: 0,
          duration: 200,
          yoyo: true,
        });
      }

      let completedFlip = 0;
      const onFlipComplete = () => {
        completedFlip++;
        if (completedFlip < cardObjects.length) {
          return;
        }

        if (result.newOwner === Player.SELF) {
          this.playerScore += result.capturedCellIndices.length;
          this.opponentScore -= result.capturedCellIndices.length;
        } else {
          this.playerScore -= result.capturedCellIndices.length;
          this.opponentScore += result.capturedCellIndices.length;
        }

        this.playerScoreText.setText(this.playerScore.toString());
        this.opponentScoreText.setText(this.opponentScore.toString());

        if (index < resultList.length - 1) {
          applyIndex(index + 1);
        } else {
          if (onComplete) {
            onComplete();
          }
        }
      };

      for (const cardObject of cardObjects) {
        cardObject.toggleOwnerFlip(result.newOwner, {
          onComplete: onFlipComplete,
        });
      }

      if (index > 0 && result.combo != null) {
        this.showCaptureCombo(result.combo, 200);
      }
    };

    if (resultList[0].combo != null) {
      this.comboSound.play();
      this.showCaptureCombo(resultList[0].combo, 400, () => applyIndex(0));
    } else {
      applyIndex(0);
    }
  }

  onUpKeyUp(): KeyboardPlugin {
    if (this.state === State.WAIT) {
      return;
    } else if (this.state === State.SELECT_CARD) {
      this.selectedCardIndex--;
      if (this.selectedCardIndex < 0) {
        this.selectedCardIndex = this.playerHand.getCards().length - 1;
      }
      this.selectSound.play();
      this.selectCard(this.selectedCardIndex, Player.SELF);
    } else if (this.state === State.SELECT_CELL) {
      this.selectedCellIndex -= 3;
      if (this.selectedCellIndex < 0) {
        this.selectedCellIndex += 9;
      }
      this.selectSound.play();
      this.selectCell(this.selectedCellIndex);
    }
  }

  onDownKeyUp(): KeyboardPlugin {
    if (this.state === State.WAIT) {
      return;
    } else if (this.state === State.SELECT_CARD) {
      this.selectedCardIndex++;
      if (this.selectedCardIndex >= this.playerHand.getCards().length) {
        this.selectedCardIndex = 0;
      }
      this.selectSound.play();
      this.selectCard(this.selectedCardIndex, Player.SELF);
    } else if (this.state === State.SELECT_CELL) {
      this.selectedCellIndex += 3;
      if (this.selectedCellIndex >= 9) {
        this.selectedCellIndex %= 3;
      }
      this.selectSound.play();
      this.selectCell(this.selectedCellIndex);
    }
  }

  onLeftKeyUp(): KeyboardPlugin {
    if (this.state === State.WAIT) {
      return;
    } else if (this.state === State.SELECT_CELL) {
      if (this.selectedCellIndex % 3 === 0) {
        this.selectedCellIndex += 2;
      } else {
        this.selectedCellIndex--;
      }
      this.selectSound.play();
      this.selectCell(this.selectedCellIndex);
    }
  }

  onRightKeyUp(): KeyboardPlugin {
    if (this.state === State.WAIT) {
      return;
    } else if (this.state === State.SELECT_CELL) {
      if (this.selectedCellIndex % 3 === 2) {
        this.selectedCellIndex -= 2;
      } else {
        this.selectedCellIndex++;
      }
      this.selectSound.play();
      this.selectCell(this.selectedCellIndex);
    }
  }

  onEnterKeyUp(): KeyboardPlugin {
    if (this.state === State.WAIT) {
      return;
    } else if (this.state === State.SELECT_CARD) {
      this.cardCursor.hold();
      this.boardCursor.show();
      this.selectSound.play();
      this.selectedCellIndex = 4;
      this.selectCell(this.selectedCellIndex);
      this.state = State.SELECT_CELL;
    } else if (this.state === State.SELECT_CELL) {
      if (this.cellObjects[this.selectedCellIndex]) {
        this.forbiddenSound.play();
        return;
      }

      this.cardCursor.release();
      this.cardCursor.hide();
      this.boardCursor.hide();
      this.selectSound.play();
      const selectedCard = this.playerHand.draw(this.selectedCardIndex);
      this.state = State.WAIT;
      this.playerHandObject.draw(this.selectedCardIndex, {
        onComplete: () => {
          this.putCardAtCell(
            this.selectedCellIndex,
            selectedCard,
            Player.SELF,
            (result) => this.applyResult(result, this.endTurn)
          );
        },
      });
    }
  }

  onEscapeKeyUp(): KeyboardPlugin {
    if (this.state === State.WAIT) {
      return;
    } else if (this.state === State.SELECT_CELL) {
      this.cardCursor.release();
      this.boardCursor.hide();
      this.cancelSound.play();
      this.state = State.SELECT_CARD;
    }
  }

  private createInput() {
    this.input.keyboard.on("keyup-UP", this.onUpKeyUp);
    this.input.keyboard.on("keyup-DOWN", this.onDownKeyUp);
    this.input.keyboard.on("keyup-LEFT", this.onLeftKeyUp);
    this.input.keyboard.on("keyup-RIGHT", this.onRightKeyUp);
    this.input.keyboard.on("keyup-ENTER", this.onEnterKeyUp);
    this.input.keyboard.on("keyup-ESC", this.onEscapeKeyUp);
  }

  private getCellX(index: number) {
    const centerX = this.cameras.main.width / 2;
    const offsetX = 200 * ((index % 3) - 1);
    return centerX + offsetX;
  }

  private getCellY(index: number) {
    const centerY = this.cameras.main.height / 2;
    const offsetY = 200 * (Math.floor(index / 3) - 1);
    return centerY + offsetY;
  }
}
