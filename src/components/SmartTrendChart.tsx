import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, LineSeries } from 'lightweight-charts';

interface SmartTrendChartProps {
  data: any[];
  currency?: 'USD' | 'INR';
}

export const SmartTrendChart: React.FC<SmartTrendChartProps> = ({
  data,
  currency = 'USD',
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({
        width: chartContainerRef.current?.clientWidth || 0,
      });
    };

    // Create chart
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
        barSpacing: 6,
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

    // Calculate simple moving average for trend
    const closingPrices = data.map(d => d.close);
    const period = Math.min(20, Math.ceil(data.length / 5));

    // Calculate SMA values
    const smaData: any[] = [];
    for (let i = period - 1; i < closingPrices.length; i++) {
      const windowPrices = closingPrices.slice(i - period + 1, i + 1);
      const sma = windowPrices.reduce((a, b) => a + b) / windowPrices.length;
      smaData.push({
        time: data[i].time,
        value: sma,
      });
    }

    // Add main price line
    const lineSeries = chart.addSeries(LineSeries, {
      color: '#00C896',
      lineWidth: 2.5,
      crosshairMarkerVisible: true,
      lastValueVisible: true,
    });

    lineSeries.setData(
      data.map(d => ({
        time: d.time,
        value: d.close,
      }))
    );

    // Add trend line (SMA)
    if (smaData.length > 0) {
      const smaSeries = chart.addSeries(LineSeries, {
        color: 'rgba(59, 130, 246, 0.7)',
        lineWidth: 1.5,
        lineStyle: 2,
        title: 'Trend',
        lastValueVisible: false,
      });
      smaSeries.setData(smaData);
    }

    // Add upper and lower trend bands
    const bandData: { upper: any[]; lower: any[] } = { upper: [], lower: [] };
    const bandPeriod = Math.max(10, Math.ceil(period / 2));
    
    for (let i = bandPeriod - 1; i < closingPrices.length; i++) {
      const windowPrices = closingPrices.slice(i - bandPeriod + 1, i + 1);
      const avg = windowPrices.reduce((a, b) => a + b) / windowPrices.length;
      const stdDev = Math.sqrt(
        windowPrices
          .map(p => Math.pow(p - avg, 2))
          .reduce((a, b) => a + b) / windowPrices.length
      );

      bandData.upper.push({
        time: data[i].time,
        value: avg + stdDev * 0.5,
      });
      bandData.lower.push({
        time: data[i].time,
        value: avg - stdDev * 0.5,
      });
    }

    if (bandData.upper.length > 0) {
      const resistanceSeries = chart.addSeries(LineSeries, {
        color: 'rgba(239, 68, 68, 0.3)',
        lineWidth: 1,
        lineStyle: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      resistanceSeries.setData(bandData.upper);

      const supportSeries = chart.addSeries(LineSeries, {
        color: 'rgba(0, 200, 150, 0.3)',
        lineWidth: 1,
        lineStyle: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      supportSeries.setData(bandData.lower);
    }

    chart.timeScale().fitContent();

    // Mouse wheel zoom
    const handleWheel = (event: WheelEvent) => {
      if (chartContainerRef.current?.contains(event.target as Node)) {
        event.preventDefault();
        const zoomRange = chart.timeScale().getVisibleRange();
        if (!zoomRange) return;

        const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
        const range = zoomRange.to - zoomRange.from;
        const newRange = range * zoomFactor;
        const diff = newRange - range;

        chart.timeScale().setVisibleRange({
          from: zoomRange.from - diff / 2,
          to: zoomRange.to + diff / 2,
        });
      }
    };

    chartContainerRef.current?.addEventListener('wheel', handleWheel, {
      passive: false,
    });

    chartRef.current = chart;
    window.addEventListener('resize', handleResize);

    return () => {
      chartContainerRef.current?.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, currency]);

  return <div ref={chartContainerRef} className="w-full h-[400px]" />;
};
