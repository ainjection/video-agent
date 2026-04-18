import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

// ── Inline stubs for MotionKit's helpers ──────────────────────────────────
type Style = {
  accent: string;
  surface: string;
  textMuted: string;
  background: string;
  text: string;
  fontPrimary: string;
};

const STYLES: Record<string, Style> = {
  dark: {
    accent: "#f59e0b",
    surface: "#1a2030",
    textMuted: "#334155",
    background: "#0a0e1a",
    text: "#fafafa",
    fontPrimary: "system-ui, -apple-system, sans-serif",
  },
  light: {
    accent: "#2563eb",
    surface: "#e2e8f0",
    textMuted: "#94a3b8",
    background: "#f8fafc",
    text: "#0f172a",
    fontPrimary: "system-ui, -apple-system, sans-serif",
  },
};

// Simple equirectangular projection: lat/lon → pixel x/y within bounds.
const projectLatLon = (
  coord: [number, number],
  bounds: { width: number; height: number; padding: number }
) => {
  const [lon, lat] = coord;
  const usableW = bounds.width - bounds.padding * 2;
  const usableH = bounds.height - bounds.padding * 2;
  const x = ((lon + 180) / 360) * usableW + bounds.padding;
  const y = ((90 - lat) / 180) * usableH + bounds.padding;
  return { x, y };
};

// A stylised "map" background: grid of dots. Cheaper than loading real
// country data and still reads as a world map.
const makeMapDots = (bounds: { width: number; height: number }) => {
  const dots: { id: string; x: number; y: number }[] = [];
  const cols = 80;
  const rows = 40;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      dots.push({
        id: `${i}-${j}`,
        x: (i / cols) * bounds.width + 10,
        y: (j / rows) * bounds.height + 10,
      });
    }
  }
  return dots;
};

// Inline plane icon — simple SVG path, rotates with the route.
const PlaneIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <g transform={`translate(${-size / 2}, ${-size / 2})`}>
    <path
      d="M12 2 L13.5 10 L22 12 L13.5 14 L12 22 L10.5 14 L2 12 L10.5 10 Z"
      fill={color}
      transform={`scale(${size / 24})`}
    />
  </g>
);

