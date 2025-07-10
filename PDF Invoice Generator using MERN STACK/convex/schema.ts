import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    userId: v.id("users"),
    name: v.string(),
    quantity: v.number(),
    rate: v.number(),
    total: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  invoices: defineTable({
    userId: v.id("users"),
    invoiceNumber: v.string(),
    products: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      rate: v.number(),
      total: v.number(),
    })),
    subtotal: v.number(),
    gst: v.number(),
    grandTotal: v.number(),
    createdAt: v.number(),
    pdfStorageId: v.optional(v.id("_storage")),
  }).index("by_user", ["userId"])
    .index("by_invoice_number", ["invoiceNumber"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
