"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { categories, type CategoryId, type Recipe } from "@/lib/catalog/recipes";
import { agentOptions, type Agent } from "@/lib/catalog/resources";
import { composePrompt, defaultPromptSettings } from "@/lib/catalog/prompt";
import { CopyButton } from "./copy-button";
import { SelectControl } from "./select-control";
import { StylePicker } from "./style-picker";
import { useFavoriteRecipes } from "./use-workflow-storage";

export interface CatalogGroup {
  id: CategoryId;
  items: { slug: string; searchText: string; content: ReactNode }[];
}

const AgentContext = createContext<Agent>("universal");
const initialRecipesPerCategory = 3;

export function RecipeActions({ recipe }: { recipe: Recipe }) {
  const agent = useContext(AgentContext);
  const [style, setStyle] = useState(recipe.style);
  return (
    <div className="row-actions">
      <StylePicker
        id={`style-${recipe.slug}`}
        label={`UI style for ${recipe.title}`}
        value={style}
        onChange={setStyle}
        hideLabel
      />
      <CopyButton recipeTitle={recipe.title} getText={() => composePrompt(recipe, { ...defaultPromptSettings(recipe), style, agent })} />
    </div>
  );
}

export function CatalogBrowser({ groups }: { groups: CatalogGroup[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [agent, setAgent] = useState<Agent>("universal");
  const [expanded, setExpanded] = useState<Partial<Record<CategoryId, boolean>>>({});
  const [savedOnly, setSavedOnly] = useState(false);
  const { favorites } = useFavoriteRecipes();
  const searchInput = useRef<HTMLInputElement>(null);
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered = groups.map((group) => group.items.map((item) => (
    (category === "all" || group.id === category)
    && (!savedOnly || favorites.includes(item.slug))
    && terms.every((term) => item.searchText.includes(term))
  )));
  const count = filtered.reduce((total, matches) => total + matches.filter(Boolean).length, 0);

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setSavedOnly(false);
    searchInput.current?.focus();
  }

  return (
    <AgentContext value={agent}>
      <div className="catalog-toolbar">
        <div className="search-control">
          <label className="sr-only" htmlFor="recipe-search">Search recipes and tools</label>
          <div className="search-shell">
            <span className="search-icon" aria-hidden="true" />
            <input ref={searchInput} id="recipe-search" type="search" placeholder="Search recipes or tools" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <SelectControl
          id="category-filter"
          label="Category"
          hideLabel
          options={[{ value: "all", label: "All categories" }, ...groups.map(({ id }) => ({ value: id, label: categories[id].name }))]}
          value={category}
          onChange={(event) => setCategory(event.target.value as CategoryId | "all")}
        />
        <div className="agent-filter">
          <span aria-hidden="true">Paste into</span>
          <SelectControl id="catalog-agent" label="Paste into" hideLabel options={agentOptions} value={agent} onChange={(event) => setAgent(event.target.value as Agent)} />
        </div>
      </div>
      <div className="catalog-status">
        <p role="status">{count} {count === 1 ? "recipe" : "recipes"}</p>
        {(category !== "all" || query || savedOnly) && <button className="plain-button" type="button" onClick={resetFilters}>Clear filters</button>}
        <button className="saved-filter" type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}>
          Saved recipes
        </button>
      </div>
      {count === 0 && (
        <div className="empty-state">
          <h3>{savedOnly && favorites.length === 0 ? "No saved recipes yet" : "No recipes match"}</h3>
          <p>{savedOnly && favorites.length === 0
            ? "Open a recipe and select Save recipe to find it here."
            : "Try a project type like portfolio or a tool name like Playwright."}</p>
        </div>
      )}
      {groups.map(({ id, items }, groupIndex) => {
        const matchingItems = items.filter((_, index) => filtered[groupIndex][index]);
        const matchedCount = matchingItems.length;
        const categoryInfo = categories[id];
        const isExpanded = savedOnly || terms.length > 0 || Boolean(expanded[id]);
        const visibleSlugs = new Set((isExpanded ? matchingItems : matchingItems.slice(0, initialRecipesPerCategory)).map(({ slug }) => slug));
        const listId = `list-${id}`;
        return (
          <section className="recipe-group" id={`category-${id}`} key={id} hidden={!matchedCount} aria-labelledby={`heading-${id}`}>
            <header className="group-heading">
              <div>
                <h3 id={`heading-${id}`}>{categoryInfo.name}</h3>
                <p>{categoryInfo.description}</p>
              </div>
              {!savedOnly && terms.length === 0 && matchedCount > initialRecipesPerCategory && (
                <button
                  type="button"
                  className="group-toggle"
                  aria-controls={listId}
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded((previous) => ({ ...previous, [id]: !previous[id] }))}
                >
                  {isExpanded ? "Show less" : `Show ${matchedCount - initialRecipesPerCategory} more`}
                  <span className="sr-only"> in {categoryInfo.name}</span>
                </button>
              )}
            </header>
            <ul className="recipe-list" id={listId} role="list">
              {items.map(({ slug, content }) => (
                <li key={slug} hidden={!visibleSlugs.has(slug)}>{content}</li>
              ))}
            </ul>
          </section>
        );
      })}
    </AgentContext>
  );
}
