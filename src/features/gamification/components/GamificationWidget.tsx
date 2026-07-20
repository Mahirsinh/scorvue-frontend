// GamificationWidget.tsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchGamificationProfile, fetchLeaderboard } from "../gamificationSlice";
import { motion } from "framer-motion";
import type { AppDispatch, RootState } from "../../../app/store";
import { BadgeIcon } from "./BadgeIcon";
import { 
  TrophyIcon, 
  FireIcon, 
  SparklesIcon, 
  UserGroupIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  StarIcon
} from "@heroicons/react/24/outline";

const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: "Novice" },
  { level: 2, xpRequired: 200, title: "Apprentice" },
  { level: 3, xpRequired: 500, title: "Practitioner" },
  { level: 4, xpRequired: 1000, title: "Intermediate" },
  { level: 5, xpRequired: 2000, title: "Advanced" },
  { level: 6, xpRequired: 3500, title: "Expert" },
  { level: 7, xpRequired: 5000, title: "Master" },
  { level: 8, xpRequired: 7500, title: "Grandmaster" },
  { level: 9, xpRequired: 10000, title: "Legend" },
  { level: 10, xpRequired: 15000, title: "Titan" },
];

export const GamificationWidget = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, leaderboard, isLoading, isError, message } = useSelector((state: RootState) => state.gamification);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchGamificationProfile());
    dispatch(fetchLeaderboard(10));
  }, [dispatch]);

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-3xl w-full"></div>;
  }

  if (isError) {
    return <div className="p-6 text-rose-600 bg-rose-50 rounded-3xl border border-rose-200 mb-8">Gamification Error: {message}</div>;
  }

  if (!profile) return null;

  // Calculate XP boundaries
  const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === profile.level) || LEVEL_THRESHOLDS[0];
  const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level === profile.level + 1);
  const currentLevelXp = currentThreshold.xpRequired;
  const nextLevelXp = nextThreshold ? nextThreshold.xpRequired : null;

  const calculateXpProgress = () => {
    if (!nextLevelXp) return 100;
    const progress = ((profile.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {/* 1. Professional Development */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }} 
        className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/30">
            <ChartBarIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-gray-900 font-bold text-xs uppercase tracking-wider">Professional Development</h3>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex-1">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-gray-400 text-[8px] uppercase tracking-wider mb-0.5">Current Tier</div>
              <div className="text-emerald-600 text-xs font-bold">{profile.title}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-900 font-bold text-base">Level {profile.level}</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-1.5">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${calculateXpProgress()}%` }}
            >
              <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-[8px] font-medium">Progress to next level</span>
            <span className="text-gray-600 text-[9px] font-bold tracking-wide">{profile.xp} / {nextLevelXp || "MAX"} XP</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Consistency */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.15 }} 
        className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-1.5 rounded-lg shadow-lg shadow-orange-500/30">
            <FireIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-gray-900 font-bold text-xs uppercase tracking-wider">Consistency</h3>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div>
            <div className="flex justify-between text-[7px] text-gray-400 mb-1 px-0.5 font-medium">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 21 }).map((_, i) => {
                const daysAgo = 20 - i;
                const isActive = daysAgo < profile.currentStreak;
                const isHighActivity = isActive && i % 2 === 0;
                return (
                  <div key={i} className={`w-full aspect-square rounded-full flex items-center justify-center ${isActive ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    {isActive && <div className={`w-1.5 h-1.5 rounded-full ${isHighActivity ? 'bg-emerald-500' : 'bg-emerald-300'}`}></div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CalendarDaysIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-base font-bold text-emerald-600 tracking-tight leading-none">{profile.currentStreak}</div>
                <div className="text-[7px] text-gray-500 uppercase tracking-widest">Days</div>
              </div>
            </div>
            <span className="text-[7px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">Active</span>
          </div>
        </div>
      </motion.div>

      {/* 3. Skills Verified */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }} 
        className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg shadow-lg shadow-purple-500/30">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-gray-900 font-bold text-xs uppercase tracking-wider">Skills Verified</h3>
          </div>
          <span className="text-emerald-600 text-[8px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {profile?.badges?.length || 0}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center items-start flex-1 content-start">
          {profile?.badges && profile.badges.length > 0 ? (
            profile.badges.slice(0, 8).map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className="w-9 h-9 mb-0.5 shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <BadgeIcon badgeId={badge.badgeId} className="w-full h-full" />
                </div>
                <span 
                  className="text-[6px] text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center group-hover:text-gray-700 transition-colors max-w-[45px]"
                  title={badge.badgeId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                >
                  {badge.badgeId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              </div>
            ))
          ) : (
            <div className="w-full text-center text-gray-400 text-[9px] py-3">No skills verified yet</div>
          )}
        </div>
      </motion.div>

      {/* 4. Global Rank */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.25 }} 
        className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-1.5 rounded-lg shadow-lg shadow-amber-500/30">
            <TrophyIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-xs uppercase tracking-wider">Global Rank</h3>
            <p className="text-gray-400 text-[7px] leading-none">
              Rank: {profile?.leaderboardOptIn ? 
                leaderboard?.find(l => l.userId ? (l.userId === user?._id || l.userId === user?.id) : (l.name === user?.name))?.rank || '-' 
                : 'Opted Out'}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[110px] pr-1">
          {leaderboard?.slice(0, 10).map((entry, idx) => {
            const isCurrentUser = entry.userId ? (entry.userId === user?._id || entry.userId === user?.id) : (entry.name === user?.name);
            return (
              <div key={idx} className={`p-1.5 flex items-center gap-2 rounded-lg transition-all duration-200 ${
                isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}>
                <span className={`${isCurrentUser ? 'text-blue-600' : 'text-gray-400'} font-bold text-[8px] w-3 text-center shrink-0`}>
                  {idx + 1}
                </span>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${
                  isCurrentUser ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCurrentUser ? '👤' : <UserGroupIcon className="w-2 h-2" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`${isCurrentUser ? 'text-blue-600' : 'text-gray-700'} text-[8px] font-bold truncate`}>
                    {isCurrentUser ? "You" : entry.name}
                  </div>
                  <div className={`text-[7px] truncate ${isCurrentUser ? 'text-blue-500' : 'text-gray-400'}`}>
                    Lv.{entry.level} • {entry.xp} XP
                  </div>
                </div>
                {isCurrentUser && (
                  <div className="flex items-center gap-0.5 bg-amber-50 px-1 py-0.5 rounded-full border border-amber-200 shrink-0">
                    <StarIcon className="w-2 h-2 text-amber-500" />
                    <span className="text-[5px] font-bold text-amber-600">YOU</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};