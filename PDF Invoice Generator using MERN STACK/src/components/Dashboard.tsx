import { useState } from "react";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";
import { InvoiceGenerator } from "./InvoiceGenerator";
import { InvoiceHistory } from "./InvoiceHistory";

type Tab = "products" | "generate" | "history";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("products");

  const tabs = [
    { id: "products" as Tab, label: "Add Products", icon: "📦" },
    { id: "generate" as Tab, label: "Generate Invoice", icon: "📄" },
    { id: "history" as Tab, label: "Invoice History", icon: "📋" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {activeTab === "products" && (
          <div className="space-y-6">
            <ProductForm />
            <ProductList />
          </div>
        )}
        
        {activeTab === "generate" && <InvoiceGenerator />}
        
        {activeTab === "history" && <InvoiceHistory />}
      </div>
    </div>
  );
}
