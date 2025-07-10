import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const createInvoice = mutation({
  args: {
    products: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      rate: v.number(),
      total: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    
    // Calculate totals
    const subtotal = args.products.reduce((sum, product) => sum + product.total, 0);
    const gst = subtotal * 0.18; // 18% GST
    const grandTotal = subtotal + gst;

    const invoiceId = await ctx.db.insert("invoices", {
      userId,
      invoiceNumber,
      products: args.products,
      subtotal,
      gst,
      grandTotal,
      createdAt: Date.now(),
    });

    return { invoiceId, invoiceNumber };
  },
});

export const getInvoices = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getInvoice = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const invoice = await ctx.db.get(args.id);
    if (!invoice || invoice.userId !== userId) {
      throw new Error("Invoice not found or unauthorized");
    }

    return invoice;
  },
});

export const generatePDF = action({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.runQuery(api.invoices.getInvoice, { id: args.invoiceId });
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Generate PDF content
    const pdfBuffer = await generateInvoicePDF(invoice);
    
    // Store PDF in Convex storage
    const storageId = await ctx.storage.store(new Blob([pdfBuffer], { type: "application/pdf" }));
    
    // Update invoice with PDF storage ID
    await ctx.runMutation(api.invoices.updateInvoicePDF, {
      invoiceId: args.invoiceId,
      pdfStorageId: storageId,
    });

    return { storageId };
  },
});

export const updateInvoicePDF = mutation({
  args: {
    invoiceId: v.id("invoices"),
    pdfStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice || invoice.userId !== userId) {
      throw new Error("Invoice not found or unauthorized");
    }

    await ctx.db.patch(args.invoiceId, {
      pdfStorageId: args.pdfStorageId,
    });
  },
});

async function generateInvoicePDF(invoice: any): Promise<Buffer> {
  // This is a simplified PDF generation - in a real app you'd use Puppeteer
  // For now, we'll create a basic PDF structure
  const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .totals { text-align: right; margin-top: 20px; }
        .total-row { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVOICE</h1>
        <h2>${invoice.invoiceNumber}</h2>
        <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div class="invoice-details">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.products.map((product: any) => `
              <tr>
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>₹${product.rate.toFixed(2)}</td>
                <td>₹${product.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Subtotal: ₹${invoice.subtotal.toFixed(2)}</p>
          <p>GST (18%): ₹${invoice.gst.toFixed(2)}</p>
          <p class="total-row">Grand Total: ₹${invoice.grandTotal.toFixed(2)}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Convert HTML to Buffer (simplified - in real app use Puppeteer)
  return Buffer.from(pdfContent, 'utf-8');
}
