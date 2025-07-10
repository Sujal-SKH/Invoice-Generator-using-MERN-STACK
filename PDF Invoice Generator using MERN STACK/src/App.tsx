import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { AuthPage } from "./components/AuthPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Content />
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
          <h2 className="text-xl font-semibold text-blue-600">PDF Invoice Generator</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {loggedInUser?.name || loggedInUser?.email || "User"}
            </span>
            <button
              onClick={() => {
                // This will be handled by SignOutButton component
                window.location.reload();
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </header>
        <main className="flex-1 flex items-start justify-center p-8">
          <div className="w-full max-w-6xl mx-auto">
            <Dashboard />
          </div>
        </main>
      </Authenticated>
      
      <Unauthenticated>
        <AuthPage />
      </Unauthenticated>
    </>
  );
}
