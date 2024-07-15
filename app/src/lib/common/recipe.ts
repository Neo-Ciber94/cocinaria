import { z } from 'zod';

export const RECIPE_TYPES = ['dessert', 'snack', 'main', 'drink'] as const;

export const recipeTypeSchema = z.enum(RECIPE_TYPES);

export type RecipeType = z.infer<typeof recipeTypeSchema>;
