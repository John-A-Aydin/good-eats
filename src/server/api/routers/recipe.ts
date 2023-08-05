import type { Recipe } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import { env } from "~/env.mjs";
import S3 from "aws-sdk/clients/s3";
import { createId } from "@paralleldrive/cuid2";

const UPLOAD_MAX_FILE_SIZE = 1_000_000;

// TODO web dev cody vid figure out wtf is going on
const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
  signatureVersion: 'v4',
});

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
        imageTypes: z.string().array(),
        // TODO change up the nutrion formating
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

    /*
      Creates presigned urls for image uploads and adds image data to database

      POSSIBLE ISSUE: If the client fails to upload pictures after mutation is called,
      there will be images in the database with no image associated with thier url.
     */
    
    const unawaitedPresignedURLArray = input.imageTypes.map(async (type) => {
      // Creating presigned url
      const id = createId();
      const params = ({
        Bucket: env.AWS_RECIPE_BUCKET_NAME,
        Key: id,
        Expires: 1800, // 30 minutes (may need to change)
      }) // May need to add beck content type
      const presignedURL = await s3.getSignedUrl('putObject', params);
      
      if(!presignedURL) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR"});
      // Creates image data in database
      console.log(presignedURL + "                                               1");
      await ctx.prisma.recipePics.create({
        data: {
          url: `${env.AWS_RECIPE_BUCKET_URL}${id}`,
          recipe: {
            connect: {
              id: post.id,
            },
          },
        },
      });
      return presignedURL;
    });
    const presignedURLArray = await Promise.all(unawaitedPresignedURLArray)
    return {post, presignedURLArray};
  }),
});