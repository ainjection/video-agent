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
import { z } from "zod";

// Schema for props
export const repoExplainerSchema = z.object({
  repoName: z.string(),
  repoSubtitle: z.string(),
  repoUrl: z.string(),
  accentColor: z.string().default("#60a5fa"),
  introVoFile: z.string().optional(),
  outroVoFile: z.string().optional(),
  introFrames: z.number().default(270),
  githubScreenshot: z.string().optional(),
  panDownFrames: z.number().default(360),
  scenes: z.array(z.object({
    title: z.string(),
    image: z.string(),
    voFile: z.string(),
    durationFrames: z.number(),
    accentColor: z.string(),
  })),
});

type RepoExplainerProps = z.infer<typeof repoExplainerSchema>;

// Floating particles
const ParticleBg: React.FC<{ color?: string }> = ({ color = "rgba(100,150,255,0.08)" }) => {
  const frame = useCurrentFrame();
  const dots = Array.from({ length: 15 }, (_, i) => {
    const x = ((i * 137.5) % 100);
    const y = ((i * 97.3 + frame * 0.12 * (i % 3 + 1)) % 120) - 10;
    const size = 2 + (i % 4) * 2;
    return (
      <div key={i} style={{
        position: "absolute", left: `${x}%`, top: `${y}%`,
        width: size, height: size, borderRadius: "50%",
        background: color, opacity: 0.3 + (i % 3) * 0.15,
      }} />
    );
  });
  return <AbsoluteFill>{dots}</AbsoluteFill>;
};

// Scan line
const ScanLine: React.FC = () => {
  const frame = useCurrentFrame();
  const y = (frame * 3) % 1200;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      <div style={{
        position: "absolute", left: 0, right: 0, top: y - 100, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(100,150,255,0.12), transparent)",
      }} />
    </AbsoluteFill>
  );
};

// Scene badge
const Badge: React.FC<{ num: number; color: string }> = ({ num, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 10, stiffness: 120 } });
  const opacity = interpolate(frame, [60, 90], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", top: 30, right: 40, width: 56, height: 56, borderRadius: "50%",
      background: color, display: "flex", justifyContent: "center", alignItems: "center",
      transform: `scale(${scale})`, opacity, zIndex: 20, boxShadow: `0 0 20px ${color}66`,
    }}>
      <span style={{ color: "white", fontSize: 26, fontWeight: 800, fontFamily: "system-ui" }}>{num}</span>
    </div>
  );
};

// Intro scene
const IntroScene: React.FC<{ title: string; subtitle: string; accent: string }> = ({ title, subtitle, accent }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const subOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0a0a1a 0%, #12122a 50%, #0d0d1f 100%)",
      justifyContent: "center", alignItems: "center", opacity: fadeOut,
    }}>
      <ParticleBg color={`${accent}15`} />
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}18, transparent 70%)`,
        top: "30%", left: "50%", transform: "translate(-50%, -50%)",
      }} />
      <div style={{ textAlign: "center", transform: `scale(${titleScale})`, fontFamily: "system-ui, sans-serif" }}>
        <div style={{
          fontSize: 76, fontWeight: 800, letterSpacing: -3, lineHeight: 1.1,
          background: `linear-gradient(135deg, ${accent}, #a78bfa, #f472b6)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>{title}</div>
        <div style={{ fontSize: 36, fontWeight: 300, color: "rgba(255,255,255,0.7)", marginTop: 10, opacity: subOpacity }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.35)", marginTop: 20, opacity: tagOpacity }}>
          by AI Injection
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Diagram scene with zoom + transitions
const DiagramScene: React.FC<{
  image: string; title: string; num: number; accent: string;
  enterFrom: "left" | "right" | "up" | "scale";
}> = ({ image, title, num, accent, enterFrom }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const exitStart = durationInFrames - 18;
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });

  const zoom = interpolate(frame, [25, durationInFrames - 15], [1, 1.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });

  const titleSlide = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [0, 15, 70, 100], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  let enterTransform = "";
  if (enterFrom === "left") enterTransform = `translateX(${(1 - enterProgress) * 100}%)`;
  else if (enterFrom === "right") enterTransform = `translateX(${(1 - enterProgress) * -100}%)`;
  else if (enterFrom === "up") enterTransform = `translateY(${(1 - enterProgress) * 100}%)`;
  else enterTransform = `scale(${enterProgress}) rotate(${(1 - enterProgress) * 8}deg)`;

  const exitTransform = `translateX(${exitProgress * -100}%)`;
  const isExiting = frame >= exitStart;

  return (
    <AbsoluteFill style={{
      transform: isExiting ? exitTransform : enterTransform,
      overflow: "hidden",
    }}>
      <AbsoluteFill style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0d0d1f 100%)",
        justifyContent: "center", alignItems: "center",
      }}>
        <ParticleBg color={`${accent}12`} />
        <ScanLine />
        <Badge num={num} color={accent} />

        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.5, zIndex: 20,
        }} />

        {title && (
          <div style={{
            position: "absolute", top: 35, left: 0, right: 0, textAlign: "center",
            fontSize: 42, fontWeight: 800, fontFamily: "system-ui, sans-serif", color: "white",
            opacity: titleOpacity, transform: `translateY(${(1 - titleSlide) * -40}px)`,
            zIndex: 10, textShadow: `0 0 30px ${accent}44`, letterSpacing: -1,
          }}>{title}</div>
        )}

        <div style={{
          transform: `scale(${zoom})`, borderRadius: 14, overflow: "hidden",
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 60px ${accent}18`,
          border: `1px solid ${accent}20`,
        }}>
          <Img src={staticFile(image)} style={{ maxWidth: 1600, maxHeight: 800, objectFit: "contain" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// GitHub Pan-Down Scene
const PanDownScene: React.FC<{ image: string; accent: string }> = ({ image, accent }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const panStart = 15;
  const panEnd = durationInFrames - 5;

  const imageAspect = 650 / 1400;
  const displayWidth = width - 160;
  const displayHeight = displayWidth / imageAspect;
  const maxScroll = Math.max(0, displayHeight - (height - 116));

  const scrollY = interpolate(frame, [panStart, panEnd], [0, maxScroll], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0d0d1f 100%)",
      opacity: fadeIn * fadeOut,
    }}>
      <ParticleBg color={`${accent}10`} />
      <div style={{
        position: "absolute", top: 40, left: 80, right: 80, bottom: 40,
        borderRadius: 12, overflow: "hidden",
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${accent}15`,
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
          <Img src={staticFile(image)} style={{ width: "100%", position: "absolute", top: -scrollY, left: 0 }} />
        </div>
      </div>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};

// Outro
const OutroScene: React.FC<{ repoUrl: string; accent: string }> = ({ repoUrl, accent }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0d0d1f 100%)",
      justifyContent: "center", alignItems: "center", fontFamily: "system-ui, sans-serif", opacity: fadeOut,
    }}>
      <ParticleBg color={`${accent}10`} />
      <div style={{ textAlign: "center", transform: `scale(${scale})`, zIndex: 10 }}>
        <div style={{
          fontSize: 58, fontWeight: 800, letterSpacing: -2,
          background: `linear-gradient(135deg, ${accent}, #a78bfa, #f472b6)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>Link in Description</div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", marginTop: 20 }}>
          AI Injection
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.2)", marginTop: 24, fontFamily: "monospace" }}>
          github.com/AI-Injection
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Main component
export const RepoExplainer: React.FC<RepoExplainerProps> = ({
  repoName, repoSubtitle, repoUrl, accentColor, introVoFile, outroVoFile,
  introFrames = 270, githubScreenshot, panDownFrames = 360, scenes,
}) => {
  const enterPatterns: Array<"left" | "right" | "up" | "scale"> = ["left", "up", "scale", "right"];

  // Calculate scene start frames
  const outroFrames = 150; // 5s outro
  let currentFrame = 0;

  const sceneStarts: number[] = [];
  // Intro
  sceneStarts.push(0);
  currentFrame = introFrames;
  // Pan-down (if screenshot provided)
  const panStart = githubScreenshot ? currentFrame : -1;
  if (githubScreenshot) currentFrame += panDownFrames;
  // Diagram scenes
  for (const scene of scenes) {
    sceneStarts.push(currentFrame);
    currentFrame += scene.durationFrames;
  }
  // Outro
  const outroStart = currentFrame;

  return (
    <AbsoluteFill style={{ background: "#0a0a1a" }}>
      {/* Intro VO */}
      {introVoFile && (
        <Sequence from={15}>
          <Audio src={staticFile(introVoFile)} volume={1} />
        </Sequence>
      )}
      {/* Outro VO */}
      {outroVoFile && (
        <Sequence from={outroStart}>
          <Audio src={staticFile(outroVoFile)} volume={1} />
        </Sequence>
      )}
      {/* Scene VO tracks */}
      {scenes.map((scene, i) => (
        <Sequence key={`vo-${i}`} from={sceneStarts[i + 1]}>
          <Audio src={staticFile(scene.voFile)} volume={1} />
        </Sequence>
      ))}

      {/* Intro */}
      <Sequence from={0} durationInFrames={introFrames}>
        <IntroScene title={repoName} subtitle={repoSubtitle} accent={accentColor} />
      </Sequence>

      {/* GitHub Pan-Down */}
      {githubScreenshot && panStart >= 0 && (
        <Sequence from={panStart} durationInFrames={panDownFrames}>
          <PanDownScene image={githubScreenshot} accent={accentColor} />
        </Sequence>
      )}

      {/* Diagram scenes */}
      {scenes.map((scene, i) => (
        <Sequence key={`scene-${i}`} from={sceneStarts[i + 1]} durationInFrames={scene.durationFrames}>
          <DiagramScene
            image={scene.image}
            title={scene.title}
            num={i + 1}
            accent={scene.accentColor}
            enterFrom={enterPatterns[i % enterPatterns.length]}
          />
        </Sequence>
      ))}

      {/* Outro */}
      <Sequence from={outroStart} durationInFrames={outroFrames}>
        <OutroScene repoUrl={repoUrl} accent={accentColor} />
      </Sequence>
    </AbsoluteFill>
  );
};
