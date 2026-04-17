import { create } from 'zustand';

type MarketState = {
  price: number;
  prevPrice: number;
  setPrice: (price: number) => void;
};

export const useMarketStore = create<MarketState>((set) => ({
  price: 0,
  prevPrice: 0,
  setPrice: (price) => set((state) => ({ prevPrice: state.price, price })),
}));
