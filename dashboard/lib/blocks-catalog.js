// Catalogue of available scene blocks. The AI picks from this list when
// composing a new video. Each entry has a machine-readable schema so the
// LLM knows what props it can set.
module.exports = {
  GradientBG: {
    category: 'background',
    description: 'Animated colour gradient. Great as a base layer behind text or frames.',
    props: {
      colors: { type: 'array<hex>', default: ['#7e22ce', '#3b0764'], description: '2-4 hex colours' },
      angle: { type: 'number', default: 135, description: 'degrees' },
      animated: { type: 'boolean', default: false },
      animationSpeed: { type: 'number', default: 6 }
    }
  },
  SolidColor: {
    category: 'background',
    description: 'Plain solid background.',
    props: { color: { type: 'hex', default: '#0a0a0a' } }
  },
  ParticleField: {
    category: 'background',
    description: 'Floating coloured particles drifting upward. Tech/cyber vibe.',
    props: {
      color: { type: 'hex', default: '#00e676' },
      count: { type: 'number', default: 40 },
      background: { type: 'hex', default: '#050507' }
    }
  },
  iPadFrame: {
    category: 'frame',
    description: 'iPad tablet mockup with an image or content inside. Good for app/demo reveals.',
    props: {
      image: { type: 'string (static path, e.g. "images/shot.png")', required: true },
      rotation: { type: 'number', default: 0, description: 'tilt in degrees' },
      scale: { type: 'number', default: 0.8 },
      entranceSpring: { type: 'boolean', default: true }
    }
  },
  iPhoneFrame: {
    category: 'frame',
    description: 'iPhone portrait mockup with an image inside. Good for mobile screenshots.',
    props: {
      image: { type: 'string', required: true },
      rotation: { type: 'number', default: 0 },
      scale: { type: 'number', default: 0.8 },
      entranceSpring: { type: 'boolean', default: true }
    }
  },
  BrowserWindow: {
    category: 'frame',
    description: 'Desktop browser window mockup with URL bar and content area.',
    props: {
      image: { type: 'string', required: true },
      url: { type: 'string', default: 'example.com' },
      width: { type: 'number', default: 1400 }
    }
  },
  TypewriterText: {
    category: 'text',
    description: 'Character-by-character typewriter text reveal with blinking cursor.',
    props: {
      text: { type: 'string', required: true },
      fontSize: { type: 'number', default: 84 },
      color: { type: 'hex', default: '#ffffff' },
      charsPerSecond: { type: 'number', default: 20 },
      align: { type: 'left|center|right', default: 'center' }
    }
  },
  SpinningText: {
    category: 'text',
    description: 'Text that rotates and scales in. Energetic / attention-grabbing.',
    props: {
      text: { type: 'string', required: true },
      fontSize: { type: 'number', default: 120 },
      color: { type: 'hex', default: '#ffffff' },
      rotationsPerSecond: { type: 'number', default: 0.5 },
      scaleIn: { type: 'boolean', default: true }
    }
  },
  BigHeadline: {
    category: 'text',
    description: 'Large headline with optional subtext, slides in from an edge.',
    props: {
      text: { type: 'string', required: true },
      subtext: { type: 'string', default: '' },
      color: { type: 'hex', default: '#ffffff' },
      fontSize: { type: 'number', default: 140 },
      slideFrom: { type: 'bottom|top|left|right', default: 'bottom' }
    }
  },
  ImageZoom: {
    category: 'media',
    description: 'Full-bleed image with slow scale zoom (Ken Burns style).',
    props: {
      image: { type: 'string', required: true },
      startScale: { type: 'number', default: 1.0 },
      endScale: { type: 'number', default: 1.2 },
      durationFrames: { type: 'number', default: 120 },
      fit: { type: 'cover|contain', default: 'cover' }
    }
  },
  LogoReveal: {
    category: 'effect',
    description: 'Logo + text entrance with spring scale and glow. Use as intro.',
    props: {
      image: { type: 'string (logo path)', default: '' },
      text: { type: 'string', default: '' },
      subtext: { type: 'string', default: '' },
      accentColor: { type: 'hex', default: '#00e676' },
      textColor: { type: 'hex', default: '#ffffff' }
    }
  },
  CallToAction: {
    category: 'overlay',
    description: 'Big CTA: headline, subtext, pulsing button. Use as outro.',
    props: {
      text: { type: 'string', default: 'Ready to ship?' },
      subtext: { type: 'string', default: '' },
      buttonText: { type: 'string', default: 'Subscribe' },
      accentColor: { type: 'hex', default: '#00e676' },
      textColor: { type: 'hex', default: '#ffffff' },
      bgColor: { type: 'hex', default: '#0a0a0a' }
    }
  },
  StatsGrid: {
    category: 'content',
    description: 'Grid of 2-4 stats with big numbers and labels. Use for metrics/features.',
    props: {
      stats: { type: 'array<{value,label,color?}>', default: [{ value: '1M', label: 'Users' }] },
      accentColor: { type: 'hex', default: '#00e676' },
      bgColor: { type: 'hex', default: '#0a0a0a' }
    }
  }
};
