export const styles = {
  skeuomorphism: { name: "Skeuomorphism", guidance: "Use familiar physical controls, restrained material textures and tactile states. Preserve readable labels and obvious affordances." },
  neumorphism: { name: "Neumorphism", guidance: "Use soft raised and recessed surfaces with consistent lighting. Give interactive controls visible boundaries and high-contrast focus states." },
  glassmorphism: { name: "Glassmorphism", guidance: "Layer translucent panels over a controlled background. Add opaque fallbacks and verify text contrast across the underlying image." },
  claymorphism: { name: "Claymorphism", guidance: "Use rounded, softly lit forms and playful volume for key controls. Keep content surfaces simple and prioritize comfortable touch targets." },
  brutalism: { name: "Brutalism", guidance: "Use strong type, visible structure, hard edges and limited accent color. Organize the page around obvious reading order and actions." },
  minimalism: { name: "Minimalism", guidance: "Use deliberate spacing, a compact palette and a clear typographic hierarchy. Retain the labels, feedback and affordances people need to act." },
  maximalism: { name: "Maximalism", guidance: "Use expressive color, type and layered patterns with a strong organizing grid. Keep task-critical controls and reading areas visually stable." },
  "liquid-glass": { name: "Liquid glass", guidance: "Reserve adaptive translucent depth and refraction for navigation or overlays. Use platform-native effects when available and readable opaque fallbacks for reduced transparency." },
  "bento-grid": { name: "Bento grid", guidance: "Arrange content in purposeful modules whose sizes communicate priority. Preserve logical reading and keyboard order when modules reflow." },
  "spatial-ui": { name: "Spatial UI", guidance: "Use depth and lighting to clarify layers, with clear selection and focus feedback. Provide a flat, reduced-motion path for the same tasks." },
  editorial: { name: "Editorial", guidance: "Use strong display typography, readable measure and deliberate placement of images and captions. Let the content determine the grid and pacing." },
  "swiss-grid": { name: "Swiss grid", guidance: "Use a visible modular grid, aligned baselines, asymmetric composition and tight typographic hierarchy. Reflow the grid without shrinking essential text." },
  "hand-drawn": { name: "Hand-drawn", guidance: "Use sketch-like strokes, ink textures and occasional handwritten accents. Keep labels in readable text and retain semantic interactive controls." },
  "retro-pixel": { name: "Retro pixel", guidance: "Use crisp pixel imagery and deliberate stepped shapes. Reserve pixel lettering for display and offer readable body text and reduced-motion alternatives." },
  "art-deco": { name: "Art Deco", guidance: "Use geometric symmetry, stepped forms and restrained metallic accents. Keep ornate patterns clear of body text and interactive states." },
} as const;

export type StyleId = keyof typeof styles;

export const styleOptions = Object.entries(styles).map(([value, style]) => ({
  value: value as StyleId,
  label: style.name,
}));
