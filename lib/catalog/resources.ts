export type Agent = "universal" | "codex" | "claude-code" | "gemini" | "antigravity";
type SpecificAgent = Exclude<Agent, "universal">;
export type ResourceKind = "Skill" | "Repository" | "Tool" | "Standard";

export interface Resource {
  name: string;
  kind: ResourceKind;
  url: string;
  role: string;
  setup?: string;
  setupUrl?: string;
  fallback?: string;
  license?: string;
  githubStars?: number;
  documentedAgents?: readonly SpecificAgent[];
  badge?: "Component discovery" | "Repository context" | "Planning & review" | "Browser QA" | "SEO";
}

export const agents = {
  universal: { name: "Universal", guidance: "Use the receiving agent’s documented skill and tool mechanisms. Match setup to the agent and workspace you actually have." },
  codex: { name: "Codex", url: "https://developers.openai.com/codex/skills", guidance: "Check available Codex skills and project instructions. Invoke a matching installed skill or follow official Codex setup documentation." },
  "claude-code": { name: "Claude Code", url: "https://code.claude.com/docs/en/skills", guidance: "Check project instructions and available Claude Code skills. Invoke a matching installed skill or follow official Claude Code setup documentation." },
  gemini: { name: "Gemini CLI", url: "https://geminicli.com/docs/cli/skills/", guidance: "Use a Gemini CLI session with workspace access and the needed execution tools. Check available skills and follow the session's tool permissions." },
  antigravity: { name: "Antigravity", url: "https://antigravity.google/docs/skills/", guidance: "Check Antigravity workspace instructions and available skills. Load a matching installed skill or follow official Antigravity setup documentation." },
} as const;

export const agentOptions = Object.entries(agents).map(([value, agent]) => ({ value: value as Agent, label: agent.name }));

export const resources = {
  "frontend-design": {
    name: "Frontend Design", kind: "Skill", url: "https://github.com/anthropics/skills/tree/main/skills/frontend-design",
    role: "Plan distinct typography, composition and interaction details before building UI.", documentedAgents: ["claude-code"], license: "See upstream skill license",
    fallback: "Write a short plan for hierarchy, palette, spacing and interaction states, then review the actual screens against it.",
  },
  "web-guidelines": {
    name: "Web Design Guidelines", kind: "Skill", url: "https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines",
    role: "Review frontend UI against usability and accessibility guidance.", setup: "Access to the current upstream guidelines for the skill's full review.", license: "MIT",
    fallback: "Perform the recipe's keyboard, focus, responsive and feedback checks manually.",
  },
  "react-guidance": {
    name: "React Best Practices", kind: "Skill", url: "https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices",
    role: "Review React and Next.js data loading, rendering and bundle behavior.", license: "MIT",
    fallback: "Inspect the existing render and data-fetch paths and compare a production baseline using the project's available tooling.",
  },
  shadcn: {
    name: "shadcn/ui Skill", kind: "Skill", url: "https://ui.shadcn.com/docs/skills",
    role: "Inspect the project's component registry and assemble accessible UI primitives.", setup: "Project with compatible React and styling configuration. Follow the skill's agent-specific setup.", license: "MIT",
    fallback: "Reuse established controls in the project, or start with semantic native controls and test keyboard and error states.",
  },
  next: {
    name: "Next.js", kind: "Repository", url: "https://github.com/vercel/next.js",
    role: "Use App Router conventions, server rendering, metadata and accessible route structure.", setupUrl: "https://nextjs.org/docs/app/getting-started/installation", license: "MIT",
  },
  "shadcn-repo": {
    name: "shadcn/ui", kind: "Repository", url: "https://github.com/shadcn-ui/ui",
    role: "Use and adapt relevant component source with established keyboard behavior.", license: "MIT",
  },
  "expo-skill": {
    name: "Expo Native UI", kind: "Skill", url: "https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-native-ui",
    role: "Build native-feeling screens with platform-aware controls, safe areas and device checks.", license: "MIT",
    fallback: "Use native controls and the existing mobile framework's accessibility and safe-area APIs.",
  },
  expo: {
    name: "Expo", kind: "Repository", url: "https://github.com/expo/expo",
    role: "Build and smoke-test the app against supported React Native targets.", setupUrl: "https://docs.expo.dev/get-started/create-a-project/",
    setup: "Expo Go or an appropriate simulator/device build, depending on the native capabilities used.", license: "MIT",
  },
  "native-a11y": {
    name: "React Native Accessibility", kind: "Standard", url: "https://reactnative.dev/docs/accessibility",
    role: "Check native semantic roles, accessible labels and assistive technology behavior.",
  },
  "expo-sqlite": {
    name: "Expo SQLite", kind: "Repository", url: "https://github.com/expo/expo/tree/main/packages/expo-sqlite",
    role: "Store structured entries locally and verify persistence after restart.", setupUrl: "https://docs.expo.dev/versions/latest/sdk/sqlite/", license: "MIT",
  },
  "expo-camera": {
    name: "Expo Camera", kind: "Repository", url: "https://github.com/expo/expo/tree/main/packages/expo-camera",
    role: "Implement scanning or photo capture with explicit permission and fallback paths.", setupUrl: "https://docs.expo.dev/versions/latest/sdk/camera/", license: "MIT",
  },
  "remotion-skills": {
    name: "Remotion Skills", kind: "Skill", url: "https://www.remotion.dev/docs/ai/skills",
    role: "Plan code-driven compositions, timing, typography, audio and exports from a scene timeline.",
    setup: "A supported local Node.js and browser rendering environment for full renders.",
    fallback: "Use an explicit shot list, timecoded captions and a scene timeline in the available editor or renderer.",
  },
  remotion: {
    name: "Remotion", kind: "Repository", url: "https://github.com/remotion-dev/remotion",
    role: "Create editable React compositions and render the finished video.", setupUrl: "https://www.remotion.dev/docs/",
    license: "Remotion License. Check eligibility for free use.",
  },
  faceless: {
    name: "Faceless Shorts", kind: "Skill", url: "https://github.com/HunarBhatia/faceless-shorts-skill",
    role: "Turn a narrated script into animated shots, word-synced captions, music and sound effects.",
    setup: "Documented for Claude. Requires Node.js, FFmpeg and the local media dependencies listed upstream.",
    documentedAgents: ["claude-code"], license: "Check upstream terms before reusing source or sample assets.",
    fallback: "Build the scene timeline with Remotion and use supplied narration or permitted local speech synthesis, with timed captions and an FFmpeg mix.",
  },
  ffmpeg: {
    name: "FFmpeg", kind: "Repository", url: "https://github.com/FFmpeg/FFmpeg",
    role: "Mix, encode and inspect the final video and audio streams.", setupUrl: "https://ffmpeg.org/documentation.html",
    setup: "Local FFmpeg and FFprobe binaries.", license: "LGPL or GPL depending on build configuration.",
  },
  "21st": {
    name: "21st MCP", kind: "Tool", url: "https://github.com/21st-dev/magic-mcp",
    role: "Find and compare component examples that fit the chosen visual direction.",
    setupUrl: "https://github.com/21st-dev/magic-mcp/blob/main/llms-install.md",
    setup: "An MCP-compatible agent and a 21st API key. Check source terms before reusing a component.",
    badge: "Component discovery",
    fallback: "Inspect and reuse appropriate controls in the project or start from semantic primitives.",
  },
  graphify: {
    name: "Graphify", kind: "Skill", url: "https://github.com/Graphify-Labs/graphify",
    role: "Map an existing repository when a searchable graph would save repeated code exploration.",
    setup: "Follow the documented installation and review the files included in indexing.",
    documentedAgents: ["codex", "claude-code"], badge: "Repository context",
    fallback: "Trace entry points, imports and persistence with targeted file search and source references.",
  },
  compound: {
    name: "Compound Engineering", kind: "Skill", url: "https://github.com/EveryInc/compound-engineering-plugin",
    role: "Plan a substantial change, review the implementation and capture durable project knowledge.",
    setupUrl: "https://everyinc.github.io/compound-engineering-plugin/",
    setup: "Use the installation instructions for the receiving agent.",
    documentedAgents: ["codex", "claude-code", "antigravity"], badge: "Planning & review",
    fallback: "Write a scoped implementation checklist, review the actual changes and record verified results.",
  },
  playwright: {
    name: "Playwright CLI", kind: "Skill", url: "https://github.com/microsoft/playwright-cli",
    role: "Walk real browser interactions and collect screenshots or evidence for regressions.",
    setupUrl: "https://github.com/microsoft/playwright-cli#readme",
    setup: "Node.js and supported browser binaries. Use a local build or authorized test environment.",
    license: "Apache-2.0", badge: "Browser QA",
    fallback: "Walk the same primary journey in a local browser and record the viewport, actions and outcomes.",
  },
  "playwright-test": {
    name: "Playwright Test", kind: "Repository", url: "https://github.com/microsoft/playwright",
    role: "Automate repeatable browser journeys using visible roles and assertions.",
    setupUrl: "https://playwright.dev/docs/intro", setup: "Playwright-managed browser binaries.", license: "Apache-2.0",
  },
  wcag: {
    name: "WCAG 2.2", kind: "Standard", url: "https://www.w3.org/TR/WCAG22/",
    role: "Use the relevant WCAG AA criteria for manual and automated web checks.",
  },
  axe: {
    name: "axe-core", kind: "Repository", url: "https://github.com/dequelabs/axe-core",
    role: "Find programmatically detectable accessibility issues and verify manual checks separately.", license: "MPL-2.0",
  },
  openseo: {
    name: "OpenSEO", kind: "Skill", url: "https://openseo.so/docs/skills",
    role: "Run an appropriate site audit, keyword or local visibility workflow when data access is available.",
    setupUrl: "https://openseo.so/docs/agent-setup", setup: "Live data may require OpenSEO access or a configured MCP connection. Some lookups can incur charges.",
    documentedAgents: ["codex", "claude-code"], badge: "SEO",
    fallback: "Inspect local page metadata, internal links and available first-party exports. Label unavailable competitive or search-volume data as unknown.",
  },
  harvey: {
    name: "Harvey", kind: "Repository", url: "https://github.com/am-aayush/harvey",
    role: "Reference the prospect research and outreach drafting workflow with a human review gate.",
    setup: "Supported coding agent and any chosen integrations. Use fixtures or draft mode for verification.",
    documentedAgents: ["codex", "claude-code"],
  },
  maps: {
    name: "Google Maps Scraper", kind: "Repository", url: "https://github.com/gosom/google-maps-scraper",
    role: "Reference the local business dataset shape for permitted collection or a fixture import.",
  },
  huginn: {
    name: "Huginn", kind: "Repository", url: "https://github.com/huginn/huginn",
    role: "Reference monitoring rules and reviewable events for approved sources.", license: "MIT",
  },
  firecrawl: {
    name: "Firecrawl", kind: "Repository", url: "https://github.com/firecrawl/firecrawl",
    role: "Extract structured information from approved public sites when a connector is useful.",
    setup: "Hosted API credentials or a documented self-hosted setup.", license: "AGPL-3.0",
  },
  "email-check": {
    name: "Check If Email Exists", kind: "Repository", url: "https://github.com/reacherhq/check-if-email-exists",
    role: "Model email validation with explicit unknown and transient-failure states. Use owned test addresses.",
    setup: "Remote mail systems and network restrictions can affect verification results.",
  },
  "remote-jobs": {
    name: "Remote Jobs", kind: "Repository", url: "https://github.com/remoteintech/remote-jobs",
    role: "Use the community-maintained remote-friendly employer directory as a research source with provenance.",
  },
  listmonk: {
    name: "Listmonk", kind: "Repository", url: "https://github.com/knadh/listmonk",
    role: "Reference subscriber, consent, segmentation and unsubscribe workflows.",
    setup: "Self-hosting needs PostgreSQL. Delivery needs a configured mail provider.", license: "AGPL-3.0",
  },
  twenty: {
    name: "Twenty", kind: "Repository", url: "https://github.com/twentyhq/twenty",
    role: "Reference contacts, companies and opportunity stages when designing a CRM workflow.",
    setup: "Hosted or self-hosted setup for a live integration.", license: "Check upstream terms for the chosen edition.",
  },
  wired: {
    name: "Wired Elements", kind: "Repository", url: "https://github.com/rough-stuff/wired-elements",
    role: "Reference hand-drawn controls and preserve the semantics of each native interaction.", license: "MIT",
  },
  storybook: {
    name: "Storybook", kind: "Repository", url: "https://github.com/storybookjs/storybook",
    role: "Exercise reusable components and document visual and interactive states in isolation.", license: "MIT",
  },
  radix: {
    name: "Radix Primitives", kind: "Repository", url: "https://github.com/radix-ui/primitives",
    role: "Start with established semantics and focus behavior for dialogs, menus and controls.", license: "MIT",
  },
  table: {
    name: "TanStack Table", kind: "Repository", url: "https://github.com/TanStack/table",
    role: "Implement headless sorting, filtering and pagination while owning accessible table markup.", license: "MIT",
  },
  recharts: {
    name: "Recharts", kind: "Repository", url: "https://github.com/recharts/recharts",
    role: "Visualize comparisons or time series with a readable textual or tabular alternative.", license: "MIT",
  },
  forms: {
    name: "React Hook Form", kind: "Repository", url: "https://github.com/react-hook-form/react-hook-form",
    role: "Implement labeled forms with validation, accessible errors and preserved inputs.", license: "MIT",
  },
  supabase: {
    name: "Supabase", kind: "Repository", url: "https://github.com/supabase/supabase",
    role: "Consider PostgreSQL persistence, authentication and row-level permissions for shared applications.",
    setup: "Use a local stack or configure an authorized project for integration checks.", license: "Apache-2.0",
  },
  stripe: {
    name: "Stripe Payment Samples", kind: "Repository", url: "https://github.com/stripe-samples/accept-a-payment",
    role: "Reference sandbox checkout and confirmation flows with provider-hosted payment collection.",
    setup: "Use test-mode credentials and test payment fixtures.", license: "MIT",
  },
  motion: {
    name: "Motion", kind: "Repository", url: "https://github.com/motiondivision/motion",
    role: "Document intentional transitions, including reduced-motion behavior and interruption.", license: "MIT",
  },
  lighthouse: {
    name: "Lighthouse", kind: "Repository", url: "https://github.com/GoogleChrome/lighthouse",
    role: "Capture comparable page performance, SEO and accessibility diagnostics.", license: "Apache-2.0",
  },
  sharp: {
    name: "Sharp", kind: "Repository", url: "https://github.com/lovell/sharp",
    role: "Generate appropriately sized derivatives and preserve originals during asset optimization.", license: "Apache-2.0",
  },
  lychee: {
    name: "Lychee", kind: "Repository", url: "https://github.com/lycheeverse/lychee",
    role: "Check internal and external links and make transient failures distinguishable.", license: "Apache-2.0 or MIT",
  },
  msw: {
    name: "Mock Service Worker", kind: "Repository", url: "https://github.com/mswjs/msw",
    role: "Build repeatable network fixtures for loading, error, empty and success scenarios.", license: "MIT",
  },
  excalidraw: {
    name: "Excalidraw", kind: "Repository", url: "https://github.com/excalidraw/excalidraw",
    role: "Map interfaces, state transitions and code relationships with editable diagrams.", license: "MIT",
  },
  openapi: {
    name: "OpenAPI Specification", kind: "Repository", url: "https://github.com/OAI/OpenAPI-Specification",
    role: "Describe documented request, response, authentication and error contracts in a reusable format.", license: "Apache-2.0",
  },
  mermaid: {
    name: "Mermaid", kind: "Repository", url: "https://github.com/mermaid-js/mermaid",
    role: "Publish source-controlled diagrams that can be regenerated with the project.", license: "MIT",
  },
  "security-best-practices": {
    name: "Security Best Practices", kind: "Skill",
    url: "https://github.com/openai/skills/blob/main/skills/.curated/security-best-practices/SKILL.md",
    role: "Use the language-specific guidance to identify insecure defaults and review supplied code.",
    documentedAgents: ["codex"], githubStars: 28891,
  },
  "security-threat-model": {
    name: "Security Threat Model", kind: "Skill",
    url: "https://github.com/openai/skills/blob/main/skills/.curated/security-threat-model/SKILL.md",
    role: "Map assets, access boundaries, and risk from supplied architecture and source evidence.",
    documentedAgents: ["codex"], githubStars: 28891,
  },
  "ci-actions-auditor": {
    name: "Agentic Actions Auditor", kind: "Skill",
    url: "https://github.com/trailofbits/skills/blob/main/plugins/agentic-actions-auditor/skills/agentic-actions-auditor/SKILL.md",
    role: "Reference the static review guidance for workflow permissions and untrusted inputs.",
    documentedAgents: ["claude-code"], githubStars: 8343,
  },
  "k6-docs": {
    name: "Grafana k6 Documentation Skill", kind: "Skill",
    url: "https://github.com/grafana/skills/blob/main/skills/grafana-k6/k6-docs/SKILL.md",
    role: "Use the reporting guidance to interpret the metrics and thresholds in completed test summaries.",
    license: "Apache-2.0", githubStars: 316,
  },
  "owasp-asvs": {
    name: "OWASP ASVS", kind: "Repository", url: "https://github.com/OWASP/ASVS",
    role: "Map observed web security controls to relevant verification requirements.",
    license: "CC-BY-SA-4.0", githubStars: 3809,
  },
  "owasp-cheatsheets": {
    name: "OWASP Cheat Sheet Series", kind: "Repository", url: "https://github.com/OWASP/CheatSheetSeries",
    role: "Reference defensive guidance for authentication, sessions, data handling, and secure configuration.",
    license: "CC-BY-SA-4.0", githubStars: 34155,
  },
  "owasp-headers": {
    name: "OWASP Secure Headers", kind: "Repository", url: "https://github.com/OWASP/www-project-secure-headers",
    role: "Compare captured HTTP headers with current OWASP recommendations.",
    license: "Apache-2.0", githubStars: 227,
  },
  semgrep: {
    name: "Semgrep Community Edition", kind: "Repository", url: "https://github.com/semgrep/semgrep",
    role: "Review local static-analysis findings against their cited source and the actual control flow.",
    license: "LGPL-2.1", githubStars: 17882,
  },
  lynis: {
    name: "Lynis", kind: "Repository", url: "https://github.com/CISOfy/lynis",
    role: "Interpret supplied Linux or Unix hardening reports and identify missing evidence.",
    license: "GPL-3.0", githubStars: 16739,
  },
  trivy: {
    name: "Trivy", kind: "Repository", url: "https://github.com/aquasecurity/trivy",
    role: "Review existing dependency, image, and configuration findings against local manifests and inventory.",
    license: "Apache-2.0", githubStars: 39609,
  },
  "osv-scanner": {
    name: "OSV-Scanner", kind: "Repository", url: "https://github.com/google/osv-scanner",
    role: "Interpret dependency advisories in supplied scan results and match them to locked package versions.",
    license: "Apache-2.0", githubStars: 11593,
  },
  "ossf-scorecard": {
    name: "OpenSSF Scorecard", kind: "Repository", url: "https://github.com/ossf/scorecard",
    role: "Review software supply-chain practices using available scorecard reports and repository configuration.",
    license: "Apache-2.0", githubStars: 5856,
  },
  gitleaks: {
    name: "Gitleaks", kind: "Repository", url: "https://github.com/gitleaks/gitleaks",
    role: "Review redacted secrets findings or run an existing offline scan against supplied source.",
    license: "MIT", githubStars: 31251,
  },
  checkov: {
    name: "Checkov", kind: "Repository", url: "https://github.com/bridgecrewio/checkov",
    role: "Use static infrastructure policy guidance to interpret local manifest findings.",
    license: "Apache-2.0", githubStars: 9165,
  },
  "kube-linter": {
    name: "KubeLinter", kind: "Repository", url: "https://github.com/stackrox/kube-linter",
    role: "Review local Kubernetes manifests for insecure workload defaults and missing protections.",
    license: "Apache-2.0", githubStars: 3529,
  },
  k6: {
    name: "Grafana k6", kind: "Repository", url: "https://github.com/grafana/k6",
    role: "Review existing k6 result exports against documented metric and threshold semantics.",
    license: "AGPL-3.0", githubStars: 32376,
  },
  "rea-skill": {
    name: "Reverse Engineer Anything Skill", kind: "Skill",
    url: "https://github.com/morluto/rea/blob/main/.agents/skills/reverse-engineer-anything/SKILL.md",
    role: "Use the upstream REA workflow when a conclusion needs evidence from a supported, authorized built or shipped app.",
    setup: "Artifact analysis requires an existing, compatible REA connection.",
    license: "MIT",
  },
  "rea-repo": {
    name: "REA Repository", kind: "Repository", url: "https://github.com/morluto/rea",
    role: "Consult the upstream documentation for supported artifacts and evidence requirements.",
    license: "MIT for REA-authored code",
  },
} satisfies Record<string, Resource>;

export type ResourceId = keyof typeof resources;
export const resourceRegistry: Record<ResourceId, Resource> = resources;
export const reaResources = ["rea-skill", "rea-repo"] as const satisfies readonly ResourceId[];

export const workflowBoosters = ["21st", "graphify", "compound", "playwright", "openseo"] as const;
export type BoosterId = (typeof workflowBoosters)[number];
