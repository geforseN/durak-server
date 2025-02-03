import type Players from "@/module/DurakGame/entity/Players/Players.js";
import type PlayerWebSocketConnection from "@/modules/durak-game/websocket/player-websocket-connection.js";
import type Player from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import type { GameRestoreStateEventPayload } from "@/utils/durak-game-state-restore-schema.js";
import type { GameSettings } from "@durak-game/durak-dts";

export default class StartedDurakGame {
  constructor(
    public readonly id: string,
    private readonly players: Players,
    private readonly settings: GameSettings,
  ) {}

  connect(connection: PlayerWebSocketConnection) {
    const playerId = connection.belongsTo();
    const player = this.players.find((player) => player.id === playerId);
    connection.send(JSON.stringify(this.#toGameState(player)));
    // TODO: add "message" listener
  }

  #toGameState(_?: Player) {
    return {
      event: "game::state::restore",
      payload: {
        desk: {
          slots: Array.from({ length: 6 }).map((_, index) => ({
            index,
            attackCard: undefined,
            defendCard: undefined,
          })),
        },
        discard: {
          isEmpty: true,
        },
        enemies: [],
        round: {
          number: 1,
        },
        self: {
          isAllowedToMove: false,
          kind: "Player",
          cards: (["6", "7", "8", "9", "10"] as const).map((rank) => ({
            rank: rank,
            suit: "♦",
          })),
          id: "123",
          info: {
            id: "123",
            isAdmin: false,
            profile: {
              connectStatus: "ONLINE",
              nickname: "123",
              personalLink: "123",
              photoUrl: "",
              userId: "123",
              updatedAt: new Date(),
            },
          },
        },
        settings: this.settings,
        talon: {
          hasOneCard: false,
          isEmpty: false,
          trumpCard: {
            rank: "10",
            suit: "♥",
          },
        },
        status: "DELETE_ME",
      } satisfies GameRestoreStateEventPayload,
    };
  }
}
