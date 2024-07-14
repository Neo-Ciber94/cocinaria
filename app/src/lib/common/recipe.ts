import { z } from 'zod';

const RECIPE_TYPE = ['dessert', 'snack', 'main', 'drink'] as const;

export const recipeTypeSchema = z.enum(RECIPE_TYPE);

export type RecipeType = z.infer<typeof recipeTypeSchema>;
