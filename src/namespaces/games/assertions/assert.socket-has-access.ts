import DurakGame from "../../../durak-game/durak-game";
import { LobbyUserIdentifier } from "../../lobbies/entity/lobby-users";

export default function assertSocketHasAccess(
  { game, accname }: { game: DurakGame } & LobbyUserIdentifier,
) {
  if (!game.players.getPlayer({ accname })) throw new Error("Вас нет в игре");
}