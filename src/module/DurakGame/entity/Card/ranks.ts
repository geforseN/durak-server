const _24DeckRanks = ["9", "10", "J", "Q", "K", "A"] as const;

const _36DeckRanks = ["6", "7", "8", ..._24DeckRanks] as const;

const _52DeckRanks = ["2", "3", "4", "5", ..._36DeckRanks] as const;
