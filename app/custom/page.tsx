import { CustomRecipeBuilder } from "../components/custom-recipe-builder";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/custom",
  "Create a custom AI recipe",
  "Create a copy-ready AI recipe with your own brief, curated skills and GitHub repositories, a visual style, and acceptance checks.",
);

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
