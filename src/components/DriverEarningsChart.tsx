import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { TrendingUp, Calendar, DollarSign, Sparkles, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';
import { RideBooking } from '../types';

export interface DailyEarningPoint {
  date: string;
  fullDate: string;
  dayName: string;
  earnings: number;
  rides: number;
  isToday?: boolean;
}

interface DriverEarningsChartProps {
  completedRides?: RideBooking[];
  onAddRideToStorage?: (fare: number) => void;
}

export const DriverEarningsChart: React.FC<DriverEarningsChartProps> = ({
  completedRides = [],
  onAddRideToStorage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(500);
  const [activeTooltip, setActiveTooltip] = useState<DailyEarningPoint | null>(null);
  const [storageRidesCount, setStorageRidesCount] = useState(0);

  // Initial 7-day baseline trend
  const baseMockData: DailyEarningPoint[] = useMemo(
    () => [
      { date: '02 Oct', fullDate: '2026-10-02', dayName: 'शुक्रवार', earnings: 1450, rides: 6 },
      { date: '03 Oct', fullDate: '2026-10-03', dayName: 'शनिवार', earnings: 1820, rides: 7 },
      { date: '04 Oct', fullDate: '2026-10-04', dayName: 'रविवार', earnings: 2150, rides: 9 },
      { date: '05 Oct', fullDate: '2026-10-05', dayName: 'सोमवार', earnings: 1380, rides: 5 },
      { date: '06 Oct', fullDate: '2026-10-06', dayName: 'मंगलवार', earnings: 1690, rides: 7 },
      { date: '07 Oct', fullDate: '2026-10-07', dayName: 'बुधवार', earnings: 1940, rides: 8 },
      { date: '08 Oct', fullDate: '2026-10-08', dayName: 'आज', earnings: 1850, rides: 8, isToday: true },
    ],
    []
  );

  // Compute live updated daily earnings array combining baseline + stored completed rides
  const chartData: DailyEarningPoint[] = useMemo(() => {
    // 1. Read from localStorage
    let storedRides: RideBooking[] = [];
    try {
      const raw = localStorage.getItem('sawari_completed_rides');
      if (raw) {
        storedRides = JSON.parse(raw);
      }
    } catch {}

    // Combine storage and props
    const allCompleted = [...completedRides];
    storedRides.forEach((sr) => {
      if (!allCompleted.some((r) => r.id === sr.id)) {
        allCompleted.push(sr);
      }
    });

    // Calculate dynamic driver earnings added from completed rides (driver gets 85%)
    let addedTodayEarnings = 0;
    let addedTodayRides = 0;

    allCompleted.forEach((ride) => {
      // Driver share is 100% during inaugural 6-month period (0% company margin), or 85% after 6 months
      const driverShare =
        ride.driverEarningShare ||
        (ride.isInitial6Months !== false
          ? ride.totalFare || 100
          : Math.round((ride.totalFare || 100) * 0.85));
      addedTodayEarnings += driverShare;
      addedTodayRides += 1;
    });

    return baseMockData.map((d) => {
      if (d.isToday) {
        return {
          ...d,
          earnings: d.earnings + addedTodayEarnings,
          rides: d.rides + addedTodayRides,
        };
      }
      return d;
    });
  }, [baseMockData, completedRides, storageRidesCount]);

  // Handle ResizeObserver for responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setContainerWidth(width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Listen to window storage event
  useEffect(() => {
    const handleStorageChange = () => {
      setStorageRidesCount((prev) => prev + 1);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Draw D3 Line Chart
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear canvas

    const width = containerWidth || 480;
    const height = 240;
    const margin = { top: 25, right: 25, bottom: 40, left: 45 };

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // X and Y Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(chartData.map((d) => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.35);

    const maxEarnings = d3.max(chartData, (d) => d.earnings) || 2000;
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxEarnings * 1.15)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Gradient definitions
    const defs = svg.append('defs');

    // Area Gradient (Orange fading to transparent)
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'earnings-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#FF8C00')
      .attr('stop-opacity', 0.45);

    areaGradient
      .append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#FF8C00')
      .attr('stop-opacity', 0.08);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FF8C00')
      .attr('stop-opacity', 0);

    // Line glow filter
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Horizontal Grid Lines
    const yTicks = yScale.ticks(5);
    svg
      .append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#27272a')
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-width', 1);

    // D3 Area Generator
    const areaGenerator = d3
      .area<DailyEarningPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.date) || 0)
      .y0(height - margin.bottom)
      .y1((d) => yScale(d.earnings));

    // D3 Line Generator
    const lineGenerator = d3
      .line<DailyEarningPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.date) || 0)
      .y((d) => yScale(d.earnings));

    // Render Area Path
    svg
      .append('path')
      .datum(chartData)
      .attr('fill', 'url(#earnings-area-gradient)')
      .attr('d', areaGenerator);

    // Render Line Path
    const path = svg
      .append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#FF8C00')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#glow)')
      .attr('d', lineGenerator);

    // Animation transition
    const totalLength = path.node()?.getTotalLength() || 800;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Render X Axis (Dates)
    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(0)
          .tickPadding(10)
      );

    xAxis.select('.domain').attr('stroke', '#3f3f46');
    xAxis
      .selectAll('text')
      .attr('fill', (d) => (d === '08 Oct' ? '#FF8C00' : '#a1a1aa'))
      .attr('font-size', '11px')
      .attr('font-weight', (d) => (d === '08 Oct' ? 'bold' : 'normal'));

    // Render Y Axis (Rupees)
    const yAxis = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => `₹${d}`)
          .tickSize(0)
          .tickPadding(8)
      );

    yAxis.select('.domain').remove();
    yAxis
      .selectAll('text')
      .attr('fill', '#71717a')
      .attr('font-size', '10px')
      .attr('font-mono', 'true');

    // Interactive Data Points (Circles)
    const pointsGroup = svg.append('g').attr('class', 'data-points');

    chartData.forEach((point) => {
      const cx = xScale(point.date) || 0;
      const cy = yScale(point.earnings);

      // Outer ring for today's point
      if (point.isToday) {
        pointsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 8)
          .attr('fill', 'none')
          .attr('stroke', '#FF8C00')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.6)
          .attr('class', 'animate-ping origin-center');
      }

      // Point Circle
      const circle = pointsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', point.isToday ? 5.5 : 4)
        .attr('fill', point.isToday ? '#FF8C00' : '#18181b')
        .attr('stroke', '#FF8C00')
        .attr('stroke-width', 2.5)
        .style('cursor', 'pointer');

      // Value label on top of point
      svg
        .append('text')
        .attr('x', cx)
        .attr('y', cy - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', point.isToday ? '#FF8C00' : '#d4d4d8')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(`₹${point.earnings}`);

      // Interactive hover zone
      pointsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 20)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseenter', () => {
          circle.transition().duration(150).attr('r', 7).attr('fill', '#ffffff');
          setActiveTooltip(point);
        })
        .on('mouseleave', () => {
          circle
            .transition()
            .duration(150)
            .attr('r', point.isToday ? 5.5 : 4)
            .attr('fill', point.isToday ? '#FF8C00' : '#18181b');
          setActiveTooltip(null);
        });
    });
  }, [containerWidth, chartData]);

  // Metrics
  const totalWeekly = useMemo(() => chartData.reduce((acc, c) => acc + c.earnings, 0), [chartData]);
  const todayPoint = useMemo(() => chartData.find((d) => d.isToday) || chartData[chartData.length - 1], [chartData]);
  const avgDaily = useMemo(() => Math.round(totalWeekly / chartData.length), [totalWeekly, chartData]);

  const handleSimulateNewRide = () => {
    // Generate a completed test ride with ₹180 fare (net ₹153 to driver)
    const newRide: RideBooking = {
      id: `RIDE_SIM_${Math.floor(1000 + Math.random() * 9000)}`,
      passengerName: 'यात्री (लाइव टेस्ट)',
      passengerPhone: '9450985355',
      pickup: 'हजरतगंज चौराहा, लखनऊ',
      pickupCoords: { lat: 26.8467, lng: 80.9462 },
      destination: 'गोमती नगर, लखनऊ',
      destCoords: { lat: 26.8532, lng: 80.9982 },
      mode: 'auto',
      distanceKm: 6.2,
      baseFare: 40,
      totalFare: 160,
      status: 'completed',
      driverName: 'सुरेश कुमार (चालक)',
      driverPhone: '9450985355',
      vehicleNumber: 'UP32-AK-4421',
      paymentStatus: 'paid',
      bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'upi',
      otp: '7721',
      agreedToSafety: true,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem('sawari_completed_rides');
      const rides: RideBooking[] = existing ? JSON.parse(existing) : [];
      rides.unshift(newRide);
      localStorage.setItem('sawari_completed_rides', JSON.stringify(rides));
      setStorageRidesCount((c) => c + 1);
      if (onAddRideToStorage) {
        onAddRideToStorage(newRide.totalFare);
      }
    } catch {}
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4">
      {/* Header and Summary Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-[#FF8C00]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>दैनिक कमाई ट्रेंड (D3 Daily Earnings Chart)</span>
                <span className="text-[10px] font-bold bg-[#FF8C00]/20 text-[#FF8C00] px-2 py-0.5 rounded-full border border-amber-500/30">
                  D3.js Live
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                जैसे-जैसे सवारी पूरी होती है, कमाई का ग्राफ़ स्वतः अपडेट होता है
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action: Simulate Storage Update */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateNewRide}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
            title="स्टोरेज में नई सवारी जोड़ें और D3 चार्ट लाइव अपडेट देखें"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#FF8C00]" />
            <span>+ टेस्ट ट्रिप जोड़ें (Live D3 Sync)</span>
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">आज की कमाई (Live)</span>
          <span className="text-lg sm:text-xl font-black text-[#FF8C00]">₹{todayPoint.earnings}</span>
          <span className="text-[10px] text-emerald-400 block font-medium mt-0.5">
            {todayPoint.rides} सवारी पूर्ण
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">7 दिन की कुल कमाई</span>
          <span className="text-lg sm:text-xl font-black text-white">₹{totalWeekly}</span>
          <span className="text-[10px] text-zinc-400 block font-medium mt-0.5">
            औसत ₹{avgDaily} / दिन
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">सप्ताहिक ग्रोथ</span>
          <span className="text-lg sm:text-xl font-black text-emerald-400">+18.4%</span>
          <span className="text-[10px] text-emerald-500/90 block font-medium mt-0.5">
            लगातार वृद्धि
          </span>
        </div>
      </div>

      {/* D3 SVG Line Chart Viewport Container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-black/40 rounded-2xl p-2 border border-zinc-850"
      >
        <svg ref={svgRef} className="w-full h-[240px] overflow-visible" />

        {/* Hover Tooltip Overlay */}
        {activeTooltip && (
          <div className="absolute top-3 right-3 p-2.5 rounded-xl bg-zinc-900/95 border border-amber-500/50 shadow-xl backdrop-blur-md pointer-events-none text-xs space-y-1 animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-3 text-zinc-400 text-[10px]">
              <span className="flex items-center gap-1 font-bold text-white">
                <Calendar className="w-3 h-3 text-[#FF8C00]" />
                {activeTooltip.date} ({activeTooltip.dayName})
              </span>
              {activeTooltip.isToday && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                  आज
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-400">कुल कमाई:</span>
              <span className="font-black text-[#FF8C00] text-sm">₹{activeTooltip.earnings}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-zinc-400">पूर्ण सवारी:</span>
              <span className="font-bold text-zinc-200">{activeTooltip.rides} ट्रिप्स</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[10px] text-zinc-400 pt-0.5 border-t border-zinc-800">
              <span>प्रति ट्रिप औसत:</span>
              <span className="text-emerald-400 font-semibold">
                ₹{Math.round(activeTooltip.earnings / Math.max(activeTooltip.rides, 1))}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
        <span>💡 किसी भी बिंदु पर कर्सर ले जाकर दिनवार कमाई व ट्रिप विवरण देखें।</span>
        <span className="text-[#FF8C00] font-semibold">सवारी सेतु ड्राइवर पार्टनर</span>
      </div>
    </div>
  );
};
