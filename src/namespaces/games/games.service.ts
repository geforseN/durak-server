import { GamesIO } from "./games.types";
import { GameId, gamesNamespace, io } from "../../index";
import { LobbyUserIdentifier } from "../lobbies/entity/lobby-users";
import Card from "../../durak-game/entity/Card";

export class GamesService {
  private namespace: GamesIO.NamespaceIO;

  constructor(gameId: GameId) {
    this.namespace = io.of(gameId);
  }

  insertAttackCard({ card, index }: { card: Card, index: number }){
    gamesNamespace.emit("desk__insertAttackCard", card, index);
  }

  insertDefendCard({ card, index }: { card: Card, index: number }){
    gamesNamespace.emit("desk__insertDefendCard", card, index);
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