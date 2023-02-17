import { GamesIO, PlayerRole, UIStatus } from "./games.types";
import { LobbyUserIdentifier } from "../lobbies/entity/lobby-users";
import Card from "../../durak-game/entity/Card";
import NotificationAlert from "../../module/notification-alert";
import Player from "../../durak-game/entity/Players/Player";
import Defender from "../../durak-game/entity/Players/Defender";
import Attacker from "../../durak-game/entity/Players/Attacker";
import GameState from "../../durak-game/DTO/GameState";
import DurakGame from "../../durak-game/durak-game";

export type GameSocket = { socket: GamesIO.SocketIO };

export class GameService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  insertAttackCard({ card, index, socket }: { card: Card, index: number } & GameSocket): this {
    socket.broadcast.emit("desk__insertAttackCard", card, index);
    return this;
  }

  insertDefendCard({ card, index, socket }: { card: Card, index: number } & GameSocket): this {
    socket.broadcast.emit("desk__insertDefendCard", card, index);
    return this;
  }

  changeCardCount({ accname, cardCount, socket }: { accname: string, cardCount: number } & GameSocket): this {
    socket.except(accname).emit("enemy__changeCardCount", accname, cardCount);
    return this;
  }

  removeCard({ accname, card, socket }: { accname: string, card: Card } & GameSocket): this {
    socket.to(accname).emit("self__removeCard", card);
    return this;
  }

  setDefendUI(status: UIStatus, defender: Defender): this {
    this.namespace.to(defender.info.accname).emit("defendUI__setStatus", status);
    return this;
  }

  setAttackUI(status: UIStatus, attacker: Attacker): this {
    this.namespace.to(attacker.info.accname).emit("attackUI__setStatus", status);
    return this;
  }

  handleError({ accname, error }: LobbyUserIdentifier & { error: unknown }): this {
    console.log("ERROR: ", error);
    const notification = new NotificationAlert().fromError(error as Error);
    this.namespace.to(accname).emit("notification__send", notification);
    return this;
  }

  clearDesk(): this {
    this.namespace.emit("desk__clear");
    return this;
  }

  pushFromTalon({ player, cards }: { player: Player, cards: Card[] }): this {
    this.namespace.to(player.info.accname).emit("player__receiveCards", cards);
    this.namespace.except(player.info.accname).emit("talon__distributeCards", player.info.accname, cards.length);
    this.namespace.except(player.info.accname).emit("enemy__changeCardCount", player.info.accname, player.hand.count);
    return this;
  }

  pushToDiscard() {
    this.namespace.emit("desk__pushToDiscard")
  }

  lostRound({ defender }: { defender: Defender }): this {
    this.namespace.emit("defender__lostRound", defender.info.accname);
    return this;
  }

  wonRound({ defender }: { defender: Defender }): this {
    this.namespace.emit("defender__wonRound", defender.info.accname);
    return this;
  }

  moveTrumpCard({ receiver }: { receiver: Player }): this {
    this.namespace.emit("talon__moveTrumpCardTo", receiver.info.accname);
    return this;
  }

  changeRoleTo(role: PlayerRole, player: Player): this {
    this.namespace.emit("player__changeRole", role, player.info.accname);
    return this;
  }

  restoreState({ socket, game, accname }: { game: DurakGame } & LobbyUserIdentifier & GameSocket): this {
    socket.emit("state__restore", new GameState(game, accname));
    socket.emit("talon__showTrumpCard", game.talon.trumpCard);
    return this;
  }
}