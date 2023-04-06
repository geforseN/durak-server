import Player, { CardPut, CardRemove, MoveStop } from "./Player";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import Card from "../Card";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame, { CardInfo } from "../../DurakGame";
import { AttackerMove, DefenderMove, InsertAttackCardMove, StopAttackMove } from "../GameMove";

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
      return game.round.pushNextMove(DefenderMove, { allowedPlayer: defender });
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
    game.round.updateCurrentMoveTo(StopAttackMove, { player: this });
    const { players: { defender }, round: { previousMove, lastSuccesfullDefense, isDefenderGaveUp }, desk } = game;

    debugger
    // if LostRoundDefenderMove exist
    // and this.left is defender
    // THEN new round


    if (!desk.isDefended && isDefenderGaveUp) {
      console.log("!-1: deskIsNotDefended", !game.desk.isDefended, "AND ", "isDefenderGaveUp: ", game.round.isDefenderGaveUp);
      console.log("!-2: handleVdogonku");
      return this.handleVdogonku({ game });
    }

    if (previousMove instanceof InsertAttackCardMove
      || previousMove.deskCardCount !== desk.cardCount) {
      console.log("!-1: prevMoveWasInsert", previousMove instanceof InsertAttackCardMove, "OR", "notSameCardCountFromPrevMove", previousMove.deskCardCount !== game.desk.cardCount);
      console.log("!-2: next DefenderMove WHERE allowedPlayer IS defender", defender.id);
      return game.round.pushNextMove(DefenderMove, { player: defender });
    }

    if (this.isPrimalAttacker({ game })
      || previousMove.deskCardCount !== desk.cardCount) {
      console.log("!-1: thisIsOriginalAttacker", this.isPrimalAttacker({ game }), "OR", "sameCardCountFromPrevMove", previousMove.deskCardCount !== desk.cardCount);
      console.log("!-2: pushNextAttackerMove WHERE allowedPlayer IS", defender.left.id, "(defender.left)");
      return this.giveMoveToLeftPlayer({ game });
    }

    if (this.left.isPrimalAttacker({ game })
      && lastSuccesfullDefense?.deskCardCount === game.desk.cardCount) {
      console.log("!-1: leftIsOriginalAttacker", this.left.isPrimalAttacker({ game }), "AND", "sameCardCountFromLastDef", lastSuccesfullDefense?.deskCardCount === game.desk.cardCount);
      console.log("!-2: handleSuccesfullDefense WHERE defender", defender.id);
      return game.handleWonDefence(defender);
    }
  }

  private handleVdogonku({ game }: { game: DurakGame }) {
    const defender = game.players.tryGetDefender();
    if (this.left.isPrimalAttacker({ game })
      || this.isPrimalAttacker({ game }) && game.round.defenderGaveUpAtPreviousMove
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
}