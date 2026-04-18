import { z } from 'zod';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const counterSchema = z.object({
  value: z.number().default(10000),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
  label: z.string().default(''),
  style: z.enum(['simple', 'card', 'gradient', 'neon', 'minimal']).default('card'),
  color: z.string().default('#8b5cf6'),
  fontSize: z.number().default(120),
  position: z.enum(['center', 'bottom', 'top']).default('center'),
});

type CounterProps = z.infer<typeof counterSchema>;

export const Counter: React.FC<CounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  label = '',
  style = 'card',
  color = '#8b5cf6',
  fontSize = 120,
  position = 'center',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate the counter value
  const progress = spring({
    frame,
    fps,
    config: { damping: 50, stiffness: 100, mass: 0.5 },
  });

  const displayValue = Math.floor(value * progress);

  // Entry animation
  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const positionStyles: React.CSSProperties = {
    center: { justifyContent: 'center', alignItems: 'center' },
    bottom: { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 100 },
    top: { justifyContent: 'flex-start', alignItems: 'center', paddingTop: 100 },
  }[position];

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (style === 'card') {
    return (
      <AbsoluteFill style={{ backgroundColor: '#0a0a1a', ...positionStyles, display: 'flex' }}>
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 24,
            padding: '40px 80px',
            transform: `scale(${scale})`,
            opacity,
            boxShadow: `0 0 60px ${color}40`,
            border: `2px solid ${color}40`,
          }}
        >
          <div style={{ color, fontSize, fontWeight: 'bold', fontFamily: 'system-ui, sans-serif' }}>
            {prefix}{formatNumber(displayValue)}{suffix}
          </div>
          {label && (
            <div style={{ color: '#a1a1aa', fontSize: fontSize * 0.25, marginTop: 10, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
              {label}
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  if (style === 'gradient') {
    return (
      <AbsoluteFill style={{ backgroundColor: '#0a0a1a', ...positionStyles, display: 'flex' }}>
        <div style={{ transform: `scale(${scale})`, opacity, textAlign: 'center' }}>
          <div
            style={{
              fontSize,
              fontWeight: 'bold',
              fontFamily: 'system-ui, sans-serif',
              background: `linear-gradient(135deg, ${color}, #ec4899)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
            }}
          >
            {prefix}{formatNumber(displayValue)}{suffix}
          </div>
          {label && (
            <div style={{ color: '#ffffff', fontSize: fontSize * 0.25, marginTop: 20, fontFamily: 'system-ui, sans-serif' }}>
              {label}
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  if (style === 'neon') {
    return (
      <AbsoluteFill style={{ ...positionStyles, display: 'flex', backgroundColor: '#0a0a1a' }}>
        <div style={{ transform: `scale(${scale})`, opacity, textAlign: 'center' }}>
          <div
            style={{
              fontSize,
              fontWeight: 'bold',
              fontFamily: 'system-ui, sans-serif',
              color: color,
              textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}, 0 0 80px ${color}`,
            }}
          >
            {prefix}{formatNumber(displayValue)}{suffix}
          </div>
          {label && (
            <div
              style={{
                color: '#ffffff',
                fontSize: fontSize * 0.25,
                marginTop: 20,
                fontFamily: 'system-ui, sans-serif',
                textShadow: '0 0 10px #ffffff40',
              }}
            >
              {label}
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  if (style === 'minimal') {
    return (
      <AbsoluteFill style={{ backgroundColor: '#0a0a1a', ...positionStyles, display: 'flex' }}>
        <div style={{ opacity, textAlign: 'center' }}>
          <div
            style={{
              fontSize: fontSize * 0.8,
              fontWeight: 300,
              fontFamily: 'system-ui, sans-serif',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            {prefix}{formatNumber(displayValue)}{suffix}
          </div>
          {label && (
            <div style={{ color: '#71717a', fontSize: fontSize * 0.2, marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'system-ui, sans-serif' }}>
              {label}
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // Simple style (default)
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a1a', ...positionStyles, display: 'flex' }}>
      <div style={{ transform: `scale(${scale})`, opacity, textAlign: 'center' }}>
        <div
          style={{
            fontSize,
            fontWeight: 'bold',
            fontFamily: 'system-ui, sans-serif',
            color: color,
            textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          {prefix}{formatNumber(displayValue)}{suffix}
        </div>
        {label && (
          <div style={{ color: '#ffffff', fontSize: fontSize * 0.25, marginTop: 20, fontFamily: 'system-ui, sans-serif' }}>
            {label}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
