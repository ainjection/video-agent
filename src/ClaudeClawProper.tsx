import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  spring,
  Easing,
} from "remotion";

// Scene timings based on VO durations (at 30fps) + 1s buffer each
// s1-hook: 4.1s = 150f (with hold)
// s2-problem: 15s = 480f
// s3-reveal: 7.7s = 260f (includes pan-down start)
// s4-howitworks: 16.4s = 520f (architecture diagram)
// s5-v2features: 17.3s = 550f (features diagram)
// s6-examples: 14.5s = 465f
// s7-close: 5.4s = 180f
// Total: ~2605 frames = ~87s

const BG = "linear-gradient(135deg, #0a0a1a 0%, #12122a 50%, #0d0d1f 100%)";

const Particles: React.FC<{ color?: string }> = ({ color = "rgba(245,158,11,0.06)" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: 15 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 137.5) % 100}%`,
          top: `${((i * 97.3 + frame * 0.12 * (i % 3 + 1)) % 120) - 10}%`,
          width: 2 + (i % 4) * 2, height: 2 + (i % 4) * 2,
          borderRadius: "50%", background: color, opacity: 0.3 + (i % 3) * 0.15,
        }} />
      ))}
    </AbsoluteFill>
  );
};

// Scene 1: Hook - big text, dramatic
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });
  const wordDelay = [0, 15, 30, 45, 55, 65, 75, 85, 95, 105];
  const words = "What if your AI didn't stop working when you closed the laptop?".split(" ");

  return (
    <AbsoluteFill style={{ background: BG, justifyContent: "center", alignItems: "center" }}>
      <Particles />
      <div style={{
        fontSize: 62, fontWeight: 800, fontFamily: "system-ui, sans-serif",
        color: "white", textAlign: "center", maxWidth: 1200, lineHeight: 1.3,
        transform: `scale(${scale})`,
      }}>
        {words.map((word, i) => {
          const delay = wordDelay[Math.min(i, wordDelay.length - 1)];
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const isHighlight = word === "didn't" || word === "stop" || word === "closed";
          return (
            <span key={i} style={{
              opacity,
              color: isHighlight ? "#f59e0b" : "white",
              marginRight: 14,
            }}>{word} </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: Problem - text with fade reveals
const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const lines = [
    { text: "Most people use Claude for one task at a time.", delay: 0 },
    { text: "Ask a question. Get an answer. Close the tab.", delay: 60 },
    { text: "But what if it could run in the background...", delay: 150 },
    { text: "24/7", delay: 240, big: true },
    { text: "Handling your content, your messages,", delay: 300 },
    { text: "your entire workflow?", delay: 340 },
  ];

  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG, justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      <Particles />
      <div style={{ textAlign: "center", fontFamily: "system-ui, sans-serif", maxWidth: 1100 }}>
        {lines.map((line, i) => {
          const opacity = interpolate(frame, [line.delay, line.delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const y = interpolate(frame, [line.delay, line.delay + 20], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              opacity, transform: `translateY(${y}px)`,
              fontSize: line.big ? 80 : 32,
              fontWeight: line.big ? 800 : 300,
              color: line.big ? "#f59e0b" : "rgba(255,255,255,0.8)",
              marginBottom: line.big ? 20 : 12,
            }}>{line.text}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: Reveal + Pan-down
const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [0, 15, 60, 80], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Pan-down starts after title fades - SLOW scroll, fills entire remaining duration
  const panOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panStart = 90;
  const panEnd = durationInFrames - 3;
  const imageAspect = 650 / 1400;
  const displayWidth = width - 160;
  const displayHeight = displayWidth / imageAspect;
  const maxScroll = Math.max(0, displayHeight - (height - 116));
  const scrollY = interpolate(frame, [panStart, panEnd], [0, maxScroll], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Particles />

      {/* Title overlay */}
      {frame < 85 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", zIndex: 20, opacity: titleOpacity }}>
          <div style={{ textAlign: "center", transform: `scale(${titleScale})`, fontFamily: "system-ui, sans-serif" }}>
            <div style={{
              fontSize: 72, fontWeight: 800, letterSpacing: -3,
              background: "linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>ClaudeClaw</div>
            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", marginTop: 10 }}>
              Always-on AI Agent Team
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Browser pan-down */}
      <div style={{
        position: "absolute", top: 40, left: 80, right: 80, bottom: 40,
        borderRadius: 12, overflow: "hidden", opacity: panOpacity,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(245,158,11,0.1)",
        background: "#1a1a2e",
      }}>
        <div style={{
          height: 36, background: "linear-gradient(180deg, #2d2d44, #252538)",
          display: "flex", alignItems: "center", padding: "0 12px", gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
          <div style={{
            flex: 1, height: 22, borderRadius: 4, background: "rgba(255,255,255,0.08)",
            marginLeft: 12, display: "flex", alignItems: "center", paddingLeft: 10,
            color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "monospace",
          }}>github.com</div>
        </div>
        <div style={{ position: "relative", width: "100%", height: "calc(100% - 36px)", overflow: "hidden" }}>
          <Img src={staticFile("claudeclaw-github.jpg")} style={{ width: "100%", position: "absolute", top: -scrollY, left: 0 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 4-6: Diagram with big text overlay
const DiagramWithTextScene: React.FC<{
  image: string;
  lines: { text: string; delay: number; color?: string; size?: number }[];
  accent: string;
}> = ({ image, lines, accent }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const zoom = interpolate(frame, [20, durationInFrames - 15], [1, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const entryScale = spring({ frame, fps, config: { damping: 14, stiffness: 80 }, from: 0.9, to: 1 });
  const fadeOut = interpolate(frame, [durationInFrames - 18, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG, opacity: fadeOut }}>
      <Particles color={`${accent}10`} />

      {/* Diagram in background, dimmed */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 0.6 }}>
        <div style={{ transform: `scale(${entryScale * zoom})`, borderRadius: 14, overflow: "hidden" }}>
          <Img src={staticFile(image)} style={{ maxWidth: 1600, maxHeight: 800, objectFit: "contain" }} />
        </div>
      </AbsoluteFill>

      {/* Text overlay */}
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 100px 80px 100px" }}>
        <div style={{
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)",
          borderRadius: 16, padding: "30px 40px", border: `1px solid ${accent}30`,
          maxWidth: 900,
        }}>
          {lines.map((line, i) => {
            const opacity = interpolate(frame, [line.delay, line.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                opacity, fontFamily: "system-ui, sans-serif",
                fontSize: line.size || 24, fontWeight: 400,
                color: line.color || "rgba(255,255,255,0.85)",
                marginBottom: 8,
              }}>{line.text}</div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Accent bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.5 }} />
    </AbsoluteFill>
  );
};

// Close scene
const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG, justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      <Particles color="rgba(245,158,11,0.08)" />
      <div style={{ textAlign: "center", transform: `scale(${scale})`, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ fontSize: 48, fontWeight: 300, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>Open Source</div>
        <div style={{
          fontSize: 64, fontWeight: 800, letterSpacing: -2,
          background: "linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>Link in Description</div>
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.3)", marginTop: 30 }}>AI Injection</div>
      </div>
    </AbsoluteFill>
  );
};

export const ClaudeClawProper: React.FC = () => {
  // Scene starts: hook=0, problem=150, reveal=630, howitworks=890, v2features=1410, examples=1960, close=2425
  return (
    <AbsoluteFill style={{ background: "#0a0a1a" }}>
      {/* Audio tracks - tight timing, 15 frame gaps between VO segments
           s1: 4.1s=123f, s2: 15s=450f, s3: 7.7s=232f, s4: 16.4s=493f,
           s5: 17.3s=519f, s6: 14.5s=435f, s7: 4s=120f */}
      <Sequence from={5}><Audio src={staticFile("vo-cc2-proper/s1-hook.mp3")} volume={1} /></Sequence>
      <Sequence from={138}><Audio src={staticFile("vo-cc2-proper/s2-problem.mp3")} volume={1} /></Sequence>
      <Sequence from={600}><Audio src={staticFile("vo-cc2-proper/s3-reveal.mp3")} volume={1} /></Sequence>
      <Sequence from={847}><Audio src={staticFile("vo-cc2-proper/s4-howitworks.mp3")} volume={1} /></Sequence>
      <Sequence from={1355}><Audio src={staticFile("vo-cc2-proper/s5-v2features.mp3")} volume={1} /></Sequence>
      <Sequence from={1889}><Audio src={staticFile("vo-cc2-proper/s6-examples.mp3")} volume={1} /></Sequence>
      <Sequence from={2339}><Audio src={staticFile("vo-cc2-proper/s7-close.mp3")} volume={1} /></Sequence>

      {/* Scene 1: Hook - 0 to 138 */}
      <Sequence from={0} durationInFrames={138}>
        <HookScene />
      </Sequence>

      {/* Scene 2: Problem - 138 to 600 */}
      <Sequence from={138} durationInFrames={462}>
        <ProblemScene />
      </Sequence>

      {/* Scene 3: Reveal + GitHub Pan - 600 to 847 */}
      <Sequence from={600} durationInFrames={247}>
        <RevealScene />
      </Sequence>

      {/* Scene 4: How it works - 847 to 1355 */}
      <Sequence from={847} durationInFrames={508}>
        <DiagramWithTextScene
          image="claudeclaw-features.png"
          accent="#f59e0b"
          lines={[
            { text: "Each agent gets its own Telegram bot", delay: 0, color: "#f59e0b", size: 28 },
            { text: "Its own memory and skills", delay: 50 },
            { text: "One runs YouTube. One handles clients.", delay: 120 },
            { text: "They run independently, even while you sleep.", delay: 240, color: "#f59e0b" },
          ]}
        />
      </Sequence>

      {/* Scene 5: V2 Features - 1355 to 1889 */}
      <Sequence from={1355} durationInFrames={534}>
        <DiagramWithTextScene
          image="claudeclaw-features.png"
          accent="#8b5cf6"
          lines={[
            { text: "V2: MCP Server Integration", delay: 0, color: "#8b5cf6", size: 28 },
            { text: "Connect to Blender, Excalidraw, Airtable, databases", delay: 50 },
            { text: "Hooks system for automated behaviors", delay: 150 },
            { text: "Full video production pipeline built in", delay: 280, color: "#22c55e" },
          ]}
        />
      </Sequence>

      {/* Scene 6: Real examples - 1889 to 2339 */}
      <Sequence from={1889} durationInFrames={450}>
        <DiagramWithTextScene
          image="claudeclaw-features.png"
          accent="#22c55e"
          lines={[
            { text: "3 Real-World Setups Included", delay: 0, color: "#22c55e", size: 28 },
            { text: "Content Creator - 4 channels, fully automated", delay: 50 },
            { text: "Dev Team - code review, testing, docs agents", delay: 130 },
            { text: "Business Ops - email, scheduling, reports", delay: 220 },
          ]}
        />
      </Sequence>

      {/* Scene 7: Close - 2339 to 2479 */}
      <Sequence from={2339} durationInFrames={140}>
        <CloseScene />
      </Sequence>
    </AbsoluteFill>
  );
};
