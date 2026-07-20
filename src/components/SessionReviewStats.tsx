// SessionReviewStats.tsx
import React from "react";
import { 
  TrophyIcon, 
  BarChart3Icon, 
  CheckCircleIcon, 
  ClockIcon,
  TrendingUpIcon,
  TargetIcon,
  AwardIcon,
  TimerIcon
} from "lucide-react";

interface SessionReviewStatsProps {
    overallScore: number;
    avgTechnical: number;
    avgConfidence: number;
    duration: string;
}

const SessionReviewStats: React.FC<SessionReviewStatsProps> = ({
    overallScore,
    avgTechnical,
    avgConfidence,
    duration,
}) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-blue-600";
        if (score >= 40) return "text-amber-600";
        return "text-red-600";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-emerald-50 border-emerald-200";
        if (score >= 60) return "bg-blue-50 border-blue-200";
        if (score >= 40) return "bg-amber-50 border-amber-200";
        return "bg-red-50 border-red-200";
    };

    const getScoreBorder = (score: number) => {
        if (score >= 80) return "border-l-emerald-500";
        if (score >= 60) return "border-l-blue-500";
        if (score >= 40) return "border-l-amber-500";
        return "border-l-red-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Fair";
        return "Needs Work";
    };

    const getIcon = (label: string) => {
        switch(label) {
            case 'Overall Result':
                return <TrophyIcon className="w-4 h-4 text-blue-500" />;
            case 'Avg. Technical':
                return <TrendingUpIcon className="w-4 h-4 text-indigo-500" />;
            case 'Avg Confidence':
                return <TargetIcon className="w-4 h-4 text-purple-500" />;
            case 'Session Time':
                return <TimerIcon className="w-4 h-4 text-emerald-500" />;
            default:
                return <AwardIcon className="w-4 h-4 text-blue-500" />;
        }
    };

    const getIconBg = (label: string) => {
        switch(label) {
            case 'Overall Result':
                return "bg-blue-50 border-blue-200";
            case 'Avg. Technical':
                return "bg-indigo-50 border-indigo-200";
            case 'Avg Confidence':
                return "bg-purple-50 border-purple-200";
            case 'Session Time':
                return "bg-emerald-50 border-emerald-200";
            default:
                return "bg-blue-50 border-blue-200";
        }
    };

    const stats = [
        { 
            label: 'Overall Result', 
            value: `${overallScore}%`, 
            score: overallScore,
            color: getScoreColor(overallScore),
            bg: getScoreBg(overallScore),
            border: getScoreBorder(overallScore),
            labelText: getScoreLabel(overallScore)
        },
        { 
            label: 'Avg. Technical', 
            value: `${avgTechnical}%`, 
            score: avgTechnical,
            color: getScoreColor(avgTechnical),
            bg: getScoreBg(avgTechnical),
            border: getScoreBorder(avgTechnical),
            labelText: getScoreLabel(avgTechnical)
        },
        { 
            label: 'Avg Confidence', 
            value: `${avgConfidence}%`, 
            score: avgConfidence,
            color: getScoreColor(avgConfidence),
            bg: getScoreBg(avgConfidence),
            border: getScoreBorder(avgConfidence),
            labelText: getScoreLabel(avgConfidence)
        },
        { 
            label: 'Session Time', 
            value: duration, 
            score: 100,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-200",
            border: "border-l-emerald-500",
            labelText: "Completed"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
                <div 
                    key={i} 
                    className={`bg-white border ${stat.bg} rounded-3xl sm:rounded-[2.5rem] shadow-sm hover:shadow-md transition-all duration-300 p-5 sm:p-6 border-l-4 ${stat.border} relative overflow-hidden group`}
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 blur-2xl -mr-10 -mt-10"></div>
                    
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                            {stat.label}
                        </p>
                        <div className={`p-1.5 rounded-lg ${getIconBg(stat.label)} border`}>
                            {getIcon(stat.label)}
                        </div>
                    </div>
                    
                    <div className="relative z-10">
                        <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${stat.color} font-display`}>
                            {stat.value}
                        </p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${stat.color}`}>
                            {stat.labelText}
                        </p>
                    </div>

                    {/* Mini progress bar for scores */}
                    {stat.label !== 'Session Time' && (
                        <div className="mt-3 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                    stat.score >= 80 ? 'bg-emerald-500' :
                                    stat.score >= 60 ? 'bg-blue-500' :
                                    stat.score >= 40 ? 'bg-amber-500' :
                                    'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(stat.score, 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SessionReviewStats;