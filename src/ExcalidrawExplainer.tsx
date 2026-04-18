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

// VO Script (for edge-tts generation later):
// Scene 1 (0-5s): "What if you could turn any text description into a professional diagram, just by asking? This is Excalidraw Skill for Claude Code."
// Scene 2 (5-12s): "Here's how it works. You type a description. Claude reads the skill and knows exactly how to draw it. The Excalidraw MCP creates the diagram live on a canvas. And the best part, it takes a screenshot of its own work and fixes any issues automatically."
// Scene 3 (12-19s): "The skill comes with ten built-in visual techniques. Layered glow effects, color-coded zones, bound arrows that snap to shapes, diamond decision nodes, semantic colors, and even Mermaid diagram conversion. Everything you need for clean, professional diagrams."
// Scene 4 (19-26s): "Setting it up takes three steps. Clone and build the MCP server. Add it to Claude Code. Then start the canvas and install the skill. That's it. You're ready to go."
// Scene 5 (26-33s): "Here's what it can actually create. Hierarchy trees, network diagrams, process flowcharts, all built from a single text prompt. Export as PNG, SVG, or a shareable link."
// Scene 6 (33-37s): "Link in the description. Star the repo if it's useful."

// VO durations: 8.4s, 17.5s, 17s, 13.5s, 13.8s, 4.6s = ~75s total
// Add 1s buffer per scene. At 30fps:
const SCENES = [
  { label: "INTRO", start: 0, end: 285 },           // 0-9.5s (8.4s VO + buffer)
  { label: "HOW IT WORKS", start: 285, end: 845 },  // 9.5-28.2s (18.7s for 17.5s VO)
  { label: "TECHNIQUES", start: 845, end: 1385 },   // 28.2-46.2s (18s for 17s VO)
  { label: "SETUP", start: 1385, end: 1825 },       // 46.2-60.8s (14.7s for 13.5s VO)
  { label: "DEMO", start: 1825, end: 2275 },        // 60.8-75.8s (15s for 13.8s VO)
  { label: "OUTRO", start: 2275, end: 2445 },       // 75.8-81.5s (5.7s for 4.6s VO)
];

// Transition types for variety
type TransitionType = "slideLeft" | "slideRight" | "slideUp" | "scaleRotate" | "wipe" | "none";

const TransitionWrapper: React.FC<{
  children: React.ReactNode;
  enterTransition?: TransitionType;
  exitTransition?: TransitionType;
  transitionFrames?: number;
}> = ({
  children,
  enterTransition = "slideLeft",
  exitTransition = "slideLeft",
  transitionFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ENTER
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // EXIT
  const exitStart = durationInFrames - transitionFrames;
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const getEnterTransform = () => {
    switch (enterTransition) {
      case "slideLeft":
        return `translateX(${(1 - enterProgress) * 100}%)`;
      case "slideRight":
        return `translateX(${(1 - enterProgress) * -100}%)`;
      case "slideUp":
        return `translateY(${(1 - enterProgress) * 100}%)`;
      case "scaleRotate":
        return `scale(${enterProgress}) rotate(${(1 - enterProgress) * 10}deg)`;
      case "wipe":
        return `scaleX(1)`;
      default:
        return "none";
    }
  };

  const getExitTransform = () => {
    switch (exitTransition) {
      case "slideLeft":
        return `translateX(${exitProgress * -100}%)`;
      case "slideRight":
        return `translateX(${exitProgress * 100}%)`;
      case "slideUp":
        return `translateY(${exitProgress * -100}%)`;
      case "scaleRotate":
        return `scale(${1 - exitProgress * 0.5}) rotate(${exitProgress * -10}deg)`;
      case "wipe":
        return `scaleX(1)`;
      default:
        return "none";
    }
  };

  const enterOpacity = enterTransition === "wipe"
    ? interpolate(frame, [0, transitionFrames], [0, 1], { extrapolateRight: "clamp" })
    : 1;

  const exitOpacity = exitTransition === "wipe"
    ? 1 - exitProgress
    : 1;

  const isEntering = frame < transitionFrames;
  const isExiting = frame >= exitStart;

  let transform = "none";
  let opacity = 1;

  if (isEntering) {
    transform = getEnterTransform();
    opacity = enterOpacity;
  } else if (isExiting) {
    transform = getExitTransform();
    opacity = exitOpacity;
  }

  return (
    <AbsoluteFill style={{ transform, opacity, overflow: "hidden" }}>
      {children}
    </AbsoluteFill>
  );
};

// Animated particles/dots background
const ParticleBg: React.FC<{ color?: string }> = ({ color = "rgba(100,150,255,0.08)" }) => {
  const frame = useCurrentFrame();
  const dots = Array.from({ length: 20 }, (_, i) => {
    const x = ((i * 137.5) % 100);
    const y = ((i * 97.3 + frame * 0.15 * (i % 3 + 1)) % 120) - 10;
    const size = 3 + (i % 4) * 2;
    const opacity = 0.3 + (i % 3) * 0.2;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          opacity,
        }}
      />
    );
  });
  return <AbsoluteFill>{dots}</AbsoluteFill>;
};

