export type TradeType = 'BUY' | 'SELL';

export type Position = {
  type: TradeType;
  entry: number;
  sl: number;
  tp: number;
  lot: number;
  pnl: number;
  isOpen: boolean;
};

export type TradeHistory = {
  type: TradeType;
  entry: number;
  close: number;
  pnl: number;
  result: 'WIN' | 'LOSS';
  time: number;
};

export type TradeStore = {
  position: Position | null;
  balance: number;
  history: TradeHistory[];

  openPosition: (pos: Position) => void;
  closePosition: (price: number) => void;
  updatePositionByPrice: (price: number) => void;
};
