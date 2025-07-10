import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProductForm() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProduct = useMutation(api.products.addProduct);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    
    const quantityNum = parseFloat(quantity);
    const rateNum = parseFloat(rate);
    
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }
    
    if (isNaN(rateNum) || rateNum <= 0) {
      toast.error("Rate must be a positive number");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addProduct({
        name: name.trim(),
        quantity: quantityNum,
        rate: rateNum,
      });
      
      // Reset form
      setName("");
      setQuantity("");
      setRate("");
      
      toast.success("Product added successfully!");
    } catch (error) {
      toast.error("Failed to add product");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = (parseFloat(quantity) || 0) * (parseFloat(rate) || 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Product</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
              Rate (₹) *
            </label>
            <input
              type="number"
              id="rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total (₹)
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-medium">
              ₹{total.toFixed(2)}
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
