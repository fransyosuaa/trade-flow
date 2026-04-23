'use client';

import { useMarketStore } from '@/features/market/store/useMarketStore';
import { useTradeStore } from '@/features/trade/store/useTradeStore';
import { createPosition } from '@/lib/trade/position';

export default function TradePanel() {
  const price = useMarketStore((s) => s.price);
  const { openPosition, closePosition } = useTradeStore();
  const balance = useTradeStore((s) => s.balance);
  const history = useTradeStore((s) => s.history);
  const position = useTradeStore((s) => s.position);

  return (
    <div className='w-[300px] space-y-4 text-white'>
      {/* Balance */}
      <div className='bg-neutral-800 p-4 rounded-xl'>
        <p className='text-sm text-gray-400'>Balance</p>
        <p className='text-2xl font-bold'>${balance.toFixed(2)}</p>
      </div>

      {/* Buttons */}
      <div className='grid grid-cols-3 gap-2'>
        <button
          className='bg-green-500 py-2 rounded-lg'
          onClick={() => openPosition(createPosition('BUY', price))}
        >
          BUY
        </button>
        <button
          className='bg-red-500 py-2 rounded-lg'
          onClick={() => openPosition(createPosition('SELL', price))}
        >
          SELL
        </button>
        <button
          className='bg-gray-500 py-2 rounded-lg'
          onClick={() => closePosition(price)}
        >
          CLOSE
        </button>
      </div>
      {/* History */}
      <div className='bg-neutral-800 p-4 rounded-xl'>
        <p className='mb-2 text-sm text-gray-400'>History</p>

        {history.map((h, i) => (
          <div
            key={i}
            className='flex justify-between text-sm border-b border-gray-700 py-1'
          >
            <span>{h.type}</span>
            <span
              className={h.result === 'WIN' ? 'text-green-400' : 'text-red-400'}
            >
              {h.pnl.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {position && (
        <p
          className={`text-lg font-semibold ${
            position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {position.pnl >= 0 ? '+' : ''}
          {position.pnl.toFixed(2)}
        </p>
      )}
    </div>
  );
}
