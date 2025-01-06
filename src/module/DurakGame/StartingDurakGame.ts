import GameRound from "@/module/DurakGame/entity/GameRound/index.js";
import Desk from "@/module/DurakGame/entity/Desk/index.js";
import { EmptyMoves } from "@/module/DurakGame/entity/GameRound/Moves.js";
import Players from "@/module/DurakGame/entity/Players/Players.js";
import type { GameSettings } from "@durak-game/durak-dts";
import type NonStartedGameUser from "@/module/DurakGame/entity/Player/NonStartedGameUser.js";
import TalonInitialDistribution from "@/module/DurakGame/entity/Deck/Talon/talon-initial-distribution.js";

export default class StartingDurakGame {
  round;
  players;

  talon = {
    self,
    distribution: {
      execute() {
        new TalonInitialDistribution();
      },
    },
  };

  constructor(
    readonly settings: GameSettings,
    players: NonStartedGameUser[],
  ) {
    const foo = players.map(Player.create);
    this.players = new Players(players.map(Player.create));
    this.round = new GameRound(
      1,
      Desk.clean(this.settings.desk.slotCount),
      new EmptyMoves(),
      this,
    );
  }

  toStarted() {
    new TalonInitialDistribution(
      this.talon,
      this.settings.talon.count,
      this.players,
    ).execute();
    const admin = this.players.get((player) => player.id === this.adminId);
    const players = this.players
      .with(new Defender(admin.left))
      .with(new Allowed(new Attacker(this.players.defender.right)));
    return {
      players,
    };
  }
}
