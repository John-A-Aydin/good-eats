import type { Recipe } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import {generateUploadUrl} from "~/server/s3"

const addUserDataToRecipes = async (recipes: Recipe[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: recipes.map((recipe) => recipe.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return recipes.map(recipe => {
    const author = users.find((user) => user.id === recipe.authorId);

    if (!author ) 
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for recipe not found"
      });
    
    if ( !author.username ) // TODO require username entry for new signins
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author has no username"
      });
    
    return {
      recipe,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
}

export const recipeRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const recipes = await ctx.prisma.recipe.findMany({
        take: 100,
        orderBy: [{ createdAt: "desc"}],
      });

      return addUserDataToRecipes(recipes);
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const recipe = await ctx.prisma.recipe.findUnique({
        where: { id: input.id }
      });

      if (!recipe) throw new TRPCError({ code: "NOT_FOUND"});

      return (await addUserDataToRecipes([recipe]))[0];
  }),
  create: privateProcedure
    .input( 
      // zod input validation
      z.object({
        name: z.string().min(1).max(64),
        description: z.string().min(1).max(255),
        instructions: z.string(),
        // TODO change up the nutrion formating
        carbs: z.number().optional(),
        protien: z.number().optional(),
        fat: z.number().optional(),
      })
    )
    .mutation(async({ctx, input}) => {
    /** 
     * Grabbing the current user's ID.
     * Since this is a private procedure and we made sure the current user exists
     * ../trcp.ts enforceUserIsAuthed()
    */
    const authorId = ctx.userId;
    
    
    // TODO Rate limiting on posts
    // const { success } = await ratelimit.limit(authorId);
    // if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" })

    const post = await ctx.prisma.recipe.create({
      data: {
        authorId,
        name: input.name,
        starRating: 0,
        description: input.description,
        instructions: input.instructions,
        // TODO change nutrition
      }
    })
    return post;
  }),
  getUploadUrl: privateProcedure
    .query(async () => { // Todo add ctx??
      return generateUploadUrl();
    }),
});