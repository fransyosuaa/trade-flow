import { Position } from '@/features/trade/types/trade.type';

export function calculatePnL(position: Position, currentPrice: number) {
  if (!position.isOpen) return 0;

  const diff =
    position.type === 'BUY'
      ? currentPrice - position.entry
      : position.entry - currentPrice;

  return diff * position.lot;
}
