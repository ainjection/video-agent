// Infer a category tag from a composition id. Returns a short label used for
// filter chips (and to suggest sensible icon/colour later).
const RULES = [
  { match: /^Block-/, category: 'Block' },
  { match: /^Sub|Subscribe/i, category: 'Subscribe' },
  { match: /LowerThird/i, category: 'Lower Third' },
  { match: /Counter/i, category: 'Counter' },
  { match: /DataChart/i, category: 'Chart' },
  { match: /Comparison/i, category: 'Comparison' },
  { match: /^CTA/i, category: 'CTA' },
  { match: /AnimatedText/i, category: 'Title' },
  { match: /Paperclip|Opus47|AIInjection|Cyberpunk|TechIntro|IntroShowcase/i, category: 'Intro' },
  { match: /ClaudeClawProper|MarpExplainer|CinematicExplainer|NotebookLMExplainer|ClaudeClawExplainer|ExcalidrawExplainer/i, category: 'Explainer' },
  { match: /FilmStrip/i, category: 'Film Strip' },
  { match: /ProductSpotlight|ProductShowcase/i, category: 'Product' },
  { match: /PromptVault|PromptShowcase|CinemaReveal|ImageFirst|DailyPromptVideo/i, category: 'Showcase' },
  { match: /FiverrShowcase|ShowcaseReel|AirtableDemo/i, category: 'Showcase' },
  { match: /PagePanDown|GlassDiagram/i, category: 'Effect' }
];

function categoryFor(compId) {
  if (!compId) return 'Other';
  for (const rule of RULES) {
    if (rule.match.test(compId)) return rule.category;
  }
  return 'Other';
}

function allCategories(compositions) {
  const set = new Set();
  compositions.forEach(c => set.add(categoryFor(c.id)));
  return ['All', ...Array.from(set).sort()];
}

module.exports = { categoryFor, allCategories };
