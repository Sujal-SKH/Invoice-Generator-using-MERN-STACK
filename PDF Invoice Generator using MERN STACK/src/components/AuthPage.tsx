"use client";
import { useState } from "react";
import { SignInForm } from "../SignInForm";
import { SignUpForm } from "./SignUpForm";

export function AuthPage() {
  const [currentView, setCurrentView] = useState<"signin" | "signup">("signin");

  const handleSignUpSuccess = () => {
    setCurrentView("signin");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-center items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">PDF Invoice Generator</h2>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          {currentView === "signin" ? (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-600">Sign in to your account</p>
              </div>
              <SignInForm />
              <div className="mt-6 text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <button
                  onClick={() => setCurrentView("signup")}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign up here
                </button>
              </div>
            </div>
          ) : (
            <div>
              <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
              <div className="mt-6 text-center">
                <span className="text-gray-600">Already have an account? </span>
                <button
                  onClick={() => setCurrentView("signin")}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