// ── Main component ────────────────────────────────────────────────────────
const FlightMap: React.FC<Record<string, unknown>> = (props) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const styleName = (props.styleName as string) ?? "dark";
  const style = STYLES[styleName] ?? STYLES.dark;

  const accentColor = (props.accentColor as string) ?? style.accent;
  const baseColor = (props.baseColor as string) ?? style.surface;
  const backgroundColor = (props.backgroundColor as string) ?? style.background;
  const textColor = (props.textColor as string) ?? style.text;

  const originName = (props.originName as string) ?? "New York";
  const destinationName = (props.destinationName as string) ?? "Tokyo";
  const originLat = (props.originLat as number) ?? 40.7128;
  const originLon = (props.originLon as number) ?? -74.006;
  const destLat = (props.destLat as number) ?? 35.6895;
  const destLon = (props.destLon as number) ?? 139.6917;

  const bounds = { width, height, padding: 100 };
  const dots = makeMapDots(bounds);

  const originPos = projectLatLon([originLon, originLat], bounds);
  const destPos = projectLatLon([destLon, destLat], bounds);

  // Animation timings
  const mapOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const drawStart = 40;
  const drawDuration = 120;
  const drawProgress = interpolate(
    frame,
    [drawStart, drawStart + drawDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }
  );

  // Curved route via an SVG quadratic Bezier with a mid-point arched upward
  const midX = (originPos.x + destPos.x) / 2;
  const midY = Math.min(originPos.y, destPos.y) - Math.abs(destPos.x - originPos.x) * 0.25;
  const routePath = `M ${originPos.x} ${originPos.y} Q ${midX} ${midY} ${destPos.x} ${destPos.y}`;

  // Approximate curve length for stroke animation
  const dx = destPos.x - originPos.x;
  const dy = destPos.y - originPos.y;
  const straightLen = Math.sqrt(dx * dx + dy * dy);
  const totalLength = straightLen * 1.1;

  // Plane position — simple quadratic Bezier sampling
  const bezierPoint = (t: number) => {
    const x =
      (1 - t) * (1 - t) * originPos.x +
      2 * (1 - t) * t * midX +
      t * t * destPos.x;
    const y =
      (1 - t) * (1 - t) * originPos.y +
      2 * (1 - t) * t * midY +
      t * t * destPos.y;
    return { x, y };
  };
  const plane = bezierPoint(drawProgress);

  // Pulses
  const pulseOrigin = Math.sin((frame / 15) * Math.PI) * 0.2 + 1;
  const pulseDest =
    frame > drawStart + drawDuration - 10
      ? Math.sin(((frame - (drawStart + drawDuration)) / 15) * Math.PI) * 0.2 + 1
      : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        fontFamily: style.fontPrimary,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "100%", opacity: mapOpacity }}
      >
        {/* Stylised map dots */}
        <g opacity={0.35}>
          {dots.map((d) => (
            <circle key={d.id} cx={d.x} cy={d.y} r={1.5} fill={baseColor} />
          ))}
        </g>

        {/* Latitude lines for extra detail */}
        <g opacity={0.12} stroke={baseColor} strokeWidth={1} fill="none">
          {[-60, -30, 0, 30, 60].map((lat) => {
            const y = ((90 - lat) / 180) * (height - 200) + 100;
            return <line key={lat} x1={0} x2={width} y1={y} y2={y} />;
          })}
        </g>

        {/* Route — animated stroke dash */}
        <path
          d={routePath}
          fill="none"
          stroke={accentColor}
          strokeWidth={3}
          strokeDasharray={`${totalLength}`}
          strokeDashoffset={totalLength * (1 - drawProgress)}
          strokeLinecap="round"
        />

        {/* Origin marker */}
        <g transform={`translate(${originPos.x}, ${originPos.y})`}>
          <circle r={12 * pulseOrigin} fill={accentColor} opacity={0.3} />
          <circle r={5} fill={accentColor} />
          <text
            y={-20}
            textAnchor="middle"
            fill={textColor}
            fontSize={20}
            fontWeight="bold"
            style={{
              opacity: interpolate(frame, [20, 40], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {originName}
          </text>
        </g>

        {/* Destination marker */}
        <g transform={`translate(${destPos.x}, ${destPos.y})`}>
          <circle r={12 * pulseDest} fill={accentColor} opacity={0.3 * Math.min(1, pulseDest)} />
          <circle
            r={5}
            fill={accentColor}
            opacity={interpolate(drawProgress, [0.9, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
          <text
            y={-20}
            textAnchor="middle"
            fill={textColor}
            fontSize={20}
            fontWeight="bold"
            style={{
              opacity: interpolate(drawProgress, [0.9, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {destinationName}
          </text>
        </g>

        {/* Moving plane */}
        {drawProgress > 0 && drawProgress < 1 && (
          <g transform={`translate(${plane.x}, ${plane.y})`}>
            <PlaneIcon size={28} color={accentColor} />
          </g>
        )}
      </svg>

      {/* Bottom headline */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          color: textColor,
          fontSize: 48,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          opacity: interpolate(frame, [10, 40], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${interpolate(frame, [10, 40], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        {originName} <span style={{ color: accentColor, opacity: 0.6 }}>→</span> {destinationName}
      </div>
    </AbsoluteFill>
  );
};

// ── Preset wrapper (for the MotionKit-style schema UI) ────────────────────
const FlightMapPreset = {
  component: FlightMap as React.FC<Record<string, unknown>>,
  schema: {
    originName: {
      type: "text" as const,
      label: "Origin City",
      default: "New York",
      group: "Route",
    },
    destinationName: {
      type: "text" as const,
      label: "Destination City",
      default: "Tokyo",
      group: "Route",
    },
    originLat: {
      type: "number" as const,
      label: "Origin Latitude",
      default: 40.7128,
      min: -90,
      max: 90,
      step: 0.1,
      group: "Route",
    },
    originLon: {
      type: "number" as const,
      label: "Origin Longitude",
      default: -74.006,
      min: -180,
      max: 180,
      step: 0.1,
      group: "Route",
    },
    destLat: {
      type: "number" as const,
      label: "Destination Latitude",
      default: 35.6895,
      min: -90,
      max: 90,
      step: 0.1,
      group: "Route",
    },
    destLon: {
      type: "number" as const,
      label: "Destination Longitude",
      default: 139.6917,
      min: -180,
      max: 180,
      step: 0.1,
      group: "Route",
    },
    accentColor: {
      type: "color" as const,
      label: "Accent Color",
      default: "#f59e0b",
      group: "Colors",
    },
    backgroundColor: {
      type: "color" as const,
      label: "Background",
      default: "#0a0e1a",
      group: "Colors",
    },
    baseColor: {
      type: "color" as const,
      label: "Map Dots",
      default: "#1a2030",
      group: "Colors",
    },
    textColor: {
      type: "color" as const,
      label: "Text Color",
      default: "#fafafa",
      group: "Colors",
    },
  },
  meta: {
    name: "Global Flight Route",
    description: "Animated flight path arcing across a world map with pulsing markers.",
    category: "map" as const,
    tags: ["map", "flight", "route", "travel"],
    author: "Standalone version",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 240,
  },
};

export default FlightMapPreset;


// Added by dashboard importer: adapter that reads preset defaults at runtime.
// Iterates preset.schema directly so complex default shapes (nested objects,
// arrays) are handled correctly — something regex parsing can't do.
const __STATIC_DEFAULTS: any = {
    "originName": "New York",
    "destinationName": "Tokyo",
    "originLat": 40.7128,
    "originLon": -74.006,
    "destLat": 35.6895,
    "destLon": 139.6917,
    "accentColor": "#f59e0b",
    "backgroundColor": "#0a0e1a",
    "baseColor": "#1a2030",
    "textColor": "#fafafa"
  };

export const __ImportedComp: React.FC<any> = (props) => {
  const defaults: any = { ...__STATIC_DEFAULTS };
  try {
    const _p: any = FlightMapPreset;
    if (_p && typeof _p === 'object') {
      if (_p.schema && typeof _p.schema === 'object' && typeof _p.schema.parse !== 'function') {
        for (const key of Object.keys(_p.schema)) {
          const field = _p.schema[key];
          if (field && typeof field === 'object' && 'default' in field) {
            defaults[key] = field.default;
          }
        }
      }
      if (_p.schema && typeof _p.schema.parse === 'function') {
        try { Object.assign(defaults, _p.schema.parse({})); } catch {}
      }
      if (_p.meta && _p.meta.defaults) Object.assign(defaults, _p.meta.defaults);
      if (_p.defaults) Object.assign(defaults, _p.defaults);
    }
  } catch {}
  return React.createElement(FlightMap, { ...defaults, ...props });
};
