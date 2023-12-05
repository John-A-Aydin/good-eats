import type { Recipe } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import { env } from "~/env.mjs";
import S3 from "aws-sdk/clients/s3";
import { createId } from "@paralleldrive/cuid2";

type RecipesWithPics = (
  {
    pics: {
      url: string;
      recipeId: string;
    }[];
    nutrition: { 
      recipeId: string;
      carbs: number;
      protien: number;
      fat: number;
    } | null;
  } & {
    id: string;
    authorId: string;
    name: string;
    createdAt: Date;
    starRating: number;
    description: string;
    instructions: string;
  }
)

/*
  TODO's
   - Ratelimit
   - Add nutrition parame in create
   - 
*/

const UPLOAD_MAX_FILE_SIZE = 1_000_000;

// TODO web dev cody vid figure out wtf is going on
const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
  signatureVersion: 'v4',
});

const addUserDataToRecipes = async (recipes: RecipesWithPics[]) => {
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
        code: "NOT_FOUND",
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
        include: {
          pics: true,
          nutrition: true,
        },
      });

      return addUserDataToRecipes(recipes);
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const recipe = await ctx.prisma.recipe.findUnique({
        where: { id: input.id },
        include: {
          pics: true,
          nutrition: true,
        },
      });

      if (!recipe) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToRecipes([recipe]))[0];
  }),
  getByUserId: publicProcedure
    .input(z.object({ userId: z.string()}))
    .query(async ({ ctx, input }) => {
      const recipes = await ctx.prisma.recipe.findMany({
        where: { authorId: input.userId },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
        include: { pics: true, nutrition: true, },
      });
      return (await addUserDataToRecipes(recipes));
  }),
  getByUsernameAndId: publicProcedure
    .input(z.object({
      username: z.string(),
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });
      if (!user) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found",
        });
      }
      const recipe = await ctx.prisma.recipe.findUnique({
        where: { id: input.id },
        include: { pics: true, nutrition: true, },
      });
      if (!recipe || user.id != recipe.authorId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      }
      const filteredUser = filterUserForClient(user);
      if (!user.username) return; // Won't actually hit bc user has to have a username to be found in the first place
      return {
        recipe,
        author: {
          ...filteredUser,
          username: filteredUser.username,
        },
      };
  }),
  create: privateProcedure
    .input( 
      // zod input validation
      z.object({
        name: z.string().min(1).max(64),
        description: z.string().min(1).max(255),
        instructions: z.string(),
        imageTypes: z.string().array(),
        nutrition: z.object({
          carbs: z.number(),
          protien: z.number(),
          fat: z.number(),
        }),
        tags: z.string().array(),
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
      there will be imageIds in the database with no image associated with their url.
     */
    
    const unawaitedPresignedURLArray = input.imageTypes.map(async (type) => {
      // Creating presigned url
      const id = createId();
      const params = ({
        Bucket: env.AWS_RECIPE_BUCKET_NAME,
        Key: id,
        Expires: 1800, // 30 minutes (may need to change)
      }) // May need to add beck content type
      const presignedURL = s3.getSignedUrl('putObject', params);
      
      if(!presignedURL) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR"});
      // Creates image data in database
      await ctx.prisma.recipePic.create({
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

    const presignedURLArray = await Promise.all(unawaitedPresignedURLArray);

    await ctx.prisma.nutrition.create({
      data: {
        carbs: input.nutrition.carbs,
        protien: input.nutrition.protien,
        fat: input.nutrition.fat,
        recipe: {
          connect: {
            id: post.id
          }
        }
      }
    });
    
    return {post, presignedURLArray};
  }),
  delete: privateProcedure
    .input(z.object({ recipeId: z.string() }))
    .mutation(async ({ctx, input}) => {
      const recipe_to_delete = await ctx.prisma.recipe.findUnique({
        where: { id: input.recipeId },
        include: { pics: true, nutrition: true, },
    });
    // Checking to make sure the recipe actually exists
    // Might need to change trpc error to just a return idrk
    if (!recipe_to_delete) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Author for recipe not found",
      });
    }
    // Checking for ownership of post
    if (ctx.userId != recipe_to_delete.authorId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "This is not your post",
      })
    }
    await ctx.prisma.nutrition.delete({
      where: {recipeId: recipe_to_delete.id}
    })
    // Stupidly ineffecient
    const keys : string[] = recipe_to_delete.pics.map((recipePic) => {
      const url = recipePic.url;
      let id : string = "";
      for (let i = url.length - 1; i >= 0; i--) {
        if (url.charAt(i) != '/') {
          let temp : string = url.charAt(i);
          id = temp += id;
        } else {
          return id;
        }
      }
      return id;
    })
    // TODO get AWS ids from pic urls
    recipe_to_delete.pics.map(async (picId) => {
      s3.deleteObject()
    })
  }),
});