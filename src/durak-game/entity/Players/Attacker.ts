import Player, { CardPut, CardRemove, MoveStop } from "./Player";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import Card from "../Card";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame, { CardInfo } from "../../durak-game";
import { AttackerMove } from "../Moves/AttackerMove";
import { DefenderMove } from "../Moves/DefenderMove";
import { InsertAttackCardMove } from "../Moves/InsertAttackCardMove";
import { StopAttackMove } from "../Moves/StopAttackMove";

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
    const cardCount = game.desk.unbeatenCardCount;
    if (!this.hand.count) {
      return this.giveMoveToLeft({ game });
    }
    if (!defender.canTakeMore({ cardCount })) {
      return this.giveMoveToDefender({ game });
    }
    return game.round.pushNextMove(AttackerMove, { allowedPlayer: this });
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }

  private handlePutCardOnDesk({ game, card, socket, index }: { game: DurakGame } & CardInfo & GameSocket) {
    game.removeFromHand({ player: this, card, socket });
    game.insertCardOnDesk({ index, card, socket });
  }

  stopMove({ game }: { game: DurakGame }) {
    game.round.updateCurrentMoveTo(StopAttackMove, { allowedPlayer: this });
    const defender = game.players.tryGetDefender();
    console.log("STOP MOVE", this.info.accname);

    if (!game.desk.isDefended && game.round.isDefenderGaveUp) {
      console.log("!-1: deskIsNotDefended", !game.desk.isDefended,
        "AND ", "isDefenderGaveUp: ", game.round.isDefenderGaveUp);
      console.log("!-2: handleVdogonku");
      return this.handleVdogonku({ game });
    }

    const previousMoveWasInsert = game.round.previousMove instanceof InsertAttackCardMove;

    const leftIsOriginalAttacker = game.round.isOriginalAttacker(this.left);
    const sameCardCountFromLastDef = game.round.lastSuccesfullDefense?.deskCardCount === game.desk.cardCount;

    const sameCardCountFromPrevMove = game.round.previousMove.deskCardCount === game.desk.cardCount;
    const thisIsOriginalAttacker = game.round.isOriginalAttacker(this);

    if (previousMoveWasInsert || !sameCardCountFromPrevMove) {
      console.log("!-1: prevMoveWasInsert", previousMoveWasInsert, "OR",
        "notSameCardCountFromPrevMove", !sameCardCountFromPrevMove);
      game.service.setAttackUI("hidden", this).setDefendUI("revealed", defender);
      console.log("!-2: next DefenderMove WHERE allowedPlayer IS defender", defender.info.accname);
      return game.round.pushNextMove(DefenderMove, { allowedPlayer: defender });
    }

    if (leftIsOriginalAttacker && sameCardCountFromLastDef) {
      console.log("!-1: leftIsOriginalAttacker AND sameCardCountFromLastDef",
        leftIsOriginalAttacker, sameCardCountFromLastDef);
      console.log("!-2: handleSuccesfullDefense WHERE defender", defender.info.accname);
      return game.handleSuccesfullDefense();
    }

    if (thisIsOriginalAttacker || sameCardCountFromPrevMove) {
      console.log("!-1: thisIsOriginalAttacker OR sameCardCountFromPrevMove",
        thisIsOriginalAttacker, sameCardCountFromPrevMove);
      const allowedPlayer = game.makeAttacker(defender.left);
      game.service.setAttackUI("hidden", this).setAttackUI("revealed", allowedPlayer);
      console.log("!-2: pushNextAttackerMove WHERE allowedPlayer IS",
        defender.left.info.accname, "(defender.left)");
      return game.round.pushNextMove(AttackerMove, { allowedPlayer });
    }
  }

  private handleVdogonku({ game }: { game: DurakGame }) {
    const defender = game.players.tryGetDefender();
    const thisIsOriginalAttacker = game.round.isOriginalAttacker(this);
    const leftIsOriginalAttacker = game.round.isOriginalAttacker(this.left);
    const { defenderGaveUpAtPreviousMove } = game.round;

    if (leftIsOriginalAttacker
      || thisIsOriginalAttacker && defenderGaveUpAtPreviousMove
    ) {
      game.makePlayer(this);
      const allowedPlayer = game.makeAttacker(this.left);
      return game.round.pushNextMove(AttackerMove, { allowedPlayer });
    }
    return game.handleNewRound({ nextAttacker: defender.left });
  }

  private giveMoveToLeft({ game }: { game: DurakGame }) {
    game.makePlayer(this);
    if (game.players.isDefender(this.left)) {
      return game.round.pushNextMove(DefenderMove, { allowedPlayer: this.left });
    }
    const allowedPlayer = game.makeNewAttacker({ nextAttacker: this.left });
    return game.round.pushNextMove(DefenderMove, { allowedPlayer });
  }

  private giveMoveToDefender({ game }: { game: DurakGame }) {
    const defender = game.players.tryGetDefender();
    game.service.setAttackUI("freeze", this);
    game.round.pushNextMove(DefenderMove, { allowedPlayer: defender });
  }
}