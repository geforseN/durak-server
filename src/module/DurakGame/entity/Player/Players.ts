import assert from "node:assert";
import PlayersManager from "../PlayersManager";
import { Attacker, Defender, Player, SuperPlayer } from "./index";
import GamePlayerService from "./Player.service";
import { LobbyUser } from "../../../Lobbies/lobbies.namespace";

export default class Players {
  __value: Player[];
  manager: PlayersManager;

  constructor(arg: LobbyUser[] | Players) {
    if (arg instanceof Players) {
      this.__value = [...arg].filter((player) => {
        if (!player.hand.isEmpty) {
          return true;
        }
        arg.manager.remove({ player });
        return false;
      });
      this.manager = arg.manager;
    } else {
      this.__value = arg.map((user) => new Player(user));
      this.manager = new PlayersManager(this);
    }
  }

  *[Symbol.iterator]() {
    yield* this.__value;
  }

  get count() {
    return this.__value.length;
  }

  get attacker(): Attacker {
    const attacker = this.get(Attacker);
    assert.ok(attacker, "Атакующий не найден");
    return attacker;
  }

  get defender(): Defender {
    const defender = this.get(Defender);
    assert.ok(defender, "Защищающийся не найден");
    return defender;
  }

  getPlayer({ id }: { id: string }): Player {
    // used Symbol.iterator here
    const player = [...this].find(Player.hasSameId, { id });
    assert.ok(player, "Игрок не найден");
    return player;
  }

  isDefender(player: Player): player is Defender {
    return player instanceof Defender;
  }

  isSuperPlayer(player: Player): player is SuperPlayer {
    return player instanceof SuperPlayer;
  }

  private get<Player extends SuperPlayer>(Player: {
    new (...arg: any): Player;
  }): Player | undefined {
    // used Symbol.iterator here
    for (const player of this) {
      if (player instanceof Player) return player;
    }
  }

  injectService(service: GamePlayerService) {
    // used Symbol.iterator here
    [...this].forEach((player) => player.injectService(service));
  }
}
