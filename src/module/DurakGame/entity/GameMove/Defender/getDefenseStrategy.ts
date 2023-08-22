import Card, { Suit } from "../../Card";
import { FilledDeskSlotBase } from "../../DeskSlot/DeskSlot.abstract";

export default function getDefenseStrategy(
  defenderCards: Card[],
  unbeatenDeskCards: Card[],
  logger?: { log: Function },
) {
  if (unbeatenDeskCards.length > defenderCards.length) {
    throw new Error("Too many cards, can not defend it");
  }
  const deskTrumpCards = unbeatenDeskCards
    .filter((card) => card.isTrump)
    .sort((a, b) => b.power - a.power);
  const defenderTrumpCards = defenderCards
    .filter((card) => card.isTrump)
    .sort((a, b) => a.power - b.power);
  if (deskTrumpCards.length > defenderTrumpCards.length) {
    throw new Error("Too many trump cards, can not defend it");
  }
  const defenseStrategy: FilledDeskSlotBase[] = [];
  defenseStrategy.toString = function () {
    return this.map((slot) => `${slot.attackCard} ${slot.defendCard}`).join("");
  };
  Object.defineProperty(defenseStrategy, "toString", {
    enumerable: false,
    writable: false,
    configurable: false,
    value() {
      return (this as Array<FilledDeskSlotBase>)
        .map((slot) => `[${slot.attackCard}, ${slot.defendCard}] \n`)
        .join();
    },
  });
  const remainingDefenderTrumpCards = defendDeskTrumpCards(
    defenderTrumpCards.slice(),
    deskTrumpCards,
    defenseStrategy,
    logger,
  );
  // NOTE: Weak suit is a suit, which is not trump suit (WeakSuit !== TrumpSuit)
  // NOTE: Weak card is a card, which suit is not trump suit (WeakCard.suit !== TrumpSuit)
  const weakSuitGropedUnbeatenCards = new Map(
    Object.entries(
      unbeatenDeskCards
        .filter((card) => !card.isTrump)
        .reduce<Record<Suit, Card[]>>((record, card) => {
          if (!record[card.suit]) {
            record[card.suit] = [];
          }
          record[card.suit]!.push(card);
          return record;
        }, {} as Record<Suit, Card[]>),
    ).map(
      ([weakSuit, weakSuitCards]) =>
        [weakSuit, weakSuitCards.sort((a, b) => b.power - a.power)] as [
          Suit,
          Card[],
        ],
    ),
  );
  const weakSuitGropedDefenderCards = new Map(
    Object.entries(
      defenderCards
        .filter((card) => !card.isTrump)
        .reduce<Record<Suit, Card[]>>((record, card) => {
          if (!record[card.suit]) {
            record[card.suit] = [];
          }
          record[card.suit]!.push(card);
          return record;
        }, {} as Record<Suit, Card[]>),
    ).map(
      ([weakSuit, weakSuitCards]) =>
        [weakSuit, weakSuitCards.sort((a, b) => a.power - b.power)] as [
          Suit,
          Card[],
        ],
    ),
  );
  ensureHasMinimalRequiredTrumpCards(
    remainingDefenderTrumpCards,
    weakSuitGropedUnbeatenCards,
    weakSuitGropedDefenderCards,
  );
  logger?.log({ remainingDefenderTrumpCards });
  for (const [weakSuit, unbeatenWeakSuitCards] of weakSuitGropedUnbeatenCards) {
    const defenderWeakCards = weakSuitGropedDefenderCards.get(weakSuit);
    if (!defenderWeakCards) {
      defenseStrategy.push(
        ...defendWithTrumpCards(unbeatenDeskCards, remainingDefenderTrumpCards),
      );
    } else {
      logger?.log({ defenderWeakCards, unbeatenWeakSuitCards });
      const highPowerUnbeatenWeakSuitCards = [];
      for (const unbeatenWeakSuitCard of unbeatenWeakSuitCards) {
        const strongerCardOfDefender = defenderWeakCards.find(
          (card) => card.power > unbeatenWeakSuitCard.power,
        );
        if (!strongerCardOfDefender) {
          highPowerUnbeatenWeakSuitCards.push(unbeatenWeakSuitCard);
        } else {
          logger?.log({
            strongerCardOfDefender,
            defendCard: strongerCardOfDefender,
            attackCard: unbeatenWeakSuitCard,
          });
          defenseStrategy.push({
            defendCard: strongerCardOfDefender,
            attackCard: unbeatenWeakSuitCard,
          });
        }
      }
      if (
        highPowerUnbeatenWeakSuitCards.length >
        remainingDefenderTrumpCards.length
      ) {
        console.log({
          defenseStrategy: defenseStrategy.toString(),
          remainingDefenderTrumpCards,
          highPowerUnbeatenWeakSuitCards,
        });
        throw new Error(
          `Can not defend, not enough trump cards to defend highest cards with suit=${weakSuit}`,
        );
      }
      if (!highPowerUnbeatenWeakSuitCards.length) continue;
      defenseStrategy.push(
        ...highPowerUnbeatenWeakSuitCards.map((weakSuitCard) => {
          const [firstDefenderTrumpCard] = remainingDefenderTrumpCards.splice(
            0,
            1,
          );
          logger?.log({
            attackCard: weakSuitCard,
            defendCard: firstDefenderTrumpCard,
          });
          return {
            attackCard: weakSuitCard,
            defendCard: firstDefenderTrumpCard,
          };
        }),
      );
    }
  }

  return { defenseStrategy, remainingDefenderTrumpCards };
}

