// UserProfileMenu.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User, Settings, LogOut, Crown, Sparkles, Zap } from "lucide-react";

interface UserProfileMenuProps {
  user: { 
    name: string; 
    avatar?: string; 
    email?: string;
    plan?: string; // ✅ NEW
  };
  onOpenModal: () => void;
}

export const UserProfileMenu = ({ user, onOpenModal }: UserProfileMenuProps) => {
  const navigate = useNavigate();
  const [isLongPress, setIsLongPress] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const hasAvatar = user?.avatar && user.avatar.startsWith('http');
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  
  const isElite = user?.plan?.toLowerCase() === 'elite';
  const planLabel = user.plan
    ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
    : "Free";

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLongPress(false);
    pressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      onOpenModal();
    }, 600);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    if (!isLongPress) {
      navigate('/profile');
    }
    setIsLongPress(false);
  };

  const handleMouseLeave = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    setIsLongPress(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsLongPress(false);
    pressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      onOpenModal();
    }, 600);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    if (!isLongPress) {
      navigate('/profile');
    }
    setIsLongPress(false);
  };

  const handleTouchMove = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    setIsLongPress(false);
  };

  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-300 group shadow-sm hover:shadow-md cursor-pointer relative ${
        isElite 
          ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 hover:from-amber-100 hover:via-yellow-100 hover:to-orange-100 border-amber-300/60 hover:border-amber-400 shadow-amber-200/50 hover:shadow-amber-300/50' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-100/60 hover:border-blue-200'
      }`}
    >
      {/* Premium Glow Effect - Elite Only */}
      {isElite && (
        <>
          {/* Animated glow ring */}
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 opacity-40 blur-md animate-pulse pointer-events-none"></div>
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 opacity-20 blur-xl animate-pulse pointer-events-none"></div>
          
          {/* Fire/sparkle particles */}
          <div className="absolute -top-2 -right-1 text-amber-500 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <div className="absolute -bottom-1 -left-1 text-orange-400 animate-bounce delay-75">
            <Sparkles className="w-2.5 h-2.5 fill-orange-400" />
          </div>
          <div className="absolute top-1 -right-2 text-yellow-400 animate-pulse">
            <Zap className="w-3 h-3 fill-yellow-400" />
          </div>
        </>
      )}

      {/* Profile Picture */}
      <div className="relative flex-shrink-0">
        {hasAvatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className={`w-9 h-9 rounded-full object-cover border-2 shadow-sm ${
              isElite ? 'border-amber-300 shadow-amber-200/50' : 'border-white'
            }`}
          />
        ) : (
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 ${
            isElite 
              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 border-amber-300 shadow-amber-200/50' 
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 border-white'
          }`}>
            {initials}
          </div>
        )}
        
        {/* Online status indicator */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 shadow-sm ${
          isElite 
            ? 'bg-amber-500 border-amber-200 shadow-amber-300/50' 
            : 'bg-emerald-500 border-white'
        }`}>
          {isElite && (
            <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-50"></div>
          )}
        </div>
      </div>

      <div className="text-left">
        <p className={`text-sm font-semibold leading-tight ${
          isElite ? 'text-amber-800' : 'text-gray-800'
        }`}>
          {user.name.split(" ")[0]}
        </p>
        <p className={`text-[10px] font-medium leading-tight flex items-center gap-1.5 ${
          isElite ? 'text-amber-600' : 'text-gray-500'
        }`}>
          {isElite ? (
            <>
              <Crown className="w-3 h-3 fill-amber-400 text-amber-400 animate-bounce" />
              <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 bg-clip-text text-transparent font-bold animate-pulse">
                ✦ {planLabel} ✦
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 inline-block"></span>
              Plan - {planLabel}
            </>
          )}
        </p>
      </div>

      <ChevronDown className={`w-4 h-4 transition-colors ml-1 ${
        isElite ? 'text-amber-500 group-hover:text-amber-600' : 'text-gray-400 group-hover:text-gray-600'
      }`} />

      {/* Tooltip */}
      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
        <span className={`text-[8px] font-medium text-white px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5 ${
          isElite ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gray-900/90'
        }`}>
          <span className="flex items-center gap-0.5">
            <User className="w-2.5 h-2.5" />
            <span>Click</span>
          </span>
          <span className="w-px h-3 bg-white/20"></span>
          <span className="flex items-center gap-0.5">
            <Settings className="w-2.5 h-2.5" />
            <span>Hold</span>
          </span>
        </span>
        {/* Tooltip arrow */}
        <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
          isElite ? 'bg-amber-600' : 'bg-gray-900/90'
        }`}></div>
      </div>

      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
        isElite 
          ? 'bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-orange-400/0' 
          : 'bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-indigo-400/0'
      }`}></div>

      {/* Premium shine animation - Elite Only */}
      {isElite && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  );
};