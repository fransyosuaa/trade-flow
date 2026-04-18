import { create } from 'zustand';

type MarketState = {
  price: number;
  prevPrice: number;
  changePercent: number;
  setPrice: (price: number) => void;
};

export const useMarketStore = create<MarketState>((set) => ({
  price: 0,
  prevPrice: 0,
  changePercent: 0,
  setPrice: (price) =>
    set((state) => {
      const prev = state.price;
      const change = prev === 0 ? 0 : ((price - prev) / prev) * 100;

      return {
        prevPrice: state.price,
        price,
        changePercent: change,
      };
    }),
}));
