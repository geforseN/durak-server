import Card, { Suit } from "../../Card";

export default function getDefenseStrategy(
  defenderCards: Card[],
  unbeatenDeskCards: Card[],
  trumpSuit?: Suit,
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
  const defenseStrategy: { defenderCard: Card; deskCard: Card }[] = [];
  const remainingDefenderTrumpCards = defendDeskTrumpCards(
    defenderTrumpCards.slice(),
    deskTrumpCards,
    defenseStrategy,
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
  const _minRequiredTrumpCards = ensureHasMinimalRequiredTrumpCards(
    remainingDefenderTrumpCards,
    weakSuitGropedUnbeatenCards,
    weakSuitGropedDefenderCards,
  );
  for (const [weakSuit, unbeatenWeakSuitCards] of weakSuitGropedUnbeatenCards) {
    const defenderWeakCards = weakSuitGropedDefenderCards.get(weakSuit);
    if (!defenderWeakCards) {
      if (!remainingDefenderTrumpCards.length) {
        throw new Error(
          `Can not defend, no trump cards and no defender cards with suit=${weakSuit}`,
        );
      }
      if (unbeatenWeakSuitCards.length > remainingDefenderTrumpCards.length) {
        throw new Error(
          `Can not defend, not enough trump cards to defend all cards with suit=${weakSuit}`,
        );
      }
      defenseStrategy.push(
        ...unbeatenWeakSuitCards.map((weakSuitCard) => {
          const [firstDefenderTrumpCard] = remainingDefenderTrumpCards.splice(
            0,
            1,
          );
          return {
            deskCard: weakSuitCard,
            defenderCard: firstDefenderTrumpCard,
          };
        }),
      );
    } else {
      let highPowerUnbeatenWeakSuitCard = [];
      for (const unbeatenWeakSuitCard of unbeatenWeakSuitCards) {
        const strongerCardOfDefender = defenderWeakCards.find(
          (card) => card.power > unbeatenWeakSuitCard.power,
        );
        if (!strongerCardOfDefender) {
          highPowerUnbeatenWeakSuitCard.push(unbeatenWeakSuitCard);
        } else {
          defenseStrategy.push({
            defenderCard: strongerCardOfDefender,
            deskCard: unbeatenWeakSuitCard,
          });
        }
        if (
          highPowerUnbeatenWeakSuitCard.length >
          remainingDefenderTrumpCards.length
        ) {
          throw new Error(
            `Can not defend, not enough trump cards to defend highest cards with suit=${weakSuit}`,
          );
        } else {
          defenseStrategy.push(
            ...highPowerUnbeatenWeakSuitCard.map((weakSuitCard) => {
              const [firstDefenderTrumpCard] =
                remainingDefenderTrumpCards.splice(0, 1);
              return {
                deskCard: weakSuitCard,
                defenderCard: firstDefenderTrumpCard,
              };
            }),
          );
        }
      }
    }
  }

  return { defenseStrategy, remainingDefenderTrumpCards };
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
  defenseStrategy: { defenderCard: Card; deskCard: Card }[],
) {
  for (const deskTrumpCard of deskTrumpCards) {
    const strongerDefenderTrumpCard = defenderTrumpCards.find(
      (card) => card.power > deskTrumpCard.power,
    );
    if (!strongerDefenderTrumpCard) {
      throw new Error("Defender trump card could not defend desk trump card");
    }
    defenseStrategy.push({
      deskCard: deskTrumpCard,
      defenderCard: strongerDefenderTrumpCard,
    });
    defenderTrumpCards.splice(
      defenderTrumpCards.indexOf(strongerDefenderTrumpCard),
      1,
    );
  }
  return defenderTrumpCards;
}
