import { DurakGameSocket } from "@durak-game/durak-dts";

import { default as DurakGameWebsocketService } from "@/module/DurakGame/DurakGame.service.js";
import { default as GameDiscardWebsocketService } from "@/module/DurakGame/entity/Deck/Discard/Discard.service.js";
import { default as GameTalonWebsocketService } from "@/module/DurakGame/entity/Deck/Talon/Talon.service.js";
import { default as GameDeskWebsocketService } from "@/module/DurakGame/entity/Desk/Desk.service.js";
import { default as GamePlayerWebsocketService } from "@/module/DurakGame/entity/Player/Player.service.js";

export function createServices(namespace: DurakGameSocket.Namespace) {
  return {
    deskService: new GameDeskWebsocketService(namespace),
    discardService: new GameDiscardWebsocketService(namespace),
    gameService: new DurakGameWebsocketService(namespace),
    playerService: new GamePlayerWebsocketService(namespace),
    talonService: new GameTalonWebsocketService(namespace),
  };
}

export {
  DurakGameWebsocketService,
  GameDeskWebsocketService,
  GameDiscardWebsocketService,
  GamePlayerWebsocketService,
  GameTalonWebsocketService,
};
