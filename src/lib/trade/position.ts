import { Position, TradeType } from '@/features/trade/types/trade.type';

export function createPosition(type: TradeType, price: number) {
  return {
    type,
    entry: price,
    sl: type === 'BUY' ? price - 0.001 : price + 0.001,
    tp: type === 'BUY' ? price + 0.002 : price - 0.002,
    lot: 1,
    pnl: 0,
    isOpen: true,
  } as Position;
}