// Animated scan line effect
const ScanLines: React.FC = () => {
  const frame = useCurrentFrame();
  const y = (frame * 3) % 1200;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y - 100,
          height: 2,
          background: "linear-gradient(90deg, transparent 0%, rgba(100,150,255,0.15) 50%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Scene number badge
const SceneBadge: React.FC<{ num: number; color: string }> = ({ num, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 10, stiffness: 120 } });
  const badgeOpacity = interpolate(frame, [60, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        right: 40,
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: color,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${scale})`,
        opacity: badgeOpacity,
        zIndex: 20,
        boxShadow: `0 0 20px ${color}66`,
      }}
    >
      <span
        style={{
          color: "white",
          fontSize: 28,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {num}
      </span>
    </div>
  );
};

const DiagramScene: React.FC<{
  imageSrc: string;
  sceneTitle?: string;
  sceneNum?: number;
  accentColor?: string;
  enterFrom?: TransitionType;
  exitTo?: TransitionType;
}> = ({
  imageSrc,
  sceneTitle,
  sceneNum = 1,
  accentColor = "#60a5fa",
  enterFrom = "slideLeft",
  exitTo = "slideLeft",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slow zoom throughout the scene - 1x to 1.4x
  const zoom = interpolate(frame, [25, durationInFrames - 15], [1, 1.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Title animation
  const titleSlide = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const titleOpacity = interpolate(frame, [0, 15, 70, 100], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow pulse on diagram
  const glowPulse = Math.sin(frame * 0.05) * 0.3 + 0.7;

  return (
    <TransitionWrapper enterTransition={enterFrom} exitTransition={exitTo}>
      <AbsoluteFill
        style={{
          background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0d0d1f 100%)",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <ParticleBg color={`${accentColor}15`} />
        <ScanLines />

        {sceneNum > 0 && <SceneBadge num={sceneNum} color={accentColor} />}

        {/* Accent line at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            opacity: 0.6,
            zIndex: 20,
          }}
        />

        {sceneTitle && (
          <div
            style={{
              position: "absolute",
              top: 35,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 44,
              fontWeight: 800,
              fontFamily: "system-ui, sans-serif",
              color: "white",
              opacity: titleOpacity,
              transform: `translateY(${(1 - titleSlide) * -40}px)`,
              zIndex: 10,
              textShadow: `0 0 30px ${accentColor}44`,
              letterSpacing: -1,
            }}
          >
            {sceneTitle}
          </div>
        )}

        <div
          style={{
            transform: `scale(${zoom})`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 ${60 + glowPulse * 40}px ${accentColor}22`,
            border: `1px solid ${accentColor}20`,
          }}
        >
          <Img
            src={staticFile(imageSrc)}
            style={{
              maxWidth: 1600,
              maxHeight: 800,
              objectFit: "contain",
            }}
          />
        </div>
      </AbsoluteFill>
    </TransitionWrapper>
  );
};

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tagOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [130, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #12122a 50%, #0d0d1f 100%)",
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Accent glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(100,150,255,0.15) 0%, transparent 70%)",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        style={{
          textAlign: "center",
          transform: `scale(${titleScale})`,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Excalidraw Skill
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 300,
            color: "rgba(255,255,255,0.8)",
            marginTop: 8,
            opacity: subtitleOpacity,
          }}
        >
          for Claude Code
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.4)",
            marginTop: 24,
            opacity: tagOpacity,
            fontWeight: 400,
          }}
        >
          Text to diagrams. Automatically.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const { durationInFrames } = useVideoConfig();
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <TransitionWrapper enterTransition="scaleRotate" exitTransition="wipe">
      <AbsoluteFill
        style={{
          background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0d0d1f 100%)",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "system-ui, sans-serif",
          opacity: fadeOut,
        }}
      >
        <ParticleBg color="rgba(167,139,250,0.1)" />

        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(100,150,255,0.12) 0%, transparent 70%)",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        <div style={{ textAlign: "center", transform: `scale(${scale})`, zIndex: 10 }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: -2,
            }}
          >
            Link in Description
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.4)",
              marginTop: 20,
              fontFamily: "monospace",
            }}
          >
            Link in Description
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.25)",
              marginTop: 30,
            }}
          >
            by AI Injection
          </div>
        </div>
      </AbsoluteFill>
    </TransitionWrapper>
  );
};

