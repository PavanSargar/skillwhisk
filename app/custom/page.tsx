import type { Metadata } from "next";
import { CustomRecipeBuilder } from "../components/custom-recipe-builder";

export const metadata: Metadata = {
  title: "Create a custom recipe",
  description: "Build a copy-ready recipe from your own project brief, visual style, and curated skills and tools.",
  ...(process.env.SITE_URL ? { alternates: { canonical: "/custom" } } : {}),
};

export default function CustomRecipePage() {
  return (
    <main id="main-content" className="page-shell recipe-page custom-recipe-page" tabIndex={-1}>
      <header className="recipe-intro">
        <h1>Create a recipe</h1>
        <p>Describe what you want to build. Choose a project type, a visual style, and the tools your agent should use.</p>
      </header>
      <CustomRecipeBuilder />
    </main>
  );
}
