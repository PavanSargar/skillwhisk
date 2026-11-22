import type { Metadata } from "next";
import Link from "next/link";
import { CatalogBrowser, RecipeActions, type CatalogGroup } from "./components/catalog-browser";
import { recipes } from "@/lib/catalog";
import { categories, type CategoryId, type Recipe } from "@/lib/catalog/recipes";
import { resourceRegistry, workflowBoosters } from "@/lib/catalog/resources";

export const metadata: Metadata = process.env.SITE_URL ? { alternates: { canonical: "/" } } : {};

function RecipeRow({ recipe }: { recipe: Recipe }) {
  return (
    <article className="recipe-row" aria-labelledby={`title-${recipe.slug}`}>
      <div className="row-identity">
        <h4 id={`title-${recipe.slug}`}><Link href={`/recipes/${recipe.slug}`}>{recipe.title}</Link></h4>
        <p>{recipe.summary}</p>
      </div>
      <ul className="resource-strip" role="list" aria-label={`Resources for ${recipe.title}`}>
        {[...recipe.resources, ...recipe.defaultBoosters].map((id) => {
          const resource = resourceRegistry[id];
          const booster = recipe.defaultBoosters.some((boosterId) => boosterId === id);
          return (
            <li key={id}>
              <a className={`resource-chip${booster ? " chip-booster" : ""}`} href={resource.url}>
                {booster && <span className="booster-dot" aria-hidden="true">+</span>}
                <span>{resource.name}</span>
                {booster && <span className="sr-only"> workflow booster</span>}
              </a>
            </li>
          );
        })}
      </ul>
      <RecipeActions recipe={recipe} />
    </article>
  );
}

export default function Home() {
  const groups: CatalogGroup[] = (Object.keys(categories) as CategoryId[]).map((id) => ({
    id,
    items: recipes.filter((recipe) => recipe.category === id).map((recipe) => ({
      slug: recipe.slug,
      searchText: [
        recipe.title,
        recipe.summary,
        categories[id].name,
        recipe.stack,
        ...new Set([...recipe.resources, ...recipe.boosters].map((resource) => resourceRegistry[resource].name)),
      ].join(" ").toLocaleLowerCase(),
      content: <RecipeRow recipe={recipe} />,
    })),
  }));

  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <section className="masthead" aria-labelledby="home-heading">
        <div className="masthead-copy">
          <h1 id="home-heading">SkillWhisk<span aria-hidden="true">.</span></h1>
          <p>Copy-ready recipes for building with AI.</p>
          <p>Pick a project, set the style, and copy a prompt with the skills, repositories, and checks to build it.</p>
        </div>
        <aside className="featured-recipe" aria-labelledby="feature-heading">
          <span className="feature-label">Featured skill</span>
          <h2 id="feature-heading">Faceless short</h2>
          <p>Render a finished MP4 with animation, voiceover, captions, and sound effects.</p>
          <Link href="/recipes/faceless-short" className="button feature-button">Get video prompt</Link>
        </aside>
      </section>
      <section className="catalog-section" id="recipes" aria-labelledby="library-heading">
        <div className="section-heading">
          <h2 id="library-heading">Recipe library</h2>
          <p>{groups.length} project categories</p>
        </div>
        <CatalogBrowser groups={groups} />
      </section>
      <section className="boosters-section" id="boosters" aria-labelledby="boosters-heading">
        <header className="section-heading">
          <h2 id="boosters-heading">Workflow boosters</h2>
          <p>Optional tools for specific jobs in a recipe.</p>
        </header>
        <ul className="boosters-grid" role="list">
          {workflowBoosters.map((id) => {
            const resource = resourceRegistry[id];
            return (
              <li key={id}>
                <span className="role-badge">{resource.badge}</span>
                <h3><a href={resource.url}>{resource.name}</a></h3>
                <p>{resource.role}</p>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
