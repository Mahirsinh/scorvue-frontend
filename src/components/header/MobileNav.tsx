// MobileNav.tsx
import { Link } from "react-router-dom";

interface MobileNavProps {
  user: { name: string; picture?: string; email?: string } | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isActive: (path: string) => boolean;
  onOpenModal: () => void;
}

export const MobileNav = ({
  user,
  isOpen,
  onToggle,
  onClose,
  isActive,
  onOpenModal,
}: MobileNavProps) => {
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 group"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1.5">
          <span
            className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </div>
      </button>

      {/* Mobile Navigation Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] shadow-xl" : "max-h-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-6 space-y-4">
          {user ? (
            <>
              <div
                onClick={() => {
                  onOpenModal();
                  onClose();
                }}
                className="flex items-center space-x-3 mb-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 cursor-pointer hover:shadow-md transition-all"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email || ""}</p>
                </div>
                <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"></div>
              </div>
              <Link
                to="/"
                onClick={onClose}
                className={`block py-2.5 text-sm font-medium transition-colors ${
                  isActive("/") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/resume-analyzer"
                onClick={onClose}
                className={`block py-2.5 text-sm font-medium transition-colors ${
                  isActive("/resume-analyzer")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Resume Analyzer
              </Link>
              <Link
                to="/live-interview/preferences"
                onClick={onClose}
                className={`block py-2.5 text-sm font-medium transition-colors ${
                  isActive("/live-interview/preferences")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Live AI Interview
              </Link>
              <Link
                to="/analytics"
                onClick={onClose}
                className={`block py-2.5 text-sm font-medium transition-colors ${
                  isActive("/analytics")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >

                Analytics
              </Link>
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    onOpenModal();
                    onClose();
                  }}
                  className="w-full text-left text-sm font-medium text-red-600 hover:text-red-700 py-2"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <Link
                to="/login"
                onClick={onClose}
                className="block py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="block py-2.5 text-sm font-medium text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg transition-all"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};