import React, { useEffect, useRef } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi,
  CandlestickSeries, 
  BarSeries,
  LineSeries
} from 'lightweight-charts';
import { SmartTrendChart } from './SmartTrendChart';

interface ChartProps {
  data: any[];
  color?: string;
  type?: 'candlestick' | 'line' | 'bar' | 'smart-trend';
  currency?: 'USD' | 'INR';
  fxRate?: number;
  isSourceINR?: boolean;
}

export const PriceChart: React.FC<ChartProps> = ({ 
  data, 
  color = '#00C896', 
  type = 'candlestick',
  currency = 'USD',
  fxRate = 1,
  isSourceINR = false
}) => {
  // Convert OHLC data based on currency
  const convertedData = data.map((candle: any) => {
    let multiplier = 1;
    
    // Determine conversion rate
    if (currency === 'INR' && !isSourceINR) {
      multiplier = fxRate;
    } else if (currency === 'USD' && isSourceINR) {
      multiplier = 1 / fxRate;
    }

    return {
      time: candle.time,
      open: candle.open * multiplier,
      high: candle.high * multiplier,
      low: candle.low * multiplier,
      close: candle.close * multiplier,
      value: candle.value ? candle.value * multiplier : undefined,
      volume: candle.volume || 0
    };
  });

  // If Smart Trend chart is selected, use custom component
  if (type === 'smart-trend') {
    return (
      <SmartTrendChart 
        data={convertedData} 
        currency={currency}
      />
    );
  }

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || convertedData.length === 0) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth || 0 });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
        fontSize: 12,
        fontFamily: 'system-ui, -apple-system',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.08)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.08)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderVisible: false,
        barSpacing: type === 'candlestick' || type === 'bar' ? 8 : 6,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          visible: true,
          labelVisible: true,
          color: 'rgba(100, 116, 139, 0.3)',
          width: 1,
        },
        horzLine: {
          visible: true,
          labelVisible: true,
          color: 'rgba(100, 116, 139, 0.3)',
          width: 1,
        },
      },
      localization: {
        priceFormatter: (price: number) => {
          const currencySymbol = currency === 'INR' ? '₹' : '$';
          return currencySymbol + price.toFixed(price > 1 ? 2 : 6);
        },
      },
    });

    // Main price series
    if (type === 'candlestick') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#00C896',
        downColor: '#EF4444',
        borderDownColor: '#EF4444',
        borderUpColor: '#00C896',
        wickDownColor: '#EF4444',
        wickUpColor: '#00C896',
      });
      series.setData(convertedData);
    } else if (type === 'bar') {
      const series = chart.addSeries(BarSeries, {
        upColor: '#00C896',
        downColor: '#EF4444',
      });
      series.setData(convertedData.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })));
    } else if (type === 'line') {
      const series = chart.addSeries(LineSeries, {
        color: color,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        lastValueVisible: true,
      });
      series.setData(convertedData.map(d => ({
        time: d.time,
        value: d.close,
      })));
    }

    chart.timeScale().fitContent();

    // Mouse wheel zoom
    const handleWheel = (event: WheelEvent) => {
      if (chartContainerRef.current?.contains(event.target as Node)) {
        event.preventDefault();
        const zoomRange = chart.timeScale().getVisibleRange();
        if (!zoomRange) return;

        const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
        const from = Number(zoomRange.from as unknown as number);
        const to = Number(zoomRange.to as unknown as number);
        const range = to - from;
        const newRange = range * zoomFactor;
        const diff = newRange - range;

        chart.timeScale().setVisibleRange({
          from: (from - diff / 2) as any,
          to: (to + diff / 2) as any,
        });
      }
    };

    chartContainerRef.current?.addEventListener('wheel', handleWheel, { passive: false });

    chartRef.current = chart;
    window.addEventListener('resize', handleResize);

    return () => {
      chartContainerRef.current?.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [convertedData, type, currency, fxRate, isSourceINR]);

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-[400px]"
    />
  );
};
