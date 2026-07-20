// SessionReview.tsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { useParams, Link } from "react-router-dom";
import { getSessionById } from "../features/session/sessionSlice";
import type { Question } from "../types/session";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SessionReviewStats from "../components/SessionReviewStats";
import FeedbackItem from "../components/FeedbackItem";
// Add these imports at the top with other imports
import chatGPTLogo from "../assets/chatgpt.png";
import claudeLogo from "../assets/claude.png";
import geminiLogo from "../assets/gemini.png";

import deepSeekLogo from "../assets/deepseek.png";
import { formatDuration } from "../utils/formatters";
import { 
  FileText, 
  Printer, 
  Home, 
  Clock, 
  Award, 
  TrendingUp,
  BarChart3,
  ChevronRight,
  Sparkles
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SessionReview = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { activeSession, isLoading } = useSelector((state: RootState) => state.session);

    useEffect(() => {
        if (sessionId) {
            dispatch(getSessionById(sessionId));
        }
    }, [sessionId, dispatch]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                </div>
                <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">
                    Processing Intelligence...
                </p>
            </div>
        );
    }
const handleLinkedInShare = () => {
    if (!activeSession) return;

    const shareText = `🎯 I just completed my ${role} interview assessment on SCORVUE!

📊 My Results:
• Overall Score: ${overallScore || 0}%
• Role: ${role} (${level})
• Questions Answered: ${questions?.length || 0}
• Company: ${company || 'General'}

Ready to ace your next interview? Try SCORVUE today! 🚀`;

    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=600');
};
    if (!activeSession || activeSession.status !== 'completed') {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-12 bg-white border border-gray-200/50 rounded-3xl shadow-sm text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-200">
                    <Clock className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tighter">Assessment In Progress</h2>
                <p className="text-gray-500 mb-10 font-bold text-xs uppercase tracking-widest leading-relaxed">
                    Our AI is currently synthesizing your performance data.<br />Please check back in a few moments.
                </p>
                <Link to="/" className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all hover:-translate-y-0.5">
                    <Home className="w-4 h-4" />
                    Return to Home
                </Link>
            </div>
        );
    }

    const { overallScore, metrics, role, level, questions, startTime, endTime, company } = activeSession;
    const finalMetrics = metrics || {};

    const barData = {
        labels: (questions || []).map((_: unknown, i: number) => `Q${i + 1}`),
        datasets: [{
            label: 'Technical Mastery',
            data: (questions || []).map((q: Question) => q.technicalScore || 0),
            backgroundColor: (questions || []).map((q: Question) => 
                (q.technicalScore || 0) >= 80 ? '#10b981' :
                (q.technicalScore || 0) >= 60 ? '#3b82f6' :
                (q.technicalScore || 0) >= 40 ? '#f59e0b' : '#ef4444'
            ),
            borderRadius: 4,
            hoverBackgroundColor: '#60a5fa',
        }],
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-blue-600 font-bold uppercase tracking-[0.3rem] text-[10px] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200">
                            Report Terminal
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-3 py-1 rounded-full">
                            ID: {sessionId?.slice(-8)}
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tighter flex items-center gap-4 flex-wrap">
                        {role}
                        <span className="text-gray-400 font-medium text-2xl">/ {level}</span>
                        {company && company !== 'general' && (
                            <span className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg tracking-widest">
                                {company.toUpperCase()}
                            </span>
                        )}
                    </h1>
                </div>
                <div className="flex gap-3">
                <div className="flex gap-3">
    <button 
        onClick={handleLinkedInShare}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors print:hidden shadow-sm hover:shadow-md"
    >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        
    </button>
    <button 
        onClick={() => window.print()} 
        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors border border-gray-200 print:hidden"
    >
        <Printer className="w-4 h-4" />
        Export Report
    </button>
</div>
                </div>
            </div>

            {/* Stats */}
            <SessionReviewStats
                overallScore={overallScore || 0}
                avgTechnical={finalMetrics.avgTechnical || 0}
                avgConfidence={finalMetrics.avgConfidence || 0}
                duration={formatDuration(startTime, endTime)}
            />

            {/* Chart Section */}
            <div className="bg-white border border-gray-200/50 rounded-3xl shadow-sm p-6 sm:p-8 relative group">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Mastery Calibration</h3>
                        <p className="text-xs text-gray-500">Technical scores per question</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3 text-[9px] font-bold">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span className="text-gray-500">≥80</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                            <span className="text-gray-500">≥60</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <span className="text-gray-500">≥40</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            <span className="text-gray-500">&lt;40</span>
                        </span>
                    </div>
                </div>

                <div className="relative w-full">
                    {/* Y-Axis Overlay */}
                    <div className="absolute left-0 top-0 bottom-4 w-[45px] z-10 bg-transparent border-r border-gray-200 overflow-hidden pointer-events-none">
                        <div className="h-64 sm:h-72" style={{ width: `${Math.max(100, (questions?.length || 0) * 40)}px` }}>
                            <Bar 
                                data={{
                                    ...barData,
                                    datasets: barData.datasets.map(ds => ({
                                        ...ds,
                                        backgroundColor: 'transparent',
                                        hoverBackgroundColor: 'transparent'
                                    }))
                                }} 
                                options={{
                                    maintainAspectRatio: false,
                                    animation: false,
                                    responsive: true,
                                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            max: 100,
                                            grid: { display: false },
                                            border: { display: false },
                                            ticks: { color: 'rgba(107, 114, 128, 0.5)', font: { size: 10, weight: 'bold' } }
                                        },
                                        x: {
                                            grid: { display: false },
                                            border: { display: false },
                                            ticks: { color: 'transparent', font: { size: 10, weight: 'bold' } }
                                        }
                                    }
                                }} 
                            />
                        </div>
                    </div>

                    {/* Scrolling Chart */}
                    <div className="w-full overflow-x-auto pb-4" style={{ 
                        maskImage: 'linear-gradient(to right, transparent 0px, transparent 45px, black 45px, black 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0px, transparent 45px, black 45px, black 100%)'
                    }}>
                        <div className="h-64 sm:h-72 relative pl-[45px]" style={{ minWidth: `${Math.max(100, (questions?.length || 0) * 40) + 45}px` }}>
                            <Bar 
                                data={barData} 
                                options={{
                                    maintainAspectRatio: false,
                                    animation: false,
                                    responsive: true,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            max: 100,
                                            grid: { color: 'rgba(0,0,0,0.05)' },
                                            border: { display: false },
                                            ticks: { display: false }
                                        },
                                        x: {
                                            grid: { display: false },
                                            ticks: { color: 'rgba(107, 114, 128, 0.7)', font: { size: 10, weight: 'bold' } }
                                        }
                                    }
                                }} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Feedback Section */}
          {/* Question Feedback Section */}
