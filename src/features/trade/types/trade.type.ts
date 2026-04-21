export type Position = {
  type: 'BUY' | 'SELL';
  entry: number;
};

export type TradeStore = {
  position: Position | null;
  openPosition: (pos: Position) => void;
  closePosition: () => void;
};
