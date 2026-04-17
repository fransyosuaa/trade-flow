'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/features/market/store/useMarketStore';

export default function Home() {
  // const price = useMarketStore((state) => state.price);
  const { price, prevPrice } = useMarketStore();
  const setPrice = useMarketStore((state) => state.setPrice);

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
          className={`text-4xl font-bold ${isUp ? 'text-green-400' : 'text-red:400'}`}
        >
          ${price.toLocaleString()}
        </p>
      </div>
    </main>
  );
}
