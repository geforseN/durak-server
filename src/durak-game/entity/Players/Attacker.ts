import Player, { CardPut, CardRemove, MoveStop } from "./Player";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import Card from "../Card";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame from "../../durak-game";

export default class Attacker extends Player implements CardPut, CardRemove, MoveStop {
  constructor(player: Player) {
    super(player);
  }

  putCardOnDesk(
    { game, card, slotIndex, socket }: PlaceCardData & GameSocket,
  ): void | never {
    game.desk.assertCanPut({ attackCard: card, slotIndex });
    game.removeCard({ player: this, card, socket });
    game.insertAttackCardOnDesk({ index: slotIndex, card, socket });
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }

  stopMove({ game }: { game: DurakGame }) {
    const attacker = this;
    const _defender = game.players.tryGetPlayer({ accname: game.round.originalDefenderAccname });
    const sameCardCount = game.desk.hasSameCardCount(game.round.lastCardCount ?? 0);
    if (attacker.hand.count === 0) letNextPlayerTurn(); // or let defender won
    if (attacker.hand.count && (game.desk.isEmpty || sameCardCount)) throw new Error("Киньте хотя-бы одну карту");
  }
}

function _cantMove({ game, attacker }: { game: DurakGame, attacker: Attacker }) {
  const isOriginalAttacker = game.round.originalAttackerAccname === attacker.info.accname;
  const sameCardCount = game.round.lastCardCount === game.desk.cardCount;

  if (isOriginalAttacker && sameCardCount) {
    const defender = attacker.right;
    if (game.players.isDefender(defender))
      game.handleSuccesfullDefense({ defender });
    else throw new Error("HOW");
  }
}

function letNextPlayerTurn() {

}