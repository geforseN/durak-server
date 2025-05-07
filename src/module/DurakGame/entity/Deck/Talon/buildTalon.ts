import type { CardDTO, GameSettings, Suit } from "@durak-game/durak-dts";

import assert from "node:assert";
import crypto from "node:crypto";

import TrumpCard from "@/module/DurakGame/entity/Card/trump-card.js";
import Card from "@/module/DurakGame/entity/Card/index.js";

export default function buildTalon({
  count,
  trumpCard,
}: GameSettings["talon"]) {
  assert.ok(count);
  // cardCount probably equal to 24, 36 or 52
  // but later 54 can be added (where 2 additional cards are jokers)
  const maxCardsPerSuit = count / Card.suits.length;
  assert.ok(Number.isInteger(maxCardsPerSuit));
  // will throw below if cards card equal to 54
  // this should be removed when game will support joker cards
  assert.strictEqual(count % Card.suits.length, 0);

  const nonShuffledDeck = Card.suits.flatMap((suit) =>
    getCardsOfSuit(suit, maxCardsPerSuit),
  );
  if (trumpCard) {
    assert.ok(
      nonShuffledDeck.some((card) => card.isEqualTo(trumpCard)),
      "The trump card you provided does not exist on deck. Probably, the rank of card is to low",
    );
  }

  const shuffledCards = withCorrectTrumpCard(
    makeModernFisherYatesShuffle(nonShuffledDeck),
    trumpCard,
  );

  return shuffledCards.map(
    // NOTE - make card with trump suit TrumpCard, otherwise return same card
    (card, _, cards) =>
      card.suit === cards[0].suit ? TrumpCard.from(card) : card,
  );
}

function getCardsOfSuit(suit: Suit, maxCardsPerSuit: number) {
  return [...Card.ranks]
    .reverse()
    .filter((_, index) => index < maxCardsPerSuit)
    .map((rank) => Card.create(rank, suit));
}

function makeModernFisherYatesShuffle(deck: Card[]) {
  for (let j, i = deck.length - 1; i > 0; i--) {
    j = crypto.randomInt(i + 1);
    [deck[j], deck[i]] = [deck[i], deck[j]];
  }
  return deck;
}

function withCorrectTrumpCard(deck: Card[], correctTrumpCard?: CardDTO) {
  if (!correctTrumpCard) {
    return deck;
  }
  const correctTrumpCardIndex = deck.findIndex((card) =>
    card.isEqualTo(correctTrumpCard),
  );
  assert.ok(correctTrumpCardIndex >= 0);
  if (correctTrumpCardIndex === 0) {
    return deck;
  }
  [deck[0], deck[correctTrumpCardIndex]] = [
    deck[correctTrumpCardIndex],
    deck[0],
  ];
  return deck;
}
