// LeaderboardWidget.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchLeaderboard } from "../gamificationSlice";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star, Users } from "lucide-react";

export const LeaderboardWidget = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { leaderboard, isLoading, isError, message } = useSelector(
    (state: RootState) => state.gamification
  );

  useEffect(() => {
    dispatch(fetchLeaderboard(10));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-gray-200/50 rounded-3xl shadow-sm animate-pulse h-64">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded-full mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-100 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded-full mb-2" />
                  <div className="h-3 w-16 bg-gray-200 rounded-full" />
                </div>
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-3xl border border-red-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-red-700">Leaderboard Error</h3>
            <p className="text-sm text-red-600">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return null;
  }

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-amber-500 bg-amber-100 border-amber-200";
    if (index === 1) return "text-slate-400 bg-slate-100 border-slate-200";
    if (index === 2) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-gray-400 bg-gray-100 border-gray-200";
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-amber-50 border-amber-200";
    if (index === 1) return "bg-slate-50 border-slate-200";
    if (index === 2) return "bg-amber-50 border-amber-200";
    return "bg-white border-gray-200/50 hover:border-gray-300";
  };

  const getRankText = (index: number) => {
    if (index === 0) return "text-amber-700";
    if (index === 1) return "text-slate-700";
    if (index === 2) return "text-amber-700";
    return "text-gray-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-3xl border border-gray-200/50 shadow-sm p-6 h-full hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
          <Trophy className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
          <p className="text-sm text-gray-500">Global Leaderboard</p>
        </div>
        <div className="ml-auto px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-[10px] font-bold text-blue-600 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {leaderboard.length} Users
        </div>
      </div>

      <div className="space-y-2.5">
        {leaderboard.map((user, index) => (
          <motion.div
            key={user.userId || `${user.name}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${getRankBg(index)} hover:shadow-sm`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Rank Number */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  index === 0
                    ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                    : index === 1
                    ? "bg-slate-400 text-white shadow-sm shadow-slate-400/30"
                    : index === 2
                    ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              
              {/* User Info */}
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-sm truncate ${getRankText(index)}`}>
                  {user.name}
                  {index === 0 && (
                    <Crown className="w-3.5 h-3.5 text-amber-500 inline ml-1.5" />
                  )}
                </p>
                <div className="flex items-center gap-2 text-xs font-medium mt-0.5">
                  <span className="text-blue-600">Level {user.level}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-gray-500">{user.xp} XP</span>
                </div>
              </div>
            </div>
            
            {/* Medal for top 3 */}
            {index < 3 && (
              <Medal className={`w-5 h-5 flex-shrink-0 ${
                index === 0 ? 'text-amber-500' : 
                index === 1 ? 'text-slate-400' : 
                'text-amber-600'
              }`} />
            )}
            
            {/* Star for others */}
            {index >= 3 && (
              <Star className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-[9px] text-gray-400 font-medium">Updated in real-time</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] text-gray-400 font-medium">Live</span>
        </div>
      </div>
    </motion.div>
  );
};