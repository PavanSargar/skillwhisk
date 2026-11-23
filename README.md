# SkillWhisk

SkillWhisk is a copy-ready library of 111 recipes across eleven categories. Each recipe includes a workflow, curated skills and repositories, and specific acceptance checks. The library shows three recipes per category at first. Expand a category to browse it, or search the entire library. Pick a UI style and copy the prompt from the library. Open a recipe to preview the Markdown and customize the brief, target agent, workflow boosters, and applicable output options.

Use **Create recipe** to start from a new brief, select tools from the catalog, add your own acceptance checks, and copy the resulting prompt. SkillWhisk saves drafts and favorites in the current browser.

Recipe details show the inputs, tool setup, optional fallbacks, and expected output. **Share settings** copies a link with the agent, visual style, tools, and applicable output options. **Download skill** exports a portable Agent Skills ZIP with a `SKILL.md` and the recipe instructions. Personal draft text stays in the browser. Unzip the bundle and follow your agent’s instructions for adding a skill directory.

After building, use **Copy review prompt** on the recipe detail page. It includes your brief, relevant settings, and the recipe’s acceptance checks so an agent can assess the result and cite evidence.

The **High-retention mobile app** recipe includes six **SkillWhisk rules** for mobile engagement, from a clear default action to saved progress and user-controlled discovery.

The featured **Faceless short** prompt directs the receiving agent to render and return a finished MP4 in the current session. Use Codex, Claude Code, Gemini CLI, or Antigravity with access to the required render tools.

**Security audit** recipes produce a read-only findings report from authorized source, configuration, redacted exports, and existing test results. The pentest and stress-test recipes review scope and evidence for tests run by an operator. Security resource cards show source-repository GitHub stars checked on November 22, 2026.

The library uses Next.js 16, TypeScript, the App Router, and Server Components. The catalog and recipe detail routes are prerendered at build time. Filtering, customization, and clipboard actions run in the browser.

## Run locally

Requires Node.js 22 or later and npm.

```sh
npm ci
npm run dev
```

Open [SkillWhisk](http://localhost:3000). To verify and serve a production build:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm start
```

Canonical URLs, social previews, and the sitemap use the public SkillWhisk origin at `https://skillwhisk.vercel.app`. Set `SITE_URL` before building to use a different public origin. See [the environment example](.env.example).

## Maintain the catalog

- Add or edit a recipe in the relevant module in [lib/catalog](lib/catalog). Use a stable slug, a distinct deliverable, specific acceptance checks, a relevant skill and repository, and a practical default style.
- Add reusable sources and workflow boosters in [resources.ts](lib/catalog/resources.ts). Use upstream source and setup links, note prerequisites and licensing where applicable, and list agent support only when upstream documents it.
- Add style guidance in [styles.ts](lib/catalog/styles.ts). The shared [prompt composer](lib/catalog/prompt.ts) applies styles to the intended deliverable and includes instructions for missing tools.
- Run `npm run verify:sources` when updating source links. Record the review date and check the upstream docs for setup requirements. All 80 source and setup URLs resolved on November 22, 2026. Drawable is pending canonical source verification. The hand-drawn kit uses Wired Elements.
- Use the upstream [Reverse Engineer Anything skill](https://github.com/morluto/rea/blob/main/.agents/skills/reverse-engineer-anything/SKILL.md) and [REA repository](https://github.com/morluto/rea) as the resources for REA catalog and custom recipes.

## Agent smoke tests

- Codex built a disposable Node.js waitlist from the Waitlist page recipe using built-in tools. Signup, validation, deduplication, persistence and failure recovery were exercised with local fixtures.
- Claude Code produced an architecture report and a request-flow diagram from a synthetic notes API in a pre-REA smoke test.
- Antigravity prompt composition is covered by application tests. A live Antigravity run was unavailable in the local environment.
