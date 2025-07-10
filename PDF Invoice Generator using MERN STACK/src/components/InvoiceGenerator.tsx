import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

export function InvoiceGenerator() {
  const products = useQuery(api.products.getProducts) || [];
  const createInvoice = useMutation(api.invoices.createInvoice);
  const generatePDF = useAction(api.invoices.generatePDF);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedProductsData = products.filter(p => selectedProducts.includes(p._id));
  const subtotal = selectedProductsData.reduce((sum, product) => sum + product.total, 0);
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  const handleGenerateInvoice = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create invoice
      const result = await createInvoice({
        products: selectedProductsData.map(p => ({
          name: p.name,
          quantity: p.quantity,
          rate: p.rate,
          total: p.total,
        })),
      });

      // Generate PDF
      const pdfResult = await generatePDF({ invoiceId: result.invoiceId });
      
      // Get download URL
      const url = await fetch(`/api/storage/${pdfResult.storageId}`);
      
      toast.success(`Invoice ${result.invoiceNumber} generated successfully!`);
      setSelectedProducts([]);
    } catch (error) {
      toast.error("Failed to generate invoice");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
        <p className="text-gray-500">Add some products first to generate an invoice</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Generate Invoice</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Products</h3>
        
        <div className="space-y-2">
          {products.map((product) => (
            <label key={product._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product._id)}
                onChange={() => handleProductToggle(product._id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-gray-500">Qty: {product.quantity}</div>
                <div className="text-gray-500">Rate: ₹{product.rate.toFixed(2)}</div>
                <div className="font-medium text-gray-900">₹{product.total.toFixed(2)}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handleGenerateInvoice}
            disabled={isGenerating}
            className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "Generating Invoice..." : "Generate PDF Invoice"}
          </button>
        </div>
      )}
    </div>
  );
}
