import { DurakGameSocket } from "../../socket/DurakGameSocket.types";
export default class GamePlayersWebsocketService {
  constructor(public namespace: DurakGameSocket.Namespace) {}
}
