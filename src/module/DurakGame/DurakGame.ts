import type { GameMove } from "@/module/DurakGame/entity/GameMove/index.js";
import type { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import type { Players } from "@/module/DurakGame/entity/index.js";

import GameHistory from "@/module/DurakGame/entity/History.js";
import {
  Card,
  Discard,
  GameRound,
  Talon,
} from "@/module/DurakGame/entity/index.js";
import type { GameSettings } from "@durak-game/durak-dts";
export default class DurakGame {
  // _ readonly desk: Desk;
  // ! must be moved to round

  // _ readonly history: GameHistory;
  // ! should rewrite

  // _ players: Players;
  // ! must already have cards
  // ! some player must be allowed to move

  // _ round: GameRound;
  // ! here must be desk slots */

  // _ readonly settings: GameSettings;
  // ! probably should not be here,
  // ! settings must be used when constructing game properties
  // ? maybe should exist is history
  // ! refactor settings.players.moveTime into players.moveTime

  // _ readonly discard: Discard;
  // ! must be moved to decks

  // _ readonly talon: Talon;
  // ! must be moved to decks

  //  _ readonly talonDistribution: GameRoundDistribution;
  // ! must be moved to decks.talon

  constructor(
    public id: string,
    public round: GameRound,
    public players: Players,
    public readonly settings: GameSettings,
    private decks: {
      talon: Talon;
      discard: Discard;
      toJSON(): object;
    },
    private history: GameHistory,
    private readonly ending: {
      execute: (game: DurakGame) => void;
    },
  ) {}

  get desk(): never {
    throw new Error("Not implemented");
  }

  get talon() {
    return this.decks.talon;
  }

  get discard() {
    return this.decks.discard;
  }

  start() {
    // TODO: refactor
    // not started game must have `start` instance with `execute` method
    // non started game should mutate own players with same logic
    this.#__makeInitialSuperPlayers__();
  }

  #__makeInitialSuperPlayers__() {
    const admin = this.players.get((player) => player.info.isAdmin);
    this.players
      .mutateWith(admin.left.asDefender())
      .mutateWith(this.players.defender.right.asAttacker().asAllowed(this));
  }

  handleNewMove(move: GameMove<AllowedSuperPlayer>) {
    if (move.isInsertMove()) {
      move.makeCardInsert();
    }
    this.round.moves.push(move);
    const nextThing = move.gameMutationStrategy();
    if (nextThing?.kind === "RoundEnd") {
      nextThing.makeMutation();
      const { newGameRound } = nextThing;
      if (!newGameRound) {
        this.ending.execute(this);
      } else {
        this.history.rounds.add(this.round);
        this.round = newGameRound;
      }
    } else {
      this.players.allowed.setTimer();
    }
  }

  toGameJSON() {
    return {
      state: {
        decks: this.decks.toJSON(),
        round: this.round.toJSON(),
      },
      settings: this.settings,
    };
  }
}

export interface CanReceiveCards {
  receiveCards: (..._cards: Card[]) => void;
}

export interface CanProvideCards<Target extends CanReceiveCards> {
  provideCards: (_target: Target) => void;
}
