import assert from "node:assert";
import DefenderMove from "./DefenderMove";
import { Attacker, Defender } from "../../Player";
import { insertCardStrategy } from "../../GameRound";
import type Card from "../../Card";
import { type AfterHandler } from "../GameMove.abstract";

type ConstructorArg = ConstructorParameters<typeof DefenderMove>[number] & {
  card: Card;
  slotIndex: number;
};

export class TransferMove extends DefenderMove implements AfterHandler {
  card: Card;
  slotIndex: number;

  constructor({ game, player, card, slotIndex }: ConstructorArg) {
    super({ game, player });
    this.card = player.removeCard(card);
    this.slotIndex = slotIndex;
    this.isInsertMove = true;
    this.#insertCard();
  }

  #insertCard() {
    return insertCardStrategy.call(this);
  }

  handleAfterMoveIsDone() {
    // TODO: fix hard to catch bug in this.#defeaultBeheviour
    // should be this.#defaultBehaviour redefined
    // when this.player become Attacker (code line below)
    // or should just clearInterval(this.defaultBehaviour)
    assert.ok(this.player instanceof Defender);
    this.game.players.attacker = this.player;
    assert.ok(this.player instanceof Attacker);
    return this.game.round.giveAttackerLeftDefend();
  }
}