<div className="space-y-8">
    <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200">
            <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-900">Question Narrative</h2>
            <p className="text-sm text-gray-500">Detailed feedback for each question</p>
        </div>
        <div className="ml-auto px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
            {questions?.length || 0} Questions
        </div>
    </div>

    <div className="grid gap-8">
        {(questions || []).map((q: Question, index: number) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* Feedback Item Content */}
                <FeedbackItem question={q} index={index} />
                
                {/* AI Assistant Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium mr-1">Ask AI:</span>
                    
                    {/* ChatGPT */}
                    <button
                        onClick={() => {
                            const prompt = `How would you answer this interview question: "${q.question}"? Please provide a structured, professional response.`;
                            window.open(`https://chat.openai.com/?q=${encodeURIComponent(prompt)}`, '_blank');
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#10a37f] hover:bg-gray-50 rounded-xl text-sm font-medium transition-all hover:scale-105"
                        title="Ask ChatGPT"
                    >
                        <img src={chatGPTLogo} alt="ChatGPT" className="w-6 h-6 rounded-full" />
                        <span className="text-gray-700">ChatGPT</span>
                    </button>

                    {/* Claude */}
                    <button
                        onClick={() => {
                            const prompt = `How would you answer this interview question: "${q.question}"? Please provide a structured, professional response.`;
                            window.open(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`, '_blank');
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#d97757] hover:bg-gray-50 rounded-xl text-sm font-medium transition-all hover:scale-105"
                        title="Ask Claude"
                    >
                        <img src={claudeLogo} alt="Claude" className="w-6 h-6 rounded-full" />
                        <span className="text-gray-700">Claude</span>
                    </button>

                    {/* Gemini */}
                    <button
                        onClick={() => {
                            const prompt = `How would you answer this interview question: "${q.question}"? Please provide a structured, professional response.`;
                            window.open(`https://gemini.google.com/?q=${encodeURIComponent(prompt)}`, '_blank');
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#4285f4] hover:bg-gray-50 rounded-xl text-sm font-medium transition-all hover:scale-105"
                        title="Ask Gemini"
                    >
                        <img src={geminiLogo} alt="Gemini" className="w-6 h-6 rounded-full" />
                        <span className="text-gray-700">Gemini</span>
                    </button>

                    {/* DeepSeek */}
                    <button
                        onClick={() => {
                            const prompt = `How would you answer this interview question: "${q.question}"? Please provide a structured, professional response.`;
                            window.open(`https://chat.deepseek.com/?q=${encodeURIComponent(prompt)}`, '_blank');
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#2d2d2d] hover:bg-gray-50 rounded-xl text-sm font-medium transition-all hover:scale-105"
                        title="Ask DeepSeek"
                    >
                        <img src={deepSeekLogo} alt="DeepSeek" className="w-6 h-6 rounded-full" />
                        <span className="text-gray-700">DeepSeek</span>
                    </button>
                </div>
            </div>
        ))}
    </div>
</div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
                <span>Report generated on {new Date().toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Powered by SCORVUE AI
                </span>
            </div>
        </div>
    );
};

export default SessionReview;