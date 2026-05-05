import { Position, TradeType } from '@/features/trade/types/trade.type';

export function createPosition(type: TradeType, price: number) {
  return {
    type,
    entry: price,
    sl: type === 'BUY' ? price - 50 : price + 50,
    tp: type === 'BUY' ? price + 100 : price - 100,
    lot: 1,
    pnl: 0,
    isOpen: true,
  } as Position;
}
