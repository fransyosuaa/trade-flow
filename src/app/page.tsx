'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/features/market/store/useMarketStore';
import Chart from '@/features/market/components/Chart';

export default function Home() {
  const { price, prevPrice, changePercent, setPrice } = useMarketStore();

  const isUp = price > prevPrice;

  useEffect(() => {
    // const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    // const ws = new WebSocket('wss://stream.binance.com/ws/btcusdt@trade');

    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   const livePrice = parseFloat(data.p);

    //   setPrice(livePrice);
    // };

    const ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const livePrice = parseFloat(data.bitcoin);
      console.log('price update:', livePrice);
      setPrice(livePrice);
    };

    return () => {
      ws.close();
    };
  }, [setPrice]);

  return (
    <main className='flex h-screen items-center justify-center bg-black text-white'>
      <div className='text-center'>
        <h1 className='text-2xl mb-4'>TradeFlow</h1>
        <p className='text-xl'>BTC Price:</p>
        <p
          className={`text-5xl font-bold transition-all duration-300 ${isUp ? 'text-green-400' : 'text-red:400'}`}
        >
          ${price.toLocaleString()}
        </p>
        <p className={`text-xl ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? '📈' : '📉'} {changePercent.toFixed(2)}%
        </p>
      </div>
      <Chart />
    </main>
  );
}
