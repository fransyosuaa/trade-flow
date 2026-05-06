import { create } from 'zustand';
import { TradeHistory, TradeStore } from '../types/trade.type';

/**
 * Zustand store for single-position trading system.
 *
 * Handles position, balance, history, and PnL updates.
 * - Clean, readable, beginner-friendly.
 * - Avoids unnecessary state mutation.
 */

export const useTradeStore = create<TradeStore>()((set, get) => ({
  position: null,
  balance: 1000,
  history: [],

  openPosition: (position) => {
    // Only update if there's no currently open position
    if (!get().position) {
      set({ position });
    }
  },

  closePosition: (closePrice: number) => {
    const { position, balance, history } = get();
    if (!position) return;

    // Calculate PnL based on position type
    const pnl =
      position.type === 'BUY'
        ? (closePrice - position.entry) * position.lot
        : (position.entry - closePrice) * position.lot;

    const updatedBalance = balance + pnl;

    const tradeHistory: TradeHistory = {
      type: position.type,
      entry: position.entry,
      close: closePrice,
      pnl,
      result: pnl >= 0 ? 'WIN' : 'LOSS',
      time: Date.now(),
    };

    set({
      position: null,
      balance: updatedBalance,
      history: [tradeHistory, ...history],
    });
  },

  updatePositionByPrice: (price: number) => {
    const { position } = get();
    if (!position) return;

    const hitTP =
      position.type === 'BUY' ? price >= position.tp : price <= position.tp;

    const hitSL =
      position.type === 'BUY' ? price <= position.sl : price >= position.sl;

    if (hitTP || hitSL) {
      get().closePosition(price);
      return;
    }

    // Calculate new PnL
    const pnl =
      position.type === 'BUY'
        ? (price - position.entry) * position.lot
        : (position.entry - price) * position.lot;

    // Prevent unnecessary re-render
    if (pnl === position.pnl) return;

    set({
      position: {
        ...position,
        pnl,
      },
    });
  },
}));
