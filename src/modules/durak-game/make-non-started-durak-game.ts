import type { GameSettings } from "@durak-game/durak-dts";
import type PlayerWebSocketConnection from "@/module/DurakGame/player-websocket-connection.js";
import NonStartedGamePlayersConnections from "@/module/DurakGame/non-started-game-players-connections.js";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import Connections from "@/modules/abstract/connections.js";
import Goal from "@/modules/abstract/goal.js";

export default function makeNonStartedDurakGame({
  id,
  settings,
}: {
  id: string;
  settings: GameSettings;
}) {
  return new NonStartedDurakGame(
    id,
    settings,
    new NonStartedGamePlayersConnections(
      new Connections<PlayerWebSocketConnection>(),
      new Goal(settings.players.count),
    ),
  );
}
