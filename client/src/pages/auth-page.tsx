import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AuthForm from "@/components/auth-form";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mx-auto p-4">
        {/* Left side - Auth Form */}
        <div className="w-full md:w-1/2 md:pr-8 mb-8 md:mb-0">
          <AuthForm />
        </div>
        
        {/* Right side - Hero Section */}
        <div className="w-full md:w-1/2 bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-primary mb-4">Welcome to IITH Room Booking System</h2>
          <p className="text-gray-600 mb-6">
            A comprehensive platform designed for IITH users to efficiently manage and book institutional spaces.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-secondary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Easy Search & Filters</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Find the perfect room by filtering date, time, capacity, and room type.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-secondary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Real-time Availability</h3>
                <p className="mt-1 text-sm text-gray-600">
                  See room availability status instantly, clearly marked as available or booked.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-secondary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Email Confirmations</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Receive booking confirmations and updates directly to your IITH email.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-gray-500">
              Only users with @iith.ac.in email addresses can access this system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
