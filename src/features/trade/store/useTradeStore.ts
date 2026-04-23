import { create } from 'zustand';
import { TradeHistory, TradeStore } from '../types/trade.type';

export const useTradeStore = create<TradeStore>((set) => ({
  position: null,
  balance: 1000, // initial
  history: [],

  openPosition: (pos) => set({ position: pos }),
  closePosition: (price: number) =>
    set((state) => {
      if (!state.position) return {};

      const pos = state.position;
      const pnl =
        pos.type === 'BUY'
          ? (price - pos.entry) * pos.lot
          : (pos.entry - price) * pos.lot;

      const newBalance = state.balance + pnl;

      const historyItem: TradeHistory = {
        type: pos.type,
        entry: pos.entry,
        close: price,
        pnl,
        result: pnl >= 0 ? 'WIN' : 'LOSS',
        time: Date.now(),
      };

      return {
        position: null,
        balance: newBalance,
        history: [historyItem, ...state.history],
      };
    }),
  updatePositionByPrice: (price: number) =>
    set((state) => {
      if (!state.position) return {};

      const pos = state.position;

      const pnl =
        pos.type === 'BUY'
          ? (price - pos.entry) * pos.lot
          : (pos.entry - price) * pos.lot;

      if (pnl === pos.pnl) return {};

      let isOpen = true;

      if (pos.type === 'BUY') {
        if (price >= pos.tp || price <= pos.sl) isOpen = false;
      } else {
        if (price <= pos.tp || price >= pos.sl) isOpen = false;
      }

      return {
        position: {
          ...pos,
          pnl,
          isOpen,
        },
      };
    }),
}));
