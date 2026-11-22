import { adminRecipes, commerceRecipes, landingRecipes, marketingRecipes } from "./web-recipes";
import { mobileRecipes, videoRecipes } from "./mobile-media-recipes";
import { designRecipes, productRecipes } from "./product-design-recipes";
import { qualityRecipes, reaRecipes } from "./quality-rea-recipes";
import { securityRecipes } from "./security-recipes";

export const recipes = [
  ...landingRecipes,
  ...adminRecipes,
  ...marketingRecipes,
  ...commerceRecipes,
  ...mobileRecipes,
  ...videoRecipes,
  ...designRecipes,
  ...productRecipes,
  ...qualityRecipes,
  ...securityRecipes,
  ...reaRecipes,
];

export function getRecipe(slug: string) {
  return recipes.find((recipe) => recipe.slug === slug);
}
