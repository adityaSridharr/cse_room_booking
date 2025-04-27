import { useLocation, Link } from "wouter";
import { Calendar, BookMarked, History, ListFilter } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
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

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white w-full absolute z-10 shadow-md">
      <ul className="p-4">
        {navItems.map((item) => (
          <li key={item.path} className="mb-2">
            <Link 
              href={item.path} 
              className={`flex items-center p-3 rounded-lg transition-colors ${
                location === item.path
                  ? "bg-background text-primary font-medium"
                  : "text-textColor hover:bg-background"
              }`}
              onClick={onClose}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
