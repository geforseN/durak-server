import type { GameSettings } from "@durak-game/durak-dts";
import DurakGame from "@/module/DurakGame/DurakGame.js";
import { Desk, GameRound } from "@/module/DurakGame/entity/index.js";
import DeskSlots from "@/module/DurakGame/entity/DeskSlots/index.js";
import { EmptyMoves } from "@/module/DurakGame/entity/GameRound/Moves.js";

export default class CleanDurakGame extends DurakGame {
  constructor(id: string, settings: GameSettings) {
    super(
      id,
      settings,
      new GameRound(0, new Desk(new DeskSlots([])), new EmptyMoves(), this),
    );
  }
}
