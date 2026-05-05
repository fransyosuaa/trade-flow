'use client';

import { useRef, useEffect } from 'react';
import {
  createChart,
  createSeriesMarkers,
  Time,
  SeriesMarker,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
} from 'lightweight-charts';
import { useMarketStore } from '@/features/market/store/useMarketStore';
import { useTradeStore } from '@/features/trade/store/useTradeStore';

// --- Chart Logic ---
type EntryLine = ReturnType<
  ISeriesApi<'Candlestick'>['createPriceLine']
> | null;

type ChartRefs = {
  chart: IChartApi | null;
  series: ISeriesApi<'Candlestick'> | null;
  candle: CandlestickData | null;
  entryLine: EntryLine;
  isAutoFollow: boolean;
  lastLogical: number;
  markers: ReturnType<typeof createSeriesMarkers> | null;
};

function useLightweightChart(
  containerRef: React.RefObject<HTMLDivElement>,
  price: number,
  prevPrice: number,
  position: { entry: number; type: string; tp?: number; sl?: number } | null,
) {
  const refs = useRef<ChartRefs & { tpLine?: EntryLine; slLine?: EntryLine }>({
    chart: null,
    series: null,
    candle: null,
    entryLine: null,
    isAutoFollow: true,
    lastLogical: 0,
    markers: null,
    tpLine: null,
    slLine: null,
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

  // Entry Line, TP, and SL lines
  useEffect(() => {
    const r = refs.current;
    if (!r.series) return;
    // Remove previous lines
    if (r.entryLine) {
      r.series.removePriceLine(r.entryLine);
      r.entryLine = null;
    }
    if (r.tpLine) {
      r.series.removePriceLine(r.tpLine);
      r.tpLine = null;
    }
    if (r.slLine) {
      r.series.removePriceLine(r.slLine);
      r.slLine = null;
    }

    if (!position) return;
    // Entry line
    r.entryLine = r.series.createPriceLine({
      price: position.entry,
      color: position.type === 'BUY' ? '#00ff88' : '#ff4d4f',
      lineWidth: 2,
      lineStyle: 0,
      axisLabelVisible: true,
      title: position.type,
    });
    // TP line (green dashed)
    if ('tp' in position && typeof position.tp === 'number') {
      r.tpLine = r.series.createPriceLine({
        price: position.tp,
        color: '#00ff88',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: '',
      });
    }
    // SL line (red dashed)
    if ('sl' in position && typeof position.sl === 'number') {
      r.slLine = r.series.createPriceLine({
        price: position.sl,
        color: '#ff4d4f',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: '',
      });
    }
  }, [position]);

  // Marker for trade entry
  useEffect(() => {
    const r = refs.current;
    if (!r.series) return;

    // We'll use a single marker at the current open position
    if (!position) {
      r.markers?.setMarkers([]);
      return;
    }

    // Find the candle with time matching the entry price
    // We'll simply use the current candle - this matches the "open now" context
    const candleTime = r.candle?.time;
    if (!candleTime) return;

    r.markers?.setMarkers([]); // clear dulu

    const markers: SeriesMarker<Time>[] = [
      {
        time: candleTime,
        position: position.type === 'BUY' ? 'belowBar' : 'aboveBar',
        color: position.type === 'BUY' ? '#00ff88' : '#ff4d4f',
        shape: position.type === 'BUY' ? 'arrowUp' : 'arrowDown',
        text: position.type,
      },
    ];
    r.markers = createSeriesMarkers<Time>(r.series, markers) as ReturnType<
      typeof createSeriesMarkers
    >;
  }, [position, price]);

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
