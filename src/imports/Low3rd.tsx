import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { PresetSchema, PresetMeta, PresetExport } from "@/lib/types";

export const schema: PresetSchema = {
  nameText: {
    type: "text",
    label: "Name",
    default: "Gemini Expert",
    group: "Content",
  },
  roleText: {
    type: "text",
    label: "Role",
    default: "AI Engineer",
    group: "Content",
  },
  accentColor: {
    type: "color",
    label: "Accent Color",
    default: "#10b981",
    group: "Style",
  },
};

export const meta: PresetMeta = {
  name: "Gemini Lower Third",
  description: "Professional animated lower third with a neon glowing edge.",
  category: "lower-third",
  fps: 30,
  width: 1920,
  height: 1080,
  durationInFrames: 150,
};

export const Component: React.FC<Record<string, unknown>> = ({
  nameText = schema.nameText.default,
  roleText = schema.roleText.default,
  accentColor = schema.accentColor.default,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introWidth = spring({ fps, frame, config: { damping: 14 } });
  const introOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  
  // Outro animation starting at frame 130
  const outroWidth = interpolate(frame, [130, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  
  const currentWidth = frame < 130 ? introWidth : outroWidth;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", justifyContent: "flex-end", paddingBottom: "100px", paddingLeft: "100px", fontFamily: "sans-serif" }}>
      <div style={{ opacity: introOpacity, width: `${currentWidth * 600}px`, overflow: "hidden", display: "flex", flexDirection: "column", background: "rgba(10, 10, 10, 0.8)", borderLeft: `8px solid ${accentColor}`, borderRadius: "0 16px 16px 0", padding: "24px 40px", backdropFilter: "blur(10px)", boxShadow: `0 0 30px ${accentColor}40` }}>
        <h2 style={{ color: "white", fontSize: "48px", fontWeight: "bold", margin: 0, whiteSpace: "nowrap" }}>{nameText as string}</h2>
        <h3 style={{ color: accentColor as string, fontSize: "28px", fontWeight: "normal", margin: "8px 0 0 0", whiteSpace: "nowrap" }}>{roleText as string}</h3>
      </div>
    </AbsoluteFill>
  );
};

const preset: PresetExport = { schema, meta, component: Component };
export default preset;


// Added by dashboard importer: adapter that reads preset defaults at runtime.
// Iterates preset.schema directly so complex default shapes (nested objects,
// arrays) are handled correctly — something regex parsing can't do.
const __STATIC_DEFAULTS: any = {
    "nameText": "Gemini Expert",
    "roleText": "AI Engineer",
    "accentColor": "#10b981"
  };

export const __ImportedComp: React.FC<any> = (props) => {
  const defaults: any = { ...__STATIC_DEFAULTS };
  try {
    const _p: any = preset;
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
  return React.createElement(Component, { ...defaults, ...props });
};
