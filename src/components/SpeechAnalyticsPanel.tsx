// SpeechAnalyticsPanel.tsx
import React from "react";
import { motion } from "framer-motion";
import type { SpeechMetrics } from "../types/session";
import { 
  Clock, 
  Mic, 
  Pause, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface SpeechAnalyticsPanelProps {
    metrics?: SpeechMetrics;
}

const SpeechAnalyticsPanel: React.FC<SpeechAnalyticsPanelProps> = ({ metrics }) => {
    if (!metrics) return null;

    const getPaceColor = (rating: string) => {
        if (rating === "Good") return "text-emerald-600";
        if (rating === "Fast") return "text-amber-600";
        return "text-blue-600";
    };

    const getPaceBg = (rating: string) => {
        if (rating === "Good") return "bg-emerald-50 border-emerald-200";
        if (rating === "Fast") return "bg-amber-50 border-amber-200";
        return "bg-blue-50 border-blue-200";
    };

    const getPaceIcon = (rating: string) => {
        if (rating === "Good") return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
        if (rating === "Fast") return <TrendingUp className="w-3.5 h-3.5 text-amber-500" />;
        return <TrendingDown className="w-3.5 h-3.5 text-blue-500" />;
    };

    const getFillerStatus = (count: number) => {
        if (count <= 3) return { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
        if (count <= 6) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
        if (count <= 10) return { label: "Needs Improvement", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
        return { label: "Needs Significant Work", color: "text-red-600", bg: "bg-red-50 border-red-200" };
    };

    const getPauseStatus = (count: number) => {
        if (count <= 3) return { label: "Good Flow", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
        if (count <= 6) return { label: "Moderate", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
        if (count <= 10) return { label: "Frequent", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
        return { label: "Too Many Pauses", color: "text-red-600", bg: "bg-red-50 border-red-200" };
    };

    const getClarityColor = (score: number) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-blue-600";
        if (score >= 40) return "text-amber-600";
        return "text-red-600";
    };

    const getClarityBg = (score: number) => {
        if (score >= 80) return "bg-emerald-500";
        if (score >= 60) return "bg-blue-500";
        if (score >= 40) return "bg-amber-500";
        return "bg-red-500";
    };

    const fillerStatus = getFillerStatus(metrics.fillerWordCount || 0);
    const pauseStatus = getPauseStatus(metrics.pauseCount || 0);
    const clarityScore = Math.min(100, Math.max(0, metrics.clarityScore || 0));

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {/* Speaking Pace */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }} 
                className={`bg-white border ${getPaceBg(metrics.paceRating || "")} rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 ${metrics.paceRating === "Good" ? "border-l-emerald-500" : metrics.paceRating === "Fast" ? "border-l-amber-500" : "border-l-blue-500"}`}
            >
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Speaking Pace</p>
                    <div className={`p-1.5 rounded-lg ${getPaceBg(metrics.paceRating || "")}`}>
                        {getPaceIcon(metrics.paceRating || "")}
                    </div>
                </div>
                <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-bold text-gray-900">{Math.round(metrics.speakingPaceWpm || 0)}</span>
                    <span className="text-xs text-gray-400 pb-1 uppercase tracking-widest font-bold">WPM</span>
                </div>
                <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${getPaceColor(metrics.paceRating || "")}`}>
                    {metrics.paceRating || "N/A"}
                </p>
            </motion.div>

            {/* Filler Words */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }} 
                className={`bg-white border ${fillerStatus.bg} rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 ${metrics.fillerWordCount && metrics.fillerWordCount > 10 ? "border-l-red-500" : metrics.fillerWordCount && metrics.fillerWordCount > 6 ? "border-l-amber-500" : "border-l-emerald-500"}`}
            >
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Filler Words</p>
                    <div className={`p-1.5 rounded-lg ${fillerStatus.bg}`}>
                        <Mic className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                </div>
                <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-bold text-gray-900">{metrics.fillerWordCount || 0}</span>
                    <span className="text-xs text-gray-400 pb-1 uppercase tracking-widest font-bold">Words</span>
                </div>
                <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${fillerStatus.color}`}>
                    {fillerStatus.label}
                </p>
            </motion.div>

            {/* Total Pauses */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }} 
                className={`bg-white border ${pauseStatus.bg} rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 ${metrics.pauseCount && metrics.pauseCount > 10 ? "border-l-red-500" : metrics.pauseCount && metrics.pauseCount > 6 ? "border-l-amber-500" : "border-l-emerald-500"}`}
            >
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Pauses</p>
                    <div className={`p-1.5 rounded-lg ${pauseStatus.bg}`}>
                        <Pause className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                </div>
                <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-bold text-gray-900">{metrics.pauseCount || 0}</span>
                    <span className="text-xs text-gray-400 pb-1 uppercase tracking-widest font-bold">Pauses</span>
                </div>
                <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${pauseStatus.color}`}>
                    {Math.round((metrics.totalPauseDurationMs || 0) / 1000)}s Total
                </p>
            </motion.div>

            {/* Clarity */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }} 
                className="bg-white border border-gray-200/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-l-emerald-500"
            >
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Clarity</p>
                    <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                </div>
                <div className="flex items-end gap-2 mt-2">
                    <span className={`text-2xl font-bold ${getClarityColor(clarityScore)}`}>
                        {Math.round(clarityScore)}
                    </span>
                    <span className="text-xs text-gray-400 pb-1 uppercase tracking-widest font-bold">/100</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div 
                        className={`h-full ${getClarityBg(clarityScore)} rounded-full transition-all duration-1000`} 
                        style={{ width: `${clarityScore}%` }}
                    />
                </div>
                <p className={`text-[10px] uppercase tracking-widest font-bold mt-2 ${getClarityColor(clarityScore)}`}>
                    {clarityScore >= 80 ? "Excellent" : clarityScore >= 60 ? "Good" : clarityScore >= 40 ? "Fair" : "Needs Work"}
                </p>
            </motion.div>
        </div>
    );
};

export default SpeechAnalyticsPanel;