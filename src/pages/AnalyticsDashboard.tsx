// AnalyticsDashboard.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { getAnalytics } from "../features/analytics/analyticsSlice";
import { ResumeAnalysisHistory } from "../features/resume/components/ResumeAnalysisHistory";
import { ACHIEVEMENTS } from "../config/achievements";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import {
  TrendingUpIcon,
  AwardIcon,
  ClockIcon,
  BarChart3Icon,
  TargetIcon,
  UserIcon,
  SparklesIcon,
  TrophyIcon,
  StarIcon,
  ZapIcon,
  ShieldCheckIcon,
  BrainIcon,
  Mic,
  ActivityIcon,
  FlameIcon,
  MedalIcon
} from "lucide-react";

interface ProgressItem {
  date: string;
  technicalScore: number;
  confidenceScore: number;
}

interface RoleItem {
  _id: string;
  avgScore: number;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const calculateXpProgress = (xp: number, currentLevelXp: number, nextLevelXp: number | null) => {
  if (nextLevelXp === null || nextLevelXp <= currentLevelXp) return 100;
  return Math.max(0, Math.min(100, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));
};

const AnalyticsDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, isError, message } = useSelector((state: RootState) => state.analytics);

  const [hiddenDatasets, setHiddenDatasets] = useState<Record<number, boolean>>({
    0: false,
    1: false,
  });

  const toggleDataset = (index: number) => {
    setHiddenDatasets(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    dispatch(getAnalytics());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] w-full">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 bg-white p-8 rounded-3xl border border-red-200 shadow-sm max-w-2xl mx-auto mt-20">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-200">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-600 font-bold text-lg">Failed to load analytics</p>
        <p className="text-gray-500 text-sm mt-2">{message}</p>
      </div>
    );
  }

  if (!data) return null;

  const { stats, progress, byRole, speech, gamification } = data;

  // Progress Over Time Chart
  const technicalScores = progress?.map((p: ProgressItem) => p.technicalScore) || [];
  const confidenceScores = progress?.map((p: ProgressItem) => p.confidenceScore) || [];
  const progressLabels = progress?.map((p: ProgressItem) => {
    const parts = String(p.date).split('-');
    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : String(p.date);
  }) || [];

  const lineChartData = {
    labels: progressLabels,
    datasets: [
      {
        label: "Technical Score",
        data: technicalScores,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        hidden: hiddenDatasets[0],
      },
      {
        label: "Confidence Score",
        data: confidenceScores,
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
        hidden: hiddenDatasets[1],
      },
    ]
  };

  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "#94A3B8", font: { family: "'Inter', sans-serif", weight: 'bold' } }
      },
      x: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: {
          color: "#94A3B8",
          font: { size: 10, family: "'Inter', sans-serif", weight: 'bold' },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      }
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3 font-display">
            Performance Insights
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl text-[15px]">
            Executive-level analysis of your interview performance, skill evolution, and readiness metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-600 flex items-center gap-2">
            <ActivityIcon className="w-4 h-4" />
            Live Analytics
          </span>
        </div>
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Professional Development */}
        <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Professional Development</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
              <TrendingUpIcon className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="mb-6 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-900 font-display">Lvl. {gamification?.currentLevel || 0}</span>
              <span className="text-gray-500 font-bold text-sm">{gamification?.currentTitle || 'Beginner'}</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest">
              <span>Current Progress</span>
              <span className="text-blue-600">{gamification?.xp || 0} / {gamification?.nextLevelXp || 'MAX'} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${calculateXpProgress(gamification?.xp || 0, gamification?.currentLevelXp || 0, gamification?.nextLevelXp || null)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Total Sessions</h3>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-200">
              <BarChart3Icon className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div className="mb-6 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-900 font-display">{stats?.totalSessions || 0}</span>
              <span className="text-gray-500 font-bold text-sm">Completed</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-16 mt-auto relative z-10">
            {Array.from({ length: 14 }).map((_, i) => {
              const scoreIdx = technicalScores.length - 14 + i;
              const score = scoreIdx >= 0 ? technicalScores[scoreIdx] : 0;
              return (
                <div
                  key={i}
                  className="flex-1 bg-gray-100 rounded-sm relative overflow-hidden group-hover:bg-gray-200 transition-colors"
                  style={{ height: '100%' }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-400 to-indigo-300 rounded-sm transition-all duration-500 ease-out"
                    style={{ height: score > 0 ? `${score}%` : '0%' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Consistency */}
        <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group md:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Current Streak</h3>
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <FlameIcon className="w-3 h-3" />
              Active
            </div>
          </div>
          <div className="mt-auto relative z-10">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-gray-900 font-display">{gamification?.streakDays || 0}</span>
              <span className="text-gray-500 font-bold text-sm">Days</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <span>Overall Average</span>
              <span className="text-emerald-600">{Math.round(stats?.averageOverallScore || 0)}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Over Time */}
        <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Progress Over Time</h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <div
                className={`flex items-center gap-2 cursor-pointer transition-opacity select-none ${hiddenDatasets[0] ? 'opacity-50 text-gray-400' : 'text-gray-600 hover:opacity-80'}`}
                onClick={() => toggleDataset(0)}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${hiddenDatasets[0] ? 'bg-gray-300' : 'bg-blue-500 shadow-sm'}`} />
                Tech Score
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer transition-opacity select-none ${hiddenDatasets[1] ? 'opacity-50 text-gray-400' : 'text-gray-600 hover:opacity-80'}`}
                onClick={() => toggleDataset(1)}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${hiddenDatasets[1] ? 'bg-gray-300' : 'bg-purple-500 shadow-sm'}`} />
                Confidence
              </div>
            </div>
          </div>
          <div className="h-64 w-full relative z-10">
            {progress && progress.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium text-sm bg-gray-50 rounded-2xl border border-gray-200">
                Not enough data to display progress
              </div>
            )}
          </div>
        </div>

        {/* Performance By Role */}
        <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Performance By Role</h3>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <TargetIcon className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <div className="space-y-6 flex-1 flex flex-col justify-center relative z-10">
            {byRole && byRole.length > 0 ? byRole.map((role: RoleItem, idx: number) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-3 group-hover:text-gray-900 transition-colors">
                  <span
                    className="truncate pr-4"
                    title={role._id.length >= 50 ? `${role._id.trim()}...` : role._id}
                  >
                    {role._id.length >= 50 ? `${role._id.trim()}...` : role._id}
                  </span>
                  <span className="text-blue-600 shrink-0 font-bold">{Math.round(role.avgScore)}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.round(role.avgScore)}%` }} />
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium text-sm bg-gray-50 rounded-2xl border border-gray-200">
                No role data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Speech Behavioral Analytics */}
      {speech && (
        <div className="bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden mt-6">
          <div className="flex items-center gap-5 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-xl font-display tracking-tight">Average Speech Patterns</h3>
              <p className="text-[13px] text-gray-500 font-medium mt-1">Real-time linguistic patterns from your sessions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200 relative z-10">
            {/* Ring 1 */}
            <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
              <div className="relative w-36 h-36 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-gray-200" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-blue-500 transition-all duration-1000 ease-out" strokeWidth="6"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * (Math.min(speech.avgPace, 200) / 200))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 font-display">{Math.round(speech.avgPace)}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">WPM</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-900 font-bold text-[15px] mb-1.5">Average Pace</div>
                <div className="text-blue-500 text-xs font-bold uppercase tracking-widest">Words per minute</div>
              </div>
            </div>

            {/* Ring 2 */}
            <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
              <div className="relative w-36 h-36 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-gray-200" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-amber-500 transition-all duration-1000 ease-out" strokeWidth="6"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * (Math.min(speech.avgFillerWords, 30) / 30))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 font-display">{Math.round(speech.avgFillerWords)}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">COUNT</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-900 font-bold text-[15px] mb-1.5">Average Filler Words</div>
                <div className="text-amber-500 text-xs font-bold uppercase tracking-widest">Per question</div>
              </div>
            </div>

            {/* Ring 3 */}
            <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
              <div className="relative w-36 h-36 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-gray-200" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-purple-500 transition-all duration-1000 ease-out" strokeWidth="6"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * (speech.avgClarity / 100))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 font-display">{Math.round(speech.avgClarity)}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">SCORE</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-900 font-bold text-[15px] mb-1.5">Clarity Score</div>
                <div className="text-purple-500 text-xs font-bold uppercase tracking-widest">Overall clarity</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements & Badges Gallery */}
      <div className="bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden mt-6">
        <div className="flex items-center gap-5 mb-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
            <TrophyIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-xl font-display tracking-tight">Achievements & Badges</h3>
            <p className="text-[13px] text-gray-500 font-medium mt-1">Unlock badges by pushing your limits and practicing consistently</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
          {ACHIEVEMENTS.map((badge) => {
            const isUnlocked = gamification?.badges?.some((b: { badgeId: string; }) => b.badgeId === badge.id);
            const badgeRecord = gamification?.badges?.find((b: { badgeId: string; }) => b.badgeId === badge.id);
            
            return (
              <div 
                key={badge.id} 
                className={`p-5 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center gap-3 relative overflow-hidden group
                  ${isUnlocked 
                    ? 'bg-amber-50 border-amber-200 shadow-sm hover:shadow-md hover:border-amber-300' 
                    : 'bg-gray-50 border-gray-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
              >
                {isUnlocked && (
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-200/30 blur-2xl rounded-full"></div>
                )}
                
                <div className={`text-4xl ${!isUnlocked && 'opacity-50'}`}>
                  {badge.icon}
                </div>
                
                <div className="space-y-1">
                  <h4 className={`text-sm font-bold ${isUnlocked ? 'text-amber-700' : 'text-gray-500'}`}>
                    {badge.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium leading-snug">
                    {badge.desc}
                  </p>
                </div>

                {isUnlocked && badgeRecord?.earnedAt && (
                  <div className="text-[9px] font-bold text-amber-600/80 uppercase tracking-widest mt-auto pt-2 border-t border-amber-200/50 w-full">
                    {new Date(badgeRecord.earnedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resume Analysis History */}
      <ResumeAnalysisHistory />
    </div>
  );
};

export default AnalyticsDashboard;