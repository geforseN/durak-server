import LobbyUsers, { LobbyUserIdentifier } from "../../namespaces/lobbies/entity/lobby-users";
import CardPlayer from "./card-player";
import Hand from "./Deck/Hand";

export type OtherPlayerInfo = { accname: string, cardCount: number };

export default class CardPlayers {
  __value: CardPlayer[];

  constructor(users: LobbyUsers) {
    this.__value = users.value.map((user) => new CardPlayer(user));
  }

  get count() {
    return this.__value.length;
  }

  get playersIndexes(): { accname: string, index: number }[] {
    return this.__value.map((player, index) => ({ accname: player.info.accname, index }));
  }

  getPlayerByAccname({ accname }: LobbyUserIdentifier): CardPlayer | undefined {
    return this.__value.find((player) => player.info.accname === accname);
  }

  getPlayerHandByAccname({ accname }: LobbyUserIdentifier): Hand | undefined {
    return this.getPlayerByAccname({ accname })?.hand;
  }

  private getAllOtherPlayers({ accname }: LobbyUserIdentifier): CardPlayer[] {
    return this.__value.filter((player) => player.info.accname !== accname);
  }

  getAllOtherPlayersCardsInfo({ accname }: LobbyUserIdentifier): OtherPlayerInfo[] {
    return this.getAllOtherPlayers({ accname }).map((player) => ({
      accname: player.info.accname,
      cardCount: player.hand.count,
    }));
  }
}