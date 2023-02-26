import Player, { CardPut, CardRemove, MoveStop } from "./Player";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import Card from "../Card";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame, { CardInfo } from "../../durak-game";
import { AttackerMove } from "../Moves/AttackerMove";
import { DefenderMove } from "../Moves/DefenderMove";
import { InsertAttackCardMove } from "../Moves/InsertAttackCardMove";
import { StopAttackMove } from "../Moves/StopAttackMove";
import Defender from "./Defender";

export default class Attacker extends Player implements CardPut, CardRemove, MoveStop {
  constructor(player: Player) {
    super(player);
  }

  putCardOnDesk(
    { game, card, slotIndex: index, socket }: PlaceCardData & GameSocket,
  ): void | never {
    game.desk.assertCanPut({ attackCard: card, slotIndex: index });
    this.handlePutCardOnDesk({ game, card, index, socket });
    this.postPutCardOnDesk({ game, card, index });
  }

  private postPutCardOnDesk({ game, card, index }: { game: DurakGame } & CardInfo) {
    game.round.updateCurrentMoveTo(InsertAttackCardMove, { allowedPlayer: this, card, slotIndex: index });
    const defender = game.players.tryGetDefender();
    const defenderCanTakeMoreCards = defender.hand.count > game.desk.unbeatenCardCount;

    if (!this.hand.count) {
      const Move = this.left instanceof Defender ? DefenderMove : AttackerMove;
      if (Move instanceof AttackerMove) game.makeNewAttacker({ nextAttacker: this.left });
      game.round.pushNextMove(Move, { allowedPlayer: this.left });
    }

    if (!defenderCanTakeMoreCards) {
      game.round.pushNextMove(DefenderMove, { allowedPlayer: defender });
    } else game.round.pushNextMove(AttackerMove, { allowedPlayer: this });
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }

  handlePutCardOnDesk({ game, card, socket, index }: { game: DurakGame } & CardInfo & GameSocket) {
    game.removeFromHand({ player: this, card, socket });
    game.insertCardOnDesk({ index, card, socket });
  }

  stopMove({ game }: { game: DurakGame }) {
    game.round.updateCurrentMoveTo(StopAttackMove, { allowedPlayer: this });
    const defender = game.players.tryGetDefender();

    if (!game.desk.isDefended) return this.handleVdogonku({ game });

    const prevMoveWasInsert = game.round.previousMove instanceof InsertAttackCardMove;

    const leftIsOriginalAttacker = game.round.isOriginalAttacker(this.left);
    const sameCardCountFromLastDef = game.round.lastSuccesfullDefense?.deskCardCount === game.desk.cardCount;

    const sameCardCountFromPrevMove = game.round.previousMove.deskCardCount === game.desk.cardCount;
    const thisIsOriginalAttacker = game.round.isOriginalAttacker(this);

    if (prevMoveWasInsert || !sameCardCountFromPrevMove) { // prevMoveWasInsert insertedByCurrentAttacker
      return game.round.pushNextMove(DefenderMove, { allowedPlayer: defender });
    }

    if (leftIsOriginalAttacker && sameCardCountFromLastDef) {
      return game.handleNewRound({ nextAttacker: defender });
    }

    if (thisIsOriginalAttacker || sameCardCountFromPrevMove) {
      return game.round.pushNextMove(AttackerMove, {allowedPlayer: defender.left})
    }
  }

  private handleVdogonku({ game }: { game: DurakGame }) {
    const defender = game.players.tryGetDefender();

    if (!game.round.isOriginalAttacker(this)) {
      if (!game.round.isOriginalAttacker(this.left)) {
        return game.round.pushNextMove(AttackerMove, { allowedPlayer: this.left });
      }
      return game.handleNewRound({ nextAttacker: defender.left });
    }
    if (game.round.defenderGaveUpAtPreviousMove) {
      return game.round.pushNextMove(AttackerMove, { allowedPlayer: defender.left });
    }
    game.handleNewRound({ nextAttacker: defender.left });
  }
}