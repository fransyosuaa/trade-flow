import { create } from 'zustand';
import { MarketState } from '../types/market.type';

export const useMarketStore = create<MarketState>((set) => ({
  price: 0,
  prevPrice: 0,
  changePercent: 0,

  setPrice: (input) =>
    set((state) => {
      const newPrice = typeof input === 'function' ? input(state.price) : input;

      const prev = state.price;

      const change = prev === 0 ? 0 : ((newPrice - prev) / prev) * 100;

      return {
        prevPrice: prev,
        price: newPrice,
        changePercent: change,
      };
    }),
}));
