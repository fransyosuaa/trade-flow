'use client';

import { useRef, useEffect } from 'react';
import {
  createChart,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
} from 'lightweight-charts';
import { useMarketStore } from '@/features/market/store/useMarketStore';
import { useTradeStore } from '@/features/trade/store/useTradeStore';

// --- Chart Logic ---

type ChartRefs = {
  chart: IChartApi | null;
  series: ISeriesApi<'Candlestick'> | null;
  candle: CandlestickData | null;
  entryLine: ReturnType<ISeriesApi<'Candlestick'>['createPriceLine']> | null;
  isAutoFollow: boolean;
  lastLogical: number;
};

function useLightweightChart(
  containerRef: React.RefObject<HTMLDivElement>,
  price: number,
  prevPrice: number,
  position: { entry: number; type: string } | null,
) {
  const refs = useRef<ChartRefs>({
    chart: null,
    series: null,
    candle: null,
    entryLine: null,
    isAutoFollow: true,
    lastLogical: 0,
  });

  // Initialize chart and series
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth || 600,
      height: containerRef.current.clientHeight || 300,
      layout: { background: { color: '#000' }, textColor: '#fff' },
      rightPriceScale: { autoScale: true },
      grid: { vertLines: { color: '#222' }, horzLines: { color: '#222' } },
      crosshair: { mode: 0 },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
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

    refs.current.chart = chart;
    refs.current.series = series;

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range) return;
      const rightEdge = range.to;
      if (rightEdge < refs.current.lastLogical - 1) {
        refs.current.isAutoFollow = false;
      } else {
        refs.current.isAutoFollow = true;
      }
    });

    return () => chart.remove();
  }, [containerRef]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current || !refs.current.chart) return;
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      refs.current.chart!.applyOptions({ width, height });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  // Update candle
  useEffect(() => {
    const r = refs.current;
    if (!r.series || price === 0) return;

    const now = Math.floor(Date.now() / 1000);
    const interval = 3;
    const candleTime = (now - (now % interval)) as UTCTimestamp;

    if (!r.candle) {
      r.candle = {
        time: candleTime,
        open: price,
        high: price,
        low: price,
        close: price,
      };
    }

    if (r.candle?.time === candleTime) {
      r.candle.high = Math.max(r.candle.high, price);
      r.candle.low = Math.min(r.candle.low, price);
      r.candle.close = price;
    } else {
      r.series.update(r.candle);
      r.lastLogical += 1;
      r.candle = {
        time: candleTime,
        open: price,
        high: price,
        low: price,
        close: price,
      };
    }

    r.series.update(r.candle);
    if (r.isAutoFollow) {
      r.chart?.timeScale().scrollToRealTime();
    }
  }, [price, prevPrice]);

  // Entry Line
  useEffect(() => {
    const r = refs.current;
    if (!r.series) return;
    if (r.entryLine) {
      r.series.removePriceLine(r.entryLine);
      r.entryLine = null;
    }
    if (!position) return;
    r.entryLine = r.series.createPriceLine({
      price: position.entry,
      color: position.type === 'BUY' ? '#00ff88' : '#ff4d4f',
      lineWidth: 2,
      lineStyle: 0,
      axisLabelVisible: true,
      title: position.type,
    });
  }, [position]);

  // UI API
  return refs;
}

// --- UI / Business Logic ---

export default function Chart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const storePrice = useMarketStore((state) => state.price);
  const prevPrice = useMarketStore((state) => state.prevPrice);
  const position = useTradeStore((state) => state.position);
  const updatePositionByPrice = useTradeStore((s) => s.updatePositionByPrice);

  // Chart logic encapsulated in hooks
  useLightweightChart(
    chartRef as React.RefObject<HTMLDivElement>,
    storePrice,
    prevPrice,
    position,
  );

  // Update trade store position by price
  useEffect(() => {
    updatePositionByPrice(storePrice);
  }, [storePrice, updatePositionByPrice]);

  return <div ref={chartRef} />;
}
