import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const recipeRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const recipes = await ctx.prisma.recipe.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc"}],
    });
    return recipes; // TODO user data?
  }),
});