import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecipeConfigurator } from "@/app/components/recipe-configurator";
import { StructuredData } from "@/app/components/structured-data";
import { getRecipe, recipes } from "@/lib/catalog";
import { categories } from "@/lib/catalog/recipes";
import { agents, resourceRegistry, type ResourceId } from "@/lib/catalog/resources";
import { pageMetadata, siteOrigin } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };
const compactStars = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export const dynamicParams = false;
export function generateStaticParams() {
  return recipes.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const recipe = getRecipe((await params).slug);
  if (!recipe) return {};
  return pageMetadata(`/recipes/${recipe.slug}`, recipe.title, recipe.summary);
}

function ResourceCard({ id, optional }: { id: ResourceId; optional: boolean }) {
  const resource = resourceRegistry[id];
  return (
    <li className="resource-card">
      <div className="resource-meta">
        <span className="role-badge">{resource.kind}</span>
        {resource.badge && <span className="role-badge badge-highlight">{resource.badge}</span>}
        {optional && <span className="role-badge">Optional</span>}
      </div>
      <h3><a href={resource.url}>{resource.name}</a></h3>
      <p>{resource.role}</p>
      {resource.setup && <p className="resource-note">{resource.setup}</p>}
      {resource.documentedAgents && (
        <p className="resource-note">Upstream documents {resource.documentedAgents.map((agent) => agents[agent].name).join(", ")}.</p>
      )}
      {resource.license && <p className="resource-note">License · {resource.license}</p>}
      {resource.githubStars && (
        <p className="resource-note" title="Checked 22 November 2026">
          {compactStars.format(resource.githubStars)} GitHub stars{resource.kind === "Skill" ? " on the source repository" : ""}
        </p>
      )}
      {resource.setupUrl && <a className="setup-link" href={resource.setupUrl}>Setup guide for {resource.name}</a>}
    </li>
  );
}

export default async function RecipePage({ params }: PageProps) {
  const recipe = getRecipe((await params).slug);
  if (!recipe) notFound();
  const category = categories[recipe.category];

  return (
    <main id="main-content" className="page-shell recipe-page" tabIndex={-1}>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Recipes", item: siteOrigin.href },
          { "@type": "ListItem", position: 2, name: recipe.title, item: new URL(`/recipes/${recipe.slug}`, siteOrigin).href },
        ],
      }} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/#recipes">Recipes</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/#category-${recipe.category}`}>{category.name}</Link>
      </nav>
      <header className="recipe-intro">
        <h1>{recipe.title}</h1>
        <p>{recipe.summary}</p>
      </header>
      <RecipeConfigurator recipe={recipe} />
      <section className="detail-resources" aria-labelledby="resources-heading">
        <div className="section-heading">
          <h2 id="resources-heading">Recipe resources</h2>
          <p>Source, setup, and compatibility details.</p>
        </div>
        <ul className="resource-cards" role="list">
          {recipe.resources.map((id) => <ResourceCard key={id} id={id} optional={false} />)}
          {recipe.boosters.map((id) => <ResourceCard key={id} id={id} optional />)}
        </ul>
      </section>
    </main>
  );
}
