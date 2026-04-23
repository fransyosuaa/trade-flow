'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/features/market/store/useMarketStore';
import Chart from '@/features/market/components/Chart';
import TradePanel from '@/features/trade/components/TradePanel';

export default function Home() {
  const { price, prevPrice, changePercent, setPrice } = useMarketStore();

  const isUp = price > prevPrice;

  // useEffect(() => {
  //   // const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
  //   // const ws = new WebSocket('wss://stream.binance.com/ws/btcusdt@trade');

  //   // ws.onmessage = (event) => {
  //   //   const data = JSON.parse(event.data);
  //   //   const livePrice = parseFloat(data.p);

  //   //   setPrice(livePrice);
  //   // };

  //   const ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin');

  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     const livePrice = parseFloat(data.bitcoin);
  //     console.log('price update:', livePrice);
  //     setPrice(livePrice);
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, [setPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomMove = (Math.random() - 0.5) * 50;

      setPrice((prev: number) => {
        const base = prev || 75000;
        return base + randomMove;
      });
    }, 500); // tiap 0.5 detik

    return () => clearInterval(interval);
  }, [setPrice]);

  return (
    <main className='flex gap-6 p-6 bg-black h-screen overflow-hidden'>
      {/* LEFT */}
      <div className='space-y-2 text-white w-[200px] shrink-0'>
        <p className='text-gray-400'>BTC Price</p>
        <p className='text-4xl font-bold'>
          ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>

        <p className={isUp ? 'text-green-400' : 'text-red-400'}>
          {changePercent.toFixed(2)}%
        </p>
      </div>

      {/* CENTER */}
      <div className='flex-1 min-w-0 overflow-hidden'>
        <Chart />
      </div>

      {/* RIGHT */}
      <div className='w-[300px] shrink-0'>
        <TradePanel />
      </div>
    </main>
  );
}