export const ExcalidrawExplainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a1a" }}>
      {/* Voiceover tracks - synced to scene starts */}
      <Sequence from={0}>
        <Audio src={staticFile("vo/scene1.mp3")} volume={1} />
      </Sequence>
      <Sequence from={285}>
        <Audio src={staticFile("vo/scene2.mp3")} volume={1} />
      </Sequence>
      <Sequence from={845}>
        <Audio src={staticFile("vo/scene3.mp3")} volume={1} />
      </Sequence>
      <Sequence from={1385}>
        <Audio src={staticFile("vo/scene4.mp3")} volume={1} />
      </Sequence>
      <Sequence from={1825}>
        <Audio src={staticFile("vo/scene5.mp3")} volume={1} />
      </Sequence>
      <Sequence from={2275}>
        <Audio src={staticFile("vo/scene6.mp3")} volume={1} />
      </Sequence>

      <Sequence from={SCENES[0].start} durationInFrames={SCENES[0].end - SCENES[0].start}>
        <IntroScene />
      </Sequence>

      <Sequence from={SCENES[1].start} durationInFrames={SCENES[1].end - SCENES[1].start}>
        <DiagramScene
          imageSrc="scene-howitworks.png"
          sceneTitle="How It Works"
          sceneNum={1}
          accentColor="#a78bfa"
          enterFrom="slideLeft"
          exitTo="slideRight"
        />
      </Sequence>

      <Sequence from={SCENES[2].start} durationInFrames={SCENES[2].end - SCENES[2].start}>
        <DiagramScene
          imageSrc="scene-techniques.png"
          sceneTitle="10 Visual Techniques"
          sceneNum={2}
          accentColor="#60a5fa"
          enterFrom="slideUp"
          exitTo="scaleRotate"
        />
      </Sequence>

      <Sequence from={SCENES[3].start} durationInFrames={SCENES[3].end - SCENES[3].start}>
        <DiagramScene
          imageSrc="scene-setup.png"
          sceneTitle="Setup in 3 Steps"
          sceneNum={3}
          accentColor="#34d399"
          enterFrom="scaleRotate"
          exitTo="slideLeft"
        />
      </Sequence>

      <Sequence from={SCENES[4].start} durationInFrames={SCENES[4].end - SCENES[4].start}>
        <DiagramScene
          imageSrc="scene-demo.png"
          sceneTitle="What It Creates"
          sceneNum={4}
          accentColor="#f472b6"
          enterFrom="slideRight"
          exitTo="slideUp"
        />
      </Sequence>

      <Sequence from={SCENES[5].start} durationInFrames={SCENES[5].end - SCENES[5].start}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
