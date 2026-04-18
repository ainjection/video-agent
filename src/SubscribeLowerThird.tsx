import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

const CHANNEL_NAME = "AI Injection";
const SUB_COUNT = "1.79K subscribers";
const AVATAR = staticFile("avatar.jpg");

// Cursor SVG as a component
const Cursor = ({ x, y, clicking }: { x: number; y: number; clicking: boolean }) => (
  <div className="absolute z-50 pointer-events-none" style={{ left: x, top: y, transform: "translate(-2px, -2px)" }}>
    <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
      <path
        d="M5 2L5 24L10.5 18.5L15.5 28L19 26.5L14 17L21 17L5 2Z"
        fill={clicking ? "#333" : "white"}
        stroke="black"
        strokeWidth="1.5"
      />
    </svg>
  </div>
);

export const SubscribeLowerThird = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // TIMELINE:
  // 0-30: Card slides in
  // 30-60: Cursor moves to subscribe button
  // 60-65: Click - button changes to subscribed
  // 65-100: Cursor moves to bell
  // 100-105: Click bell - bell turns gold
  // 105-140: Bell rings with wiggle
  // 140-180: Hold
  // 180-210: Slide out

  const slideIn = spring({ frame, fps, config: { stiffness: 80, damping: 14 } });
  const avatarPop = spring({ frame: frame - 8, fps, config: { stiffness: 120, damping: 10 } });
  const textSlide = spring({ frame: frame - 12, fps, config: { stiffness: 100, damping: 14 } });
  const btnSlide = spring({ frame: frame - 20, fps, config: { stiffness: 100, damping: 12 } });
  const bellPop = spring({ frame: frame - 28, fps, config: { stiffness: 200, damping: 10 } });

  // Subscribe button state
  const subscribed = frame >= 63;
  const subscribeBounce = frame >= 63 && frame < 75
    ? spring({ frame: frame - 63, fps, config: { stiffness: 300, damping: 8 } })
    : 1;

  // Bell state
  const bellClicked = frame >= 103;
  const bellBounce = frame >= 103 && frame < 115
    ? spring({ frame: frame - 103, fps, config: { stiffness: 300, damping: 8 } })
    : 1;

  // Bell wiggle after click
  const bellWiggle = frame >= 108 && frame < 145
    ? Math.sin((frame - 108) * 1.2) * 20 * Math.max(0, 1 - (frame - 108) / 37)
    : 0;

  // Cursor position
  const cursorX = interpolate(frame, [30, 55, 63, 65, 95], [300, 715, 715, 715, 810], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp"
  });
  const cursorY = interpolate(frame, [30, 55, 63, 65, 95], [200, 535, 535, 535, 535], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp"
  });
  const clicking = (frame >= 60 && frame <= 65) || (frame >= 100 && frame <= 105);
  const cursorVisible = frame >= 30 && frame < 140;

  // Slide out
  const slideOut = frame > 185
    ? interpolate(frame, [185, 210], [0, 1], { extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Card container */}
      <div
        className="absolute bottom-24 left-0 right-0 flex justify-center"
        style={{
          transform: `translateY(${interpolate(slideIn, [0, 1], [150, 0]) + slideOut * 150}px)`,
          opacity: interpolate(slideOut, [0, 0.8, 1], [1, 1, 0]),
        }}
      >
        <div className="flex items-center relative">
          {/* Avatar */}
          <div className="relative z-20" style={{ transform: `scale(${avatarPop})` }}>
            <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] border-white shadow-xl">
              <Img src={AVATAR} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info card */}
          <div
            className="flex items-center gap-3 bg-[#212121] rounded-r-full pl-10 pr-4 py-2 -ml-6 z-10"
            style={{
              transform: `scaleX(${textSlide})`,
              transformOrigin: "left center",
              opacity: textSlide,
            }}
          >
            <div className="flex flex-col mr-2">
              <span className="text-white text-lg font-bold leading-tight whitespace-nowrap">
                {CHANNEL_NAME}
              </span>
              <span className="text-[#aaaaaa] text-xs leading-tight whitespace-nowrap">
                {SUB_COUNT}
              </span>
            </div>

            {/* Subscribe button - changes on click */}
            <div style={{ transform: `scale(${btnSlide * subscribeBounce})`, opacity: btnSlide }}>
              <div
                className={`px-4 py-[6px] rounded-full text-sm font-semibold whitespace-nowrap ${
                  subscribed
                    ? "bg-[#333333] text-[#aaaaaa]"
                    : "bg-white text-[#0f0f0f]"
                }`}
                style={{
                  transition: "none",
                }}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </div>
            </div>

            {/* Bell - changes color on click */}
            <div
              style={{
                transform: `scale(${bellPop * bellBounce}) rotate(${bellWiggle}deg)`,
                opacity: bellPop,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={bellClicked ? "#FFD700" : "#ffffff"}>
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
              </svg>
              {/* Gold glow on bell click */}
              {bellClicked && (
                <div className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: "0 0 15px rgba(255,215,0,0.6)",
                    opacity: interpolate(frame - 103, [0, 10, 30], [1, 0.5, 0], { extrapolateRight: "clamp" }),
                  }} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cursor */}
      {cursorVisible && <Cursor x={cursorX} y={cursorY} clicking={clicking} />}

      {/* Click ripple on subscribe */}
      {frame >= 60 && frame < 72 && (
        <div className="absolute z-40" style={{ left: 715, top: 530 }}>
          <div className="w-8 h-8 rounded-full border-2 border-white/40"
            style={{
              transform: `scale(${interpolate(frame - 60, [0, 12], [0.5, 3])})`,
              opacity: interpolate(frame - 60, [0, 12], [0.6, 0]),
            }} />
        </div>
      )}

      {/* Click ripple on bell */}
      {frame >= 100 && frame < 112 && (
        <div className="absolute z-40" style={{ left: 810, top: 530 }}>
          <div className="w-8 h-8 rounded-full border-2 border-yellow-400/40"
            style={{
              transform: `scale(${interpolate(frame - 100, [0, 12], [0.5, 3])})`,
              opacity: interpolate(frame - 100, [0, 12], [0.6, 0]),
            }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// V2 export kept for backwards compatibility
export const SubscribeLowerThirdV2 = SubscribeLowerThird;
