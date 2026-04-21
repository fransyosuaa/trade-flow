'use client';

import { useMarketStore } from '@/features/market/store/useMarketStore';
import { useTradeStore } from '@/features/trade/store/useTradeStore';

export default function TradePanel() {
  const price = useMarketStore((s) => s.price);
  const { openPosition, closePosition, position } = useTradeStore();

  const handleBuy = () => {
    openPosition({
      type: 'BUY',
      entry: price,
    });
  };

  const handleSell = () => {
    openPosition({
      type: 'SELL',
      entry: price,
    });
  };

  return (
    <div className='flex gap-2 mt-4'>
      <button onClick={handleBuy} className='bg-green-500 px-4 py-2 text-white'>
        BUY
      </button>

      <button onClick={handleSell} className='bg-red-500 px-4 py-2 text-white'>
        SELL
      </button>

      <button
        onClick={closePosition}
        className='bg-gray-500 px-4 py-2 text-white'
      >
        CLOSE
      </button>

      {position && (
        <div className='ml-4 text-white'>
          {position.type} @ {position.entry.toFixed(2)}
        </div>
      )}
    </div>
  );
}
