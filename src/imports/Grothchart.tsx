import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  interpolateColors,
} from "remotion";

const IncomeProgressChart: React.FC<Record<string, unknown>> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Props extraction with defaults
  const title = (props.title as string) ?? "Annual Income Growth";
  const subtitle = (props.subtitle as string) ?? "Financial Performance Overview";
  const rawData = (props.data as string) ?? '[{"year": 2018, "income": 42000}, {"year": 2019, "income": 55000}, {"year": 2020, "income": 48000}, {"year": 2021, "income": 72000}, {"year": 2022, "income": 89000}, {"year": 2023, "income": 115000}]';
  const lineColor = (props.lineColor as string) ?? "#3b82f6";
  const areaColor = (props.areaColor as string) ?? "#3b82f633";
  const textColor = (props.textColor as string) ?? "#ffffff";
  const gridColor = (props.gridColor as string) ?? "#ffffff22";
  const currency = (props.currency as string) ?? "$";
  const backgroundColor = (props.backgroundColor as string) ?? "#0f172a";

  // Parse data safely
  const data = useMemo(() => {
    try {
      return JSON.parse(rawData) as { year: number | string; income: number }[];
    } catch (e) {
      return [];
    }
  }, [rawData]);

  // Chart dimensions
  const padding = 150;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2.5;
  const maxValue = Math.max(...data.map((d) => d.income)) * 1.2;

  // Calculate points
  const points = useMemo(() => {
    return data.map((d, i) => ({
      x: padding + (i / (data.length - 1)) * chartWidth,
      y: height - padding - (d.income / maxValue) * chartHeight,
      val: d.income,
      label: d.year,
    }));
  }, [data, chartWidth, chartHeight, padding, height, maxValue]);

  // Path strings
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  // Animations
  const introProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const lineDrawProgress = interpolate(frame, [20, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const areaOpacity = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [0, 30], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  // Helper for number formatting
  const formatCurrency = (val: number) => {
    return `${currency}${Math.round(val).toLocaleString()}`;
  };

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily: "sans-serif" }}>
      {/* Background Grid Lines */}
      <svg style={{ position: "absolute", width: "100%", height: "100%" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = height - padding - t * chartHeight;
          const gridOpacity = interpolate(frame - i * 5, [0, 20], [0, 0.3], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={gridColor}
                strokeWidth={2}
                strokeDasharray="8 8"
                opacity={gridOpacity}
              />
              <text
                x={padding - 20}
                y={y + 5}
                fill={textColor}
                fontSize={20}
                textAnchor="end"
                opacity={gridOpacity}
              >
                {formatCurrency(t * maxValue)}
              </text>
            </g>
          );
        })}

        {/* Area Fill */}
        <path
          d={areaPath}
          fill={areaColor}
          opacity={areaOpacity * lineDrawProgress}
        />

        {/* Main Line */}
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4000"
          strokeDashoffset={4000 * (1 - lineDrawProgress)}
        />

        {/* Data Points */}
        {points.map((p, i) => {
          const pointDelay = 20 + (i / (points.length - 1)) * 60;
          const pointScale = spring({
            frame: frame - pointDelay,
            fps,
            config: { damping: 12, stiffness: 200 },
          });

          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={12 * pointScale}
                fill={backgroundColor}
                stroke={lineColor}
                strokeWidth={4}
              />
              {/* Year Labels */}
              <text
                x={p.x}
                y={height - padding + 50}
                fill={textColor}
                fontSize={24}
                textAnchor="middle"
                opacity={pointScale}
              >
                {p.label}
              </text>
              {/* Value Popups */}
              <text
                x={p.x}
                y={p.y - 30}
                fill={textColor}
                fontSize={22}
                fontWeight="bold"
                textAnchor="middle"
                opacity={pointScale}
              >
                {formatCurrency(p.val)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Header UI */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: padding,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 64,
            fontWeight: "800",
            color: textColor,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: 28,
            color: textColor,
            opacity: 0.7,
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Counter - Top Right */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: padding,
          textAlign: "right",
          opacity: titleOpacity,
        }}
      >
        <div style={{ fontSize: 20, color: textColor, opacity: 0.6, marginBottom: 4 }}>
          TOTAL GROWTH
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: "900",
            color: lineColor,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatCurrency(
            interpolate(lineDrawProgress, [0, 1], [data[0].income, data[data.length - 1].income])
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default IncomeProgressChart;