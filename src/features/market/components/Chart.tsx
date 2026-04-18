'use client';

import { useEffect, useRef } from 'react';
import { createChart, LineSeries } from 'lightweight-charts';
import { useMarketStore } from '@/features/market/store/useMarketStore';

export default function Chart() {
  const chartRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: 600,
      height: 300,
      layout: {
        background: { color: '#000' },
        textColor: '#fff',
      },
    });

    const series = chart.addSeries(LineSeries, {});
    seriesRef.current = series;

    return () => chart.remove();
  }, []);

  const price = useMarketStore((state) => state.price);
  const prevPrice = useMarketStore((state) => state.prevPrice);

  useEffect(() => {
    if (!seriesRef.current || price === 0) return;

    // 🔥 FILTER perubahan kecil (noise)
    if (Math.abs(price - prevPrice) < 0.01) return;

    const time = Math.floor(Date.now() / 1000);

    seriesRef.current.update({
      time,
      value: price,
    });
  }, [price, prevPrice]);

  return <div ref={chartRef} />;
}
