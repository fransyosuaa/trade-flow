/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useMarketStore } from '@/features/market/store/useMarketStore';
import { useTradeStore } from '@/features/trade/store/useTradeStore';

export default function Chart() {
  const chartRef = useRef<HTMLDivElement>(null); // chart HTML
  const chartInstanceRef = useRef<any>(null); // chart from lightweight-charts

  // logic for zoom in chart and scroll to the left
  const isAutoFollowRef = useRef(true);
  const lastLogicalRef = useRef<number>(0);

  const seriesRef = useRef<any>(null); // for adding candle series to the chart
  const candleRef = useRef<any>(null); // for knowing position high low open close of the candle

  // logic for open position BUY/SELL
  const entryLineRef = useRef<any>(null);
  const position = useTradeStore((state) => state.position);

  useEffect(() => {
    if (!seriesRef.current) return;

    // hapus line lama kalau ada
    if (entryLineRef.current) {
      seriesRef.current.removePriceLine(entryLineRef.current);
      entryLineRef.current = null;
    }

    // kalau ga ada posisi → selesai
    if (!position) return;

    // bikin line baru
    entryLineRef.current = seriesRef.current.createPriceLine({
      price: position.entry,
      color: position.type === 'BUY' ? '#00ff88' : '#ff4d4f',
      lineWidth: 2,
      lineStyle: 0,
      axisLabelVisible: true,
      title: position.type,
    });
  }, [position]);

  // 🔹 INIT CHART
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth || 600,
      height: 300,
      layout: {
        background: { color: '#000' },
        textColor: '#fff',
      },
      rightPriceScale: {
        autoScale: true,
      },
      grid: {
        vertLines: { color: '#222' },
        horzLines: { color: '#222' },
      },
      crosshair: { mode: 0 },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },

      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range) return;

      const rightEdge = range.to;

      // kalau user jauh dari ujung kanan → disable auto follow
      if (rightEdge < lastLogicalRef.current - 1) {
        isAutoFollowRef.current = false;
      } else {
        isAutoFollowRef.current = true;
      }
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#00ff88',
      downColor: '#ff4d4f',

      lastValueVisible: true,
      priceLineVisible: true,

      priceLineColor: '#ffffff',
      priceLineWidth: 2,
      priceLineStyle: 2,
    });

    chartInstanceRef.current = chart;
    seriesRef.current = series;

    return () => chart.remove();
  }, []);

  const price = useMarketStore((state) => state.price);
  const prevPrice = useMarketStore((state) => state.prevPrice);

  // 🔹 UPDATE CANDLE
  useEffect(() => {
    if (!seriesRef.current || price === 0) return;

    const now = Math.floor(Date.now() / 1000);

    // interval 3 detik per candle
    const interval = 3;
    const currentPrice = price;
    const candleTime = now - (now % interval);

    if (!candleRef.current) {
      candleRef.current = {
        time: candleTime,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
      };
    }

    // kalau masih di candle yang sama
    if (candleRef.current.time === candleTime) {
      candleRef.current.high = Math.max(candleRef.current.high, currentPrice);
      candleRef.current.low = Math.min(candleRef.current.low, currentPrice);
      candleRef.current.close = currentPrice;
    } else {
      // push candle lama
      seriesRef.current.update(candleRef.current);

      lastLogicalRef.current += 1;

      // buat candle baru
      candleRef.current = {
        time: candleTime,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
      };
    }

    // 🔥 render candle berjalan
    // seriesRef.current.update(candleRef.current);
    if (isAutoFollowRef.current) {
      chartInstanceRef.current?.timeScale().scrollToRealTime();
    }
  }, [price, prevPrice]);

  return <div ref={chartRef} />;
}
