import Player, { CardPut, CardRemove, MoveStop } from "./Player";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import Card from "../Card";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame from "../../durak-game";
import { AttackerMove, DefenderMove, InsertDefendCardMove, TransferMove } from "../../GameRound";
import DeskSlot from "../DeskSlot";
import { GamesIO } from "../../../namespaces/games/games.types";

export type DefenderO = { defender: Defender };

export default class Defender extends Player implements CardPut, CardRemove, MoveStop {
  constructor(player: Player) {
    super(player);
  }

  putCardOnDesk(
    { game, slotIndex: index, card, socket }: PlaceCardData & GameSocket,
  ): void | never {
    const slot = game.desk.getSlot({ index });
    const { trumpSuit } = game.talon;
    if (this.canMakeTransferMove({ slot, game, card })) {
      return this.makeTransferMove({ game, socket, index, card });
    }
    slot.assertAvalableForDefense(card, trumpSuit);
    game.removeFromHand({ player: this, card, socket });
    game.insertDefendCardOnDesk({ defender: this, card, index, socket });
    this.postPutCardOnDesk({ game });
  }

  private postPutCardOnDesk({ game }: { game: DurakGame }) {
    const { cardCount: deskCardCount } = game.desk;
    game.round.updateCurrentMoveTo(InsertDefendCardMove, { allowedPlayer: this, deskCardCount });
    // TODO if (game.talon.isEmpty && !this.hand.count) return game.PLAYER_QUIT_GAME();
    if (game.desk.isFull || !this.hand.count) return game.handleSuccesfullDefense();

    if (!game.round.principalAttacker) {
      console.log(game.round._originalAttacker_, game.round.principalAttacker);
      game.round.principalAttacker = game.players.tryGetAttacker();
    }

    if (game.desk.isDefended) {
      // TODO: LET MOVE TO ATTACKER & SAVE CURRENT DESK CARD COUNT
      // let move to ...principalAttacker OR attacker ...
    } else /* let defender def next card */ {
      game.round.pushNextMove(DefenderMove, { allowedPlayer: this, deskCardCount });
    }
  }

  stopMove({ game }: { game: DurakGame }) {
    if (!game.desk.isDefended) return game.handleBadDefense();

    // will be true when desk is defended and for EXAMPLE:
    //  lastCardCount === 4, cardCount === 6
    if (game.cardCountIncreasedFromLastDefense) {
      // TODO: LET MOVE TO ATTACKER & SAVE CURRENT DESK CARD COUNT
      const c = { moveNumber: game.round.currentMove.number, cardCount: game.desk.cardCount };
      game.round.lastSuccesfullDefense = new SuccesfullDefenseMove(c);
      game.round.currentMove.allowedPlayer = game.players.tryGetAttacker();
      return;
    }
    return game.handleSuccesfullDefense();
  }

  removeCard(card: Card): void {
    const index = this.hand.findIndex({ card });
    this.hand.value.splice(index, 1);
  }

  private canMakeTransferMove({ slot, game, card }: { slot: DeskSlot, game: DurakGame, card: Card }) {
    return slot.isEmpty && game.desk.allCardsHasSameRank(card.rank);
  }

  private makeTransferMove({ game, index, card, socket }: t) {
    const deskCardCount = game.desk.cardCount;
    game.round.updateCurrentMoveTo(TransferMove, { allowedPlayer: this, deskCardCount, card, slotIndex: index });
    game.removeFromHand({ player: this, card, socket });
    game.insertCardOnDesk({ index, card, socket });
    this.makeNewAttacker({ game });
    game.round.pushNextMove(AttackerMove, { allowedPlayer: this });
  }

  // not supposed to be in this class
  private makeNewAttacker({ game }: { game: DurakGame }) {
    game.makePlayer(game.players.tryGetDefender());
    game.makePlayer(game.players.tryGetAttacker());
    const attacker = game.makeAttacker(this);
    game.makeDefender(attacker.left);
  }
}

type t = { game: DurakGame, card: Card, socket: GamesIO.SocketIO, index: number };
