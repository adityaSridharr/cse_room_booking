import { useLocation, Link } from "wouter";
import { Calendar, BookMarked, History, ListFilter } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    {
      name: "Book Room",
      icon: <Calendar className="mr-3 text-primary" />,
      path: "/",
    },
    {
      name: "My Bookings",
      icon: <BookMarked className="mr-3 text-primary" />,
      path: "/bookings",
    },
    {
      name: "History",
      icon: <History className="mr-3 text-primary" />,
      path: "/history",
    },
    {
      name: "All Bookings",
      icon: <ListFilter className="mr-3 text-primary" />,
      path: "/all-bookings",
    },
  ];

  return (
    <nav className="hidden md:block bg-white w-64 shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-center p-2 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-12 text-primary"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
            <path d="M12 18h.01" />
            <path d="M16 18h.01" />
          </svg>
        </div>
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-1">
              <Link href={item.path} className={`flex items-center p-3 rounded-lg transition-colors group ${
                location === item.path
                  ? "bg-background text-primary font-medium"
                  : "text-textColor hover:bg-background"
              }`}>
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
