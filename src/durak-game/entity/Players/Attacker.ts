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
    const previousMoveWasAttackCardInsert = game.round.previousMove instanceof InsertAttackCardMove;
    const sameCardCountFromLastSuccesfullDefence = game.round.lastSuccesfullDefense?.deskCardCount === game.desk.cardCount;
    const sameCardCountFromPreviousMove = game.round.previousMove.deskCardCount === game.desk.cardCount;

    if (previousMoveWasAttackCardInsert
      || !sameCardCountFromPreviousMove) {
      console.log("!-1: prevMoveWasInsert", previousMoveWasAttackCardInsert, "OR",
        "notSameCardCountFromPrevMove", !sameCardCountFromPreviousMove);
      console.log("!-2: next DefenderMove WHERE allowedPlayer IS defender", defender.info.accname);
      return this.giveMoveToDefender({ game });
    }

    if (this.left.isOriginalAttacker({ game })
      && sameCardCountFromLastSuccesfullDefence) {
      console.log("!-1: leftIsOriginalAttacker", this.left.isOriginalAttacker({ game }), "AND",
        "sameCardCountFromLastDef", sameCardCountFromLastSuccesfullDefence);
      console.log("!-2: handleSuccesfullDefense WHERE defender", defender.info.accname);
      return game.handleSuccesfullDefense();
    }

    if (this.isOriginalAttacker({ game })
      || sameCardCountFromPreviousMove) {
      console.log("!-1: thisIsOriginalAttacker", this.isOriginalAttacker({ game }), "OR",
        "sameCardCountFromPrevMove", sameCardCountFromPreviousMove);
      console.log("!-2: pushNextAttackerMove WHERE allowedPlayer IS",
        defender.left.info.accname, "(defender.left)");
      return this.giveMoveToLeft({ game });
    }
  }

  private handleVdogonku({ game }: { game: DurakGame }) {
    const defender = game.players.tryGetDefender();

    if (this.left.isOriginalAttacker({ game })
      || this.isOriginalAttacker({ game }) && game.round.defenderGaveUpAtPreviousMove
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