import Attacker from "../Players/Attacker";
import { GameMove, GameMoveConstructorArgs } from "./GameMove";

export class AttackerMove extends GameMove {
  constructor({ number, allowedPlayer, deskCardCount }: GameMoveConstructorArgs<Attacker>) {
    super({ number, allowedPlayer, deskCardCount });
  }
}