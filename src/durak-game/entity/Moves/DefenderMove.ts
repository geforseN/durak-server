
import Defender from "../Players/Defender";
import { GameMove, GameMoveConstructorArgs } from "./GameMove";

export type DefenderMoveConstructorArgs = GameMoveConstructorArgs<Defender> & { deskCardCount: number };

export class DefenderMove extends GameMove {
  deskCardCount: number;

  constructor({ number, allowedPlayer, ...args }: DefenderMoveConstructorArgs) {
    super({ number, allowedPlayer });
    this.deskCardCount = args.deskCardCount;
  }
}