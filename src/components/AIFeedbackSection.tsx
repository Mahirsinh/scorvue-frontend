// AIFeedbackSection.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpeechAnalyticsPanel from "./SpeechAnalyticsPanel";
import type { SpeechMetrics } from "../types/session";
import { Brain, Mic, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

interface AIFeedbackSectionProps {
    isEvaluated: boolean;
    feedback: string;
    score: number;
    speechMetrics?: SpeechMetrics;
}

const AIFeedbackSection: React.FC<AIFeedbackSectionProps> = ({ isEvaluated, feedback, score, speechMetrics }) => {
    const [activeTab, setActiveTab] = useState<'feedback' | 'speech'>('feedback');

    if (!isEvaluated) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
        if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
        if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Fair";
        return "Needs Work";
    };

    const getScoreIcon = (score: number) => {
        if (score >= 80) return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        if (score >= 60) return <Sparkles className="w-4 h-4 text-blue-500" />;
        if (score >= 40) return <AlertCircle className="w-4 h-4 text-amber-500" />;
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    };

    return (
        <div className="mt-6 bg-white border border-gray-200/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    <path d="M2 12h20" />
                </svg>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'feedback' 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 border border-transparent'
                        }`}
                    >
                        <Brain className="w-3.5 h-3.5 inline mr-1.5" />
                        AI Feedback
                    </button>
                    {speechMetrics && (
                        <button
                            onClick={() => setActiveTab('speech')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                                activeTab === 'speech' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 border border-transparent'
                            }`}
                        >
                            <Mic className="w-3.5 h-3.5 inline mr-1.5" />
                            Speech Analysis
                        </button>
                    )}
                </div>

                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${getScoreColor(score)}`}>
                    {getScoreIcon(score)}
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${getScoreColor(score).split(' ')[0]}`}>
                        {getScoreLabel(score)}
                    </span>
                    <span className={`text-[10px] font-bold ${getScoreColor(score).split(' ')[0]}`}>
                        {score}/100
                    </span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'feedback' ? (
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative z-10 mt-4"
                    >
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-blue-500" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Feedback Analysis</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                {feedback || "No feedback available"}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="speech"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative z-10 mt-4"
                    >
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <Mic className="w-4 h-4 text-emerald-500" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Speech Metrics</span>
                            </div>
                            <SpeechAnalyticsPanel metrics={speechMetrics} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIFeedbackSection;