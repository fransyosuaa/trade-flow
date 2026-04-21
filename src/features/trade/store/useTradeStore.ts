import { create } from 'zustand';
import { TradeStore } from '../types/trade.type';

export const useTradeStore = create<TradeStore>((set) => ({
  position: null,
  openPosition: (pos) => set({ position: pos }),
  closePosition: () => set({ position: null }),
}));
