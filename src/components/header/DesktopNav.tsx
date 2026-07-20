// DesktopNav.tsx
import { Link } from "react-router-dom";
import { UserProfileMenu } from "./UserProfileMenu";

interface DesktopNavProps {
  user: { name: string; picture?: string; email?: string; plan?: string } | null; // ✅ plan added
  isActive: (path: string) => boolean;
  onOpenModal: () => void;
}

export const DesktopNav = ({ user, isActive, onOpenModal }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      {user ? (
        <>
          <Link
            to="/"
            className={`relative py-1 text-sm font-medium transition-all duration-300 group ${
              isActive("/") 
                ? "text-blue-600" 
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Dashboard
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ${
                isActive("/") ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
          </Link>

          <Link
            to="/resume-analyzer"
            className={`relative py-1 text-sm font-medium transition-all duration-300 group ${
              isActive("/resume-analyzer")
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Resume Analyzer
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ${
                isActive("/resume-analyzer") ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
          </Link>
    <Link
            to="/live-interview/preferences"
            className={`relative py-1 text-sm font-medium transition-all duration-300 group ${
              isActive("/live-interview/preferences")
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Live AI Interview
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ${
                isActive("/live-interview/preferences") ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
          </Link>
          <Link
            to="/analytics"
            className={`relative py-1 text-sm font-medium transition-all duration-300 group ${
              isActive("/analytics")
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Analytics
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ${
                isActive("/analytics") ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
          </Link>

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