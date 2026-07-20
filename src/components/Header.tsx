// Header.tsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { AnimatePresence } from "framer-motion";

import AccountModal from "./AccountModal";
import { Logo } from "./header/Logo";
import { DesktopNav } from "./header/DesktopNav";
import { MobileNav } from "./header/MobileNav";

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if current route is interview page
  const isInterviewRoute = location.pathname.includes('/interview') || 
                           location.pathname === '/interview' ||
                           location.pathname === '/cheating' ||
                           location.pathname.startsWith('/interview?');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  console.log(user);

  // Don't render header on interview pages
  if (isInterviewRoute) {
    return null;
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm py-2"
            : "bg-white/60 backdrop-blur-sm py-4 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-full">
            {/* Logo Section */}
            <Logo />

            {/* Desktop Navigation */}
            <DesktopNav
              user={user}
              isActive={isActive}
              onOpenModal={() => setIsAccountModalOpen(true)}
            />

            {/* Mobile Menu Button + Navigation Dropdown */}
            <MobileNav
              user={user}
              isOpen={isMenuOpen}
              onToggle={() => setIsMenuOpen(!isMenuOpen)}
              onClose={() => setIsMenuOpen(false)}
              isActive={isActive}
              onOpenModal={() => setIsAccountModalOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* User Settings Modal */}
      <AnimatePresence>
        {isAccountModalOpen && (
          <AccountModal onClose={() => setIsAccountModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;