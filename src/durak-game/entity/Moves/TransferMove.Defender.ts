import Card from "../Card";
import Player from "../Players/Player";
import Defender from "../Players/Defender";
import { DefenderMove } from "./DefenderMove";
import { GameMoveConstructorArgs } from "./GameMove";

type TransferMoveConstructorArgs = GameMoveConstructorArgs<Defender> & { card: Card, deskIndex: number, deskCardCount: number };

export class TransferMove extends DefenderMove {
  card: Card;
  slotIndex: number;
  from?: Player;
  to?: Player;

  constructor({ allowedPlayer, deskCardCount, number, ...args }: TransferMoveConstructorArgs) {
    super({ allowedPlayer, deskCardCount, number });
    this.card = args.card;
    this.slotIndex = args.deskIndex;
  }
}