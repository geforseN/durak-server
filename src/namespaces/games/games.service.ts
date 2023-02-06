import { GamesIO } from "./games.types";
import { GameId, io } from "../../index";
import { LobbyUserIdentifier } from "../lobbies/entity/lobby-users";

export class GamesService {
  private namespace: GamesIO.NamespaceIO;

  constructor(gameId: GameId) {
    this.namespace = io.of(gameId);
  }

  hideAttackUI({ accname }: LobbyUserIdentifier) {
    this.namespace.to(accname).emit("attackUI__shouldShow", false);
  }

  revealAttackUI({ accname }: LobbyUserIdentifier) {
    this.namespace.to(accname).emit("attackUI__shouldShow", true);
  }

  hideDefenderUI({ accname }: LobbyUserIdentifier) {
    this.namespace.to(accname).emit("defendUI__shouldShow", false);
  }

  revealDefenderUI({ accname }: LobbyUserIdentifier) {
    this.namespace.to(accname).emit("defendUI__shouldShow", true);
  }
}