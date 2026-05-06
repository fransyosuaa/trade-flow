'use client';

import { useMarketStore } from '@/features/market/store/useMarketStore';
import { useTradeStore } from '@/features/trade/store/useTradeStore';
import { createPosition } from '@/lib/trade/position';

/* --- Presentational Components --- */

function BalanceCard({ balance }: { balance: number }) {
  return (
    <div className="bg-neutral-800 p-4 rounded-xl flex flex-col items-center">
      <p className="text-sm text-gray-400 mb-1">Account Balance</p>
      <p className="text-2xl font-bold text-green-200">${balance.toFixed(2)}</p>
    </div>
  );
}

function TradeButtons({
  onBuy,
  onSell,
  onClose,
  disabled,
}: {
  onBuy: () => void;
  onSell: () => void;
  onClose: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        className="bg-green-500 hover:bg-green-600 py-2 rounded-lg font-semibold transition-colors"
        onClick={onBuy}
        disabled={disabled}
      >
        BUY
      </button>
      <button
        className="bg-red-500 hover:bg-red-600 py-2 rounded-lg font-semibold transition-colors"
        onClick={onSell}
        disabled={disabled}
      >
        SELL
      </button>
      <button
        className="bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-semibold transition-colors"
        onClick={onClose}
        disabled={!disabled}
      >
        CLOSE
      </button>
    </div>
  );
}

function HistoryList({
  history,
}: {
  history: Array<{
    type: string;
    pnl: number;
    result: string;
    entry: number;
    close: number;
    time: number;
  }>;
}) {
  if (!history.length)
    return (
      <div className="text-center text-gray-500 text-xs px-4 py-8">
        No trades yet.
      </div>
    );

  return (
    <div className="divide-y divide-gray-800">
      {history.map((h, i) => (
        <div key={i} className="flex justify-between text-sm py-1 items-center">
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                h.type === 'BUY'
                  ? 'bg-green-700 text-green-200'
                  : 'bg-red-800 text-red-300'
              }`}
            >
              {h.type}
            </span>
            <span className="text-gray-400">
              @{h.entry} → {h.close}
            </span>
          </div>
          <span
            className={
              h.result === 'WIN'
                ? 'text-green-400 font-semibold'
                : 'text-red-400 font-semibold'
            }
          >
            {h.pnl >= 0 ? '+' : ''}
            {h.pnl.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PositionPnL({ pnl }: { pnl: number }) {
  return (
    <div
      className={`w-full text-center mt-2 text-lg font-semibold tracking-wide ${
        pnl >= 0 ? 'text-green-400' : 'text-red-400'
      }`}
    >
      {pnl >= 0 ? '+' : ''}
      {pnl.toFixed(2)}
    </div>
  );
}

/* --- Container Component --- */

export default function TradePanel() {
  // 1. Get all state and actions up front
  const price = useMarketStore((s) => s.price);
  const openPosition = useTradeStore((s) => s.openPosition);
  const closePosition = useTradeStore((s) => s.closePosition);
  const balance = useTradeStore((s) => s.balance);
  const history = useTradeStore((s) => s.history);
  const position = useTradeStore((s) => s.position);

  // 2. Compose handlers
  const handleBuy = () => openPosition(createPosition('BUY', price));
  const handleSell = () => openPosition(createPosition('SELL', price));
  const handleClose = () => closePosition(price);

  // 3. UI layout: grouped, airy, clear
  return (
    <section className="w-[340px] mx-auto space-y-5 text-white select-none">
      <BalanceCard balance={balance} />
      <div className="flex flex-col gap-y-3">
        <TradeButtons
          onBuy={handleBuy}
          onSell={handleSell}
          onClose={handleClose}
          disabled={!!position}
        />
        {position && <PositionPnL pnl={position.pnl} />}
      </div>
      <div className="bg-neutral-800 p-4 rounded-xl min-h-[110px]">
        <p className="mb-2 text-sm text-gray-400 font-semibold tracking-wide">
          Trade History
        </p>
        <HistoryList history={history} />
      </div>
    </section>
  );
}