function defendWithTrumpCards(cards: Card[], trumpCards: Card[]) {
  if (!trumpCards.length) {
    throw new Error(
      `Can not defend, no trump cards and no defender cards with suit=${
        cards.at(0)?.suit
      }`,
    );
  }
  if (cards.length > trumpCards.length) {
    throw new Error(
      `Can not defend, not enough trump cards to defend all cards with suit=${
        cards.at(0)?.suit
      }`,
    );
  }
  return cards.map((weakSuitCard) => {
    const [firstDefenderTrumpCard] = trumpCards.splice(0, 1);
    return {
      attackCard: weakSuitCard,
      defendCard: firstDefenderTrumpCard,
    };
  });
}

function ensureHasMinimalRequiredTrumpCards(
  remainingDefenderTrumpCards: Card[],
  weakSuitGropedUnbeatenCards: Map<Suit, Card[]>,
  weakSuitGropedDefenderCards: Map<Suit, Card[]>,
) {
  const minRequiredTrumpCards = [...weakSuitGropedUnbeatenCards]
    .map(([suit, deskWeakCardsOfSuit]) => {
      return Math.max(
        deskWeakCardsOfSuit.length -
          (weakSuitGropedDefenderCards.get(suit)?.length || 0),
        0,
      );
    })
    .reduce((accumulator, value) => accumulator + value, 0);
  if (minRequiredTrumpCards > remainingDefenderTrumpCards.length) {
    throw new Error(
      "Not enough trump cards to defend non trump cards difference",
    );
  }
  return minRequiredTrumpCards;
}

function defendDeskTrumpCards(
  defenderTrumpCards: Card[],
  deskTrumpCards: Card[],
  defenseStrategy: FilledDeskSlotBase[],
  logger?: { log: Function },
) {
  for (const deskTrumpCard of deskTrumpCards) {
    const strongerDefenderTrumpCardIndex = defenderTrumpCards.findIndex(
      (card) => card.power > deskTrumpCard.power,
    );
    if (strongerDefenderTrumpCardIndex < 0) {
      throw new Error("Defender trump card could not defend desk trump card");
    }
    const [card] = defenderTrumpCards.splice(strongerDefenderTrumpCardIndex, 1);
    logger?.log({
      attackCard: deskTrumpCard,
      defendCard: card,
    });
    defenseStrategy.push({
      attackCard: deskTrumpCard,
      defendCard: card,
    });
  }
  return defenderTrumpCards;
}

export function slotsSort<T extends FilledDeskSlotBase>(a: T, b: T) {
  return (
    a.attackCard.power * (a.attackCard.isTrump ? 10 : 1) -
    b.attackCard.power * (b.attackCard.isTrump ? 10 : 1)
  );
}
export function slotAsString<T extends FilledDeskSlotBase>(a: T) {
  return `[${a.attackCard}, ${a.defendCard}]`;
}

export function cardsSort<T extends Card>(a: T, b: T) {
  return a.power * (a.isTrump ? 10 : 1) - b.power * (b.isTrump ? 10 : 1);
}
