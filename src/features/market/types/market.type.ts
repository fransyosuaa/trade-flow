type SetPriceInput = number | ((prev: number) => number);

export type MarketState = {
  price: number;
  prevPrice: number;
  changePercent: number;
  setPrice: (price: SetPriceInput) => void;
};
