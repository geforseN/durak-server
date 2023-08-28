import type { AllowedMissingCardCount } from "@durak-game/durak-dts";
import type LobbyUser from "../../../Lobbies/entity/LobbyUser";
import type DurakGame from "../../DurakGame";
import type Card from "../Card";
import { Hand } from "../Deck";
import Attacker from "./Attacker";
import Defender from "./Defender";
import GamePlayerWebsocketService from "./Player.service";
import SuperPlayer from "./SuperPlayer";

export const GOOD_CARD_AMOUNT = 6 as const;

export default class Player {
  readonly info: LobbyUser;
  readonly hand: Hand;
  left!: Player;
  right!: Player;
  protected readonly wsService: GamePlayerWebsocketService;

  constructor(player: Player);
  constructor(
    nonStartedGamePlayer: NonStartedGameUser,
    add: [GamePlayerWebsocketService, Hand],
  );
  constructor(
    nonStartedGameUserOrChangeKindPlayer: NonStartedGameUser | Player,
    add?: [GamePlayerWebsocketService, Hand],
  ) {
    this.info = nonStartedGameUserOrChangeKindPlayer.info;
    if (
      nonStartedGameUserOrChangeKindPlayer instanceof NonStartedGameUser &&
      add
    ) {
      const [wsService, hand] = add;
      this.wsService = wsService;
      this.hand = hand;
    } else if (nonStartedGameUserOrChangeKindPlayer instanceof Player) {
      const changeKindPlayer = nonStartedGameUserOrChangeKindPlayer;
      this.hand = changeKindPlayer.hand;
      this.left = changeKindPlayer.left;
      this.right = changeKindPlayer.right;
      if (this.left) this.left.right = this;
      if (this.right) this.right.left = this;
      this.wsService = changeKindPlayer.wsService;
      this.wsService.emitOwnKind(this);
    } else throw new Error();
  }

  receiveCards(...cards: Card[]): void {
    this.hand.receive(...cards);
    this.wsService?.receiveCards({ player: this, cards });
  }

  get id(): string {
    return this.info.id;
  }

  get missingNumberOfCards(): AllowedMissingCardCount {
    return Math.max(
      GOOD_CARD_AMOUNT - this.hand.count,
      0,
    ) as AllowedMissingCardCount;
  }

  canTakeMore(cardCount: number) {
    return this.hand.count > cardCount;
  }

  isDefender(): this is Defender {
    return false;
  }

  isAttacker(): this is Attacker {
    return false;
  }

  isSuperPlayer(): this is SuperPlayer {
    return this.isAttacker() || this.isDefender();
  }

  exitGame(game: DurakGame) {
    this.left.right = this.right;
    this.right.left = this.left;
    const me = game.initialPlayers.find((player) => player.id === this.id);
    if (me) {
      me.roundLeftNumber = game.round.number;
      me.place = ++game.leftPlayersCount;
    }
    return this.wsService?.exitGame(this);
  }
}

// TODO: rework Player constructor, code is hard to understand
// can create another classes (NonStartedGameUser, NonLinkedPlayer)
// NOTE: do not forget about SuperPlayer & check Players#defender Players#attacker

// ! NonStartedGameUser should not extends Player !
export class NonStartedGameUser {
  info;

  constructor(lobbyUser: LobbyUser) {
    this.info = lobbyUser;
  }
}

export class NonLinkedGamePlayer extends Player {
  constructor(
    user: NonStartedGameUser,
    wsService: GamePlayerWebsocketService,
    hand = new Hand(),
  ) {
    super(user, [wsService, hand]);
  }
}

export class StartedGamePlayer extends Player {
  /** TODO: make StartedGamePlayer works!
   *  NOTE: it can be impossible or i can not get how to make it
   */
  constructor(player: Player, left: Player, right: Player) {
    super(player /*, left, right*/);
  }
}
