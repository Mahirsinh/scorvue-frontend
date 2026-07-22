// DesktopNav.tsx
import { Link } from "react-router-dom";
import { UserProfileMenu } from "./UserProfileMenu";

interface DesktopNavProps {
  user: { name: string; picture?: string; email?: string; plan?: string } | null;
  isActive: (path: string) => boolean;
  onOpenModal: () => void;
}

const navLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/resume-analyzer", label: "Resume Analyzer" },
  { to: "/live-interview/preferences", label: "Live AI Interview" },
  { to: "/analytics", label: "Analytics" },
];

export const DesktopNav = ({ user, isActive, onOpenModal }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center gap-6">
      {user ? (
        <>
          <div className="flex items-center gap-1 bg-gray-100/70 rounded-full p-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  isActive(link.to)
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <UserProfileMenu user={user} onOpenModal={onOpenModal} />
        </>
      ) : (
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-xl"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 text-sm"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
};
