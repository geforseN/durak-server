import GameRound from "@/module/DurakGame/entity/GameRound/index.js";
import Desk from "@/module/DurakGame/entity/Desk/index.js";
import { EmptyMoves } from "@/module/DurakGame/entity/GameRound/Moves.js";
import Players from "@/module/DurakGame/entity/Players/Players.js";
import type { GameSettings } from "@durak-game/durak-dts";
import { Player } from "@/module/DurakGame/entity/Player/Player.js";
import type NonStartedGameUser from "@/module/DurakGame/entity/Player/NonStartedGameUser.js";

export default class StartingDurakGame {
  round;
  players;

  constructor(
    readonly settings: GameSettings,
    players: NonStartedGameUser[],
  ) {
    const foo = players.map(Player.create)
    this.players = new Players(players.map(Player.create));
    this.round = new GameRound(
      1,
      Desk.clean(this.settings.desk.slotCount),
      new EmptyMoves(),
      this,
    );
  }

  start() {
    const admin = this.players.get((player) => player.info.isAdmin);
    this.players
      .mutateWith(admin.left.asDefender())
      .mutateWith(this.players.defender.right.asAttacker().asAllowed(this));
    // TODO: return timer
  }
}
