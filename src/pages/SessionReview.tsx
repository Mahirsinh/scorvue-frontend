// SessionReview.tsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionById } from "../features/session/sessionSlice";
import type { Question } from "../types/session";
import { motion } from "framer-motion";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { toast } from "react-toastify";
import SessionReviewStats from "../components/SessionReviewStats";
import FeedbackItem from "../components/FeedbackItem";
import chatGPTLogo from "../assets/chatgpt.png";
import claudeLogo from "../assets/claude.png";
import geminiLogo from "../assets/gemini.png";
import deepSeekLogo from "../assets/deepseek.png";
import { formatDuration } from "../utils/formatters";
import {
  ArrowLeftIcon,
  ClockIcon,
  PrinterIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ============================================================
// HELPERS - shared with Review.tsx design system
// ============================================================

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
};

const getVerdictFromScore = (score: number) => {
  if (score >= 85) return { label: "Strong Hire", cls: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  if (score >= 70) return { label: "Hire", cls: "text-blue-600 bg-blue-50 border-blue-200" };
  if (score >= 50) return { label: "Lean Hire", cls: "text-amber-600 bg-amber-50 border-amber-200" };
  return { label: "Needs Improvement", cls: "text-orange-600 bg-orange-50 border-orange-200" };
};

const SessionReview = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { activeSession, isLoading } = useSelector((state: RootState) => state.session);

  useEffect(() => {
    if (sessionId) {
      dispatch(getSessionById(sessionId));
    }
  }, [sessionId, dispatch]);

  // ============================================================
  // Loading state - matches Review.tsx spinner pattern
  // ============================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <DocumentTextIcon className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Your Report</h3>
          <p className="text-gray-500 text-sm">Fetching your session results...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Not-ready state - matches Review.tsx error card pattern
  // ============================================================
  if (!activeSession || activeSession.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClockIcon className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Assessment In Progress</h3>
          <p className="text-gray-500 text-sm mb-6">
            Our AI is still synthesizing your performance data. Please check back in a few moments.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { overallScore, metrics, role, level, questions, startTime, endTime, company } = activeSession;
  const finalMetrics = metrics || {};
  const score = overallScore || 0;
  const verdict = getVerdictFromScore(score);

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

  const handleLinkedInShare = () => {
    const shareText = `🎯 I just completed my ${role} interview assessment on SCORVUE!

📊 My Results:
• Overall Score: ${score}%
• Role: ${role} (${level})
• Questions Answered: ${questions?.length || 0}
• Company: ${company || 'General'}

Ready to ace your next interview? Try SCORVUE today! 🚀`;

    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const handlePrint = () => window.print();

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Interview Session Report',
          text: 'Check out my interview session report!',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleDownload = () => {
    const report = {
      sessionId,
      role,
      level,
      company,
      overallScore: score,
      metrics: finalMetrics,
      questions,
      startTime,
      endTime,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-review-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const askAI = (question: string, urlBuilder: (prompt: string) => string) => {
    const prompt = `How would you answer this interview question: "${question}"? Please provide a structured, professional response.`;
    window.open(urlBuilder(prompt), '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 print:bg-white">
      {/* ============================================================
          HEADER BAR - matches Review.tsx sticky header pattern
          ============================================================ */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm print:shadow-none print:border-b print:static">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group print:hidden"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handleLinkedInShare}
                className="p-2 text-[#0A66C2] hover:text-white hover:bg-[#0A66C2] rounded-lg transition-all border border-[#0A66C2]/20 hover:border-[#0A66C2]"
                title="Share on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button
                onClick={handlePrint}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                title="Print review"
              >
                <PrinterIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                title="Share review"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                title="Download report"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:py-4">
        {/* ============================================================
            HEADER SECTION - matches Review.tsx title + verdict pattern
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 print:mb-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Session Report</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {formatDuration(startTime, endTime)}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <BriefcaseIcon className="w-4 h-4" />
                  {role} • {level}
                </span>
                {company && company !== 'general' && (
                  <>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      {company}
                    </span>
                  </>
                )}
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">
                  ID: {sessionId?.slice(-8)}
                </span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full border ${verdict.cls} font-semibold text-sm flex items-center gap-2`}>
              <ShieldCheckIcon className="w-4 h-4" />
              {verdict.label}
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            EXECUTIVE SUMMARY CARD - matches Review.tsx gradient banner
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white print:bg-blue-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <h2 className="text-sm font-medium text-blue-100 uppercase tracking-wider">Overall Score</h2>
              <p className="text-white font-bold text-4xl mt-1">{score}%</p>
            </div>
            <div className="border-l border-white/20 pl-4">
              <p className="text-sm font-medium text-blue-100 uppercase tracking-wider">Technical Avg</p>
              <p className="text-white font-semibold text-lg">{finalMetrics.avgTechnical || 0}%</p>
            </div>
            <div className="border-l border-white/20 pl-4">
              <p className="text-sm font-medium text-blue-100 uppercase tracking-wider">Confidence Avg</p>
              <p className="text-white font-semibold text-lg">{finalMetrics.avgConfidence || 0}%</p>
            </div>
          </div>
        </motion.div>

        {/* Quick stats - reuses your existing stats component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <SessionReviewStats
            overallScore={score}
            avgTechnical={finalMetrics.avgTechnical || 0}
            avgConfidence={finalMetrics.avgConfidence || 0}
            duration={formatDuration(startTime, endTime)}
          />
        </motion.div>

        {/* ============================================================
            CHART SECTION - kept, restyled to match card pattern
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Mastery Calibration</h2>
            <span className="text-xs text-gray-400">Technical score per question</span>
            <div className="ml-auto flex items-center gap-3 text-[10px] font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-gray-500">&ge;80</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-gray-500">&ge;60</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-gray-500">&ge;40</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-gray-500">&lt;40</span>
              </span>
            </div>
          </div>

          <div className="relative w-full">
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
        </motion.div>

        {/* ============================================================
            QUESTION-BY-QUESTION - matches Review.tsx card + Ask AI row
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Question Narrative</h2>
            <span className="text-xs text-gray-400 ml-auto">{questions?.length || 0} questions</span>
          </div>

          <div className="space-y-4">
            {(questions || []).map((q: Question, index: number) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors"
              >
                <FeedbackItem question={q} index={index} />

                <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium mr-1">Ask AI:</span>

                  <button
                    onClick={() => askAI(q.question, (p) => `https://chat.openai.com/?q=${encodeURIComponent(p)}`)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#10a37f] hover:bg-gray-50 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    title="Ask ChatGPT"
                  >
                    <img src={chatGPTLogo} alt="ChatGPT" className="w-6 h-6 rounded-full" />
                    <span className="text-gray-700">ChatGPT</span>
                  </button>

                  <button
                    onClick={() => askAI(q.question, (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#d97757] hover:bg-gray-50 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    title="Ask Claude"
                  >
                    <img src={claudeLogo} alt="Claude" className="w-6 h-6 rounded-full" />
                    <span className="text-gray-700">Claude</span>
                  </button>

                  <button
                    onClick={() => askAI(q.question, (p) => `https://gemini.google.com/?q=${encodeURIComponent(p)}`)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#4285f4] hover:bg-gray-50 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    title="Ask Gemini"
                  >
                    <img src={geminiLogo} alt="Gemini" className="w-6 h-6 rounded-full" />
                    <span className="text-gray-700">Gemini</span>
                  </button>

                  <button
                    onClick={() => askAI(q.question, (p) => `https://chat.deepseek.com/?q=${encodeURIComponent(p)}`)}
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
        </motion.div>

        {/* ============================================================
            FOOTER - matches Review.tsx footer pattern
            ============================================================ */}
        <div className="mt-6 text-center text-xs text-gray-400 print:mt-4">
          <p>Report generated on {new Date().toLocaleString()}</p>
          <p>{questions?.length || 0} questions analyzed • Powered by SCORVUE AI</p>
        </div>
      </div>
    </div>
  );
};

export default SessionReview;
