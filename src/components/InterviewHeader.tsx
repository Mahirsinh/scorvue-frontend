// InterviewHeader.tsx
import React, { useState, useEffect } from "react";

interface InterviewHeaderProps {
    role: string;
    startTime?: string;
    questionsCount: number;
    currentQuestionIndex: number;
    submittedLocal: Record<number, boolean>;
    questions: { isEvaluated: boolean; isSubmitted: boolean }[];
    handleNavigation: (index: number) => void;
    handleFinishInterview: () => void;
    isLoading: boolean;
    company?: string;
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({
    role,
    startTime,
    questions,
    currentQuestionIndex,
    submittedLocal,
    handleNavigation,
    handleFinishInterview,
    isLoading,
    company
}) => {
    const [elapsedTime, setElapsedTime] = useState("00:00");

    useEffect(() => {
        if (!startTime) return;
        const start = new Date(startTime).getTime();
        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, now - start);
            const hours = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);

            const hoursStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
            setElapsedTime(`${hoursStr}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-200/50 p-6 sm:p-8 mb-10 mt-6 relative">
            {/* Animated header line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl">
                <div className="absolute top-0 left-0 w-32 h-full bg-white/50 blur-sm animate-[slide_2s_linear_infinite]"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-4 relative">
                <div className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-3">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3 flex-wrap">
                            {role}
                            {company && company !== 'general' && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-md font-bold tracking-wider">
                                    {company.toUpperCase()}
                                </span>
                            )}
                        </h1>
                        {startTime && (
                            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold text-gray-700 tabular-nums font-mono">{elapsedTime}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2.5 mt-4">
                        {questions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleNavigation(i)}
                                className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-300 shrink-0 ${
                                    i === currentQuestionIndex 
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 scale-125 shadow-lg shadow-blue-500/30' 
                                        : q.isEvaluated 
                                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' 
                                        : (q.isSubmitted || submittedLocal[i]) 
                                        ? 'bg-indigo-400 animate-pulse' 
                                        : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                                title={`Question ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleFinishInterview}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto shrink-0 cursor-pointer text-sm font-bold rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    )}
                    {isLoading ? "Finalizing..." : "Finish Session"}
                </button>
            </div>
        </div>
    );
};

export default InterviewHeader;