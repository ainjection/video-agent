import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  spring,
  Easing,
} from "remotion";

export const PagePanDown: React.FC<{
  imageSrc?: string;
  title?: string;
  subtitle?: string;
}> = ({
  imageSrc = "github-screenshot.jpg",
  title = "Excalidraw Skill for Claude Code",
  subtitle = "by RoboNuggets",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // --- INTRO: Title card (frames 0-60) ---
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleExit = interpolate(frame, [50, 70], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // --- PAN SECTION (frames 60 to near end) ---
  const panStart = 70;
  const panEnd = durationInFrames - 5;
  const panDuration = panEnd - panStart;

  // The image is tall (roughly 2:1 ratio or more)
  // We show it at full width and pan vertically
  const imageAspect = 650 / 1280; // width/height of a typical full-page screenshot
  const displayWidth = width;
  const displayHeight = displayWidth / imageAspect;
  const maxScroll = displayHeight - height;

  // Smooth eased pan
  const scrollY = interpolate(frame, [panStart, panEnd], [0, maxScroll], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Fade in the screenshot
  const screenshotOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- OUTRO: quick cut, no fade ---
  const outroOpacity = interpolate(
    frame,
    [durationInFrames - 5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle vignette overlay
  const vignetteStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
    pointerEvents: "none",
    zIndex: 10,
  };

  // Browser chrome frame
  const browserChrome: React.CSSProperties = {
    position: "absolute",
    top: 40,
    left: 80,
    right: 80,
    bottom: 40,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
    background: "#1a1a2e",
  };

  const browserBar: React.CSSProperties = {
    height: 36,
    background: "linear-gradient(180deg, #2d2d44 0%, #252538 100%)",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    gap: 8,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  };

  const dot = (color: string): React.CSSProperties => ({
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: color,
  });

  const urlBar: React.CSSProperties = {
    flex: 1,
    height: 22,
    borderRadius: 4,
    background: "rgba(255,255,255,0.08)",
    marginLeft: 12,
    display: "flex",
    alignItems: "center",
    paddingLeft: 10,
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontFamily: "monospace",
  };

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0d0d1f 100%)",
        opacity: outroOpacity,
      }}
    >
      {/* Title Card */}
      {frame < 75 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: titleOpacity * titleExit,
            transform: `scale(${titleScale})`,
            zIndex: 20,
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "white",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                letterSpacing: -2,
                lineHeight: 1.1,
                background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 32,
                marginTop: 16,
                color: "rgba(255,255,255,0.6)",
                fontWeight: 400,
              }}
            >
              {subtitle}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Browser Window with Pan */}
      <div style={{ ...browserChrome, opacity: screenshotOpacity }}>
        {/* Browser bar */}
        <div style={browserBar}>
          <div style={dot("#ff5f57")} />
          <div style={dot("#febc2e")} />
          <div style={dot("#28c840")} />
          <div style={urlBar}>
            github.com/robonuggets/excalidraw-skill
          </div>
        </div>

        {/* Scrolling content area */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "calc(100% - 36px)",
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile(imageSrc)}
            style={{
              width: "100%",
              position: "absolute",
              top: -scrollY,
              left: 0,
            }}
          />
        </div>
      </div>

      {/* Vignette */}
      <div style={vignetteStyle} />
    </AbsoluteFill>
  );
};
