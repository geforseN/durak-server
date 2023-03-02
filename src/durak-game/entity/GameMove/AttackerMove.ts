import Attacker from "../Players/Attacker";
import { GameMove, GameMoveConstructorArgs } from "./GameMove";

export type AttackerMoveConstructorArgs = GameMoveConstructorArgs<Attacker>;

export class AttackerMove extends GameMove {
  constructor({ number, allowedPlayer, deskCardCount }: GameMoveConstructorArgs<Attacker>) {
    super({ number, allowedPlayer, deskCardCount });
  }
}