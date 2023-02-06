import { LobbyUserIdentifier } from "../../lobbies/entity/lobby-users";
import DurakGame from "../../../durak-game/durak-game";
import Card from "../../../durak-game/entity/card";
import { assertDefenderRole, assertPlayerHasCard } from "./index";

export default function assertBeforeAttack(
  { game, accname, card, slotIndex }: { game: DurakGame, card: Card, slotIndex: number } & LobbyUserIdentifier,
) {
  const player = game.players.getPlayer({ accname });
  assertDefenderRole(player.role);

  assertPlayerHasCard({player, card});

  const { desk } = game;
  const slot = desk.slots[slotIndex];

  if (slot.hasAttackCard) throw new Error("Занято");

  if (desk.isEmpty) return; // OK, CAN PUT ANY CARD

  if (!desk.hasCardWithRank(card.rank)) throw new Error("Нет схожего ранга на доске");
};
