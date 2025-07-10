import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addProduct = mutation({
  args: {
    name: v.string(),
    quantity: v.number(),
    rate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const total = args.quantity * args.rate;

    return await ctx.db.insert("products", {
      userId,
      name: args.name,
      quantity: args.quantity,
      rate: args.rate,
      total,
      createdAt: Date.now(),
    });
  },
});

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== userId) {
      throw new Error("Product not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    quantity: v.number(),
    rate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== userId) {
      throw new Error("Product not found or unauthorized");
    }

    const total = args.quantity * args.rate;

    await ctx.db.patch(args.id, {
      name: args.name,
      quantity: args.quantity,
      rate: args.rate,
      total,
    });
  },
});
