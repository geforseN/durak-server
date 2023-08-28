import type LobbyUser from "../../../Lobbies/entity/LobbyUser";

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

export default NonStartedGameUser;
