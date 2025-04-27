import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import UserMenu from "./user-menu";
import { useAuth } from "@/hooks/use-auth";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Book Room";
      case "/bookings":
        return "My Bookings";
      case "/history":
        return "History";
      default:
        return "IITH Room Booking";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold">IITH Room Booking</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && <UserMenu user={user} />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Page Content */}
        <div className="flex-grow overflow-auto">
          {/* Mobile Header */}
          <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm">
            <button
              className="text-primary focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <span className="font-semibold text-lg">{getPageTitle()}</span>
            {user && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-white font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Navigation Menu */}
          <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

          {/* Content Container */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
