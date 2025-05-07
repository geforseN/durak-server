import assert from "node:assert";
import type { GameSettings } from "@durak-game/durak-dts";
import type PlayerWebSocketConnection from "@/modules/durak-game/websocket/player-websocket-connection.js";
import NonStartedGamePlayersConnections from "@/modules/durak-game/non-started/players-connections.js";
import NonStartedDurakGame from "@/modules/durak-game/non-started/NonStartedDurakGame.js";
import Connections from "@/modules/abstract/connections.js";
import Goal from "@/modules/abstract/goal.js";
import type LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";

export default function makeNonStartedDurakGame({
  id,
  settings,
  lobbyUsers,
}: {
  id: string;
  settings: GameSettings;
  lobbyUsers: readonly LobbyUser[];
}) {
  assert.ok(lobbyUsers.length === settings.players.count);
  return new NonStartedDurakGame(
    id,
    settings,
    new NonStartedGamePlayersConnections(
      new Connections<PlayerWebSocketConnection>(),
      lobbyUsers,
      new Goal(settings.players.count),
    ),
  );
}
