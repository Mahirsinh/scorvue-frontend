// pages/Review.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import chatGPTLogo from "../assets/chatgpt.png";
import claudeLogo from "../assets/claude.png";
import geminiLogo from "../assets/gemini.png";
import deepSeekLogo from "../assets/deepseek.png";

import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  XCircleIcon,
  LightBulbIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  PrinterIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  BriefcaseIcon,
  CurrencyRupeeIcon,
  StarIcon,
  SignalIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import { interviewApi } from "../services/interviewApi";
import axios from "axios";

// Allow referencing window.LinkedIn without TS error
declare global {
  interface Window {
    LinkedIn?: any;
  }
}

// ============================================================
// TYPES - Enhanced for Premium Review with Authenticity
// ============================================================

interface ScoreCategory {
  score: number;
  evidence: string[];
  detailed_feedback?: string;
}

interface PremiumScores {
  technical_skills: ScoreCategory;
  communication_clarity: ScoreCategory;
  confidence_presence: ScoreCategory;
  problem_solving: ScoreCategory;
  cultural_fit: ScoreCategory;
  behavioral: ScoreCategory;
  response_quality: ScoreCategory;
  overall: ScoreCategory;
}

interface Strength {
  category: string;
  description: string;
  evidence: string;
  impact?: string;
}

interface AreaForImprovement {
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  description: string;
  evidence: string;
  suggestion: string;
  resources?: string[];
}

interface QuestionAnalysis {
  question_number: number;
  question_category: string;
  question: string;
  candidate_answer: string;
  quality: "Excellent" | "Good" | "Average" | "Poor";
  score: number;
  feedback: string;
  improvement_hint: string;
}

interface OverallAssessment {
  summary: string;
  verdict: "Strong Hire" | "Hire" | "Lean Hire" | "No Hire" | "Strong No Hire" | "Analysis Pending";
  hire_recommendation: string;
  estimated_band: string;
  salary_benchmark: string;
  overall_rating: number;
  recommendation: string;
}

interface ActionableRecommendations {
  immediate_actions: string[];
  short_term: string[];
  long_term: string[];
}

interface InterviewMetrics {
  total_speaking_time: string;
  average_response_length: string;
  filler_words_detected: string[];
  confidence_pattern: string;
  clarity_rating: string;
}

interface ComparativeAnalysis {
  against_peers: string;
  against_role_requirements: string;
  potential_rating: string;
}

// ✅ NEW: Authenticity Types
interface AuthenticityData {
  authenticity_score: number;
  risk_level: "Low" | "Medium" | "High" | "Critical" | "Unknown";
  indicators: string[];
  verdict: string;
  detailed_analysis?: {
    marker_detection?: { score: number; description: string };
    formality_analysis?: { score: number; description: string };
    structure_analysis?: { score: number; description: string };
    vocabulary_analysis?: { score: number; description: string };
    consistency_analysis?: { score: number; description: string };
    naturalness_score?: { score: number; description: string };
    response_variance?: { score: number; description: string };
  };
  candidate_responses_analyzed: number;
  analysis_timestamp: string;
}

interface ReviewData {
  _id: string;
  sessionId: string;
  status: "pending" | "processing" | "completed" | "failed";
  analysis: {
    overall_assessment: OverallAssessment;
    scores: PremiumScores;
    strengths: Strength[];
    areas_for_improvement: AreaForImprovement[];
    question_by_question_analysis: QuestionAnalysis[];
    key_insights: string[];
    actionable_recommendations: ActionableRecommendations;
    interview_metrics: InterviewMetrics;
    comparative_analysis: ComparativeAnalysis;
  };
  metadata: {
    analyzed_at: string;
    total_messages: number;
    analysis_version: string;
    report_type: string;
    error?: string;
  };
  // ✅ NEW: Authenticity fields
  authenticity?: AuthenticityData;
  authenticity_score?: number;
  authenticity_risk_level?: string;
  authenticity_verdict?: string;
  authenticity_indicators?: string[];
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MAX_POLLS = 30;
const POLL_INTERVAL_MS = 3000;

// ============================================================
// HELPERS
// ============================================================

const getVerdictColor = (verdict: string) => {
  switch (verdict) {
    case "Strong Hire":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "Hire":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "Lean Hire":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "No Hire":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "Strong No Hire":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "bg-red-100 text-red-700 border-red-200";
    case "High":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Medium":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Low":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getQualityColor = (quality: string) => {
  switch (quality) {
    case "Excellent":
      return "bg-emerald-100 text-emerald-700";
    case "Good":
      return "bg-blue-100 text-blue-700";
    case "Average":
      return "bg-amber-100 text-amber-700";
    case "Poor":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

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

// ✅ NEW: Authenticity helpers
const getAuthenticityColor = (score: number) => {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
  if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
};

const getAuthenticityRiskIcon = (riskLevel: string) => {
  switch (riskLevel) {
    case "Low":
      return <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />;
    case "Medium":
      return <ShieldExclamationIcon className="w-5 h-5 text-blue-500" />;
    case "High":
      return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
    case "Critical":
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    default:
      return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getAuthenticityRiskLabel = (riskLevel: string) => {
  switch (riskLevel) {
    case "Low": return "Authentic";
    case "Medium": return "Moderately Authentic";
    case "High": return "Suspicious";
    case "Critical": return "Critical";
    default: return "Unknown";
  }
};

// ============================================================
// COMPONENTS
// ============================================================

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? "text-yellow-400 fill-yellow-400"
              : i === fullStars && hasHalfStar
              ? "text-yellow-400 fill-yellow-400/50"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-xs font-medium text-gray-500 ml-1">({rating.toFixed(1)})</span>
    </div>
  );
};

// Score Ring Component
const ScoreRing = ({ score, label, size = "md" }: { score: number; label: string; size?: "sm" | "md" | "lg" }) => {
  const radius = size === "sm" ? 30 : size === "lg" ? 50 : 40;
  const strokeWidth = size === "sm" ? 5 : size === "lg" ? 7 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#10b981";
    if (s >= 60) return "#3b82f6";
    if (s >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${radius * 2 + strokeWidth * 2} ${radius * 2 + strokeWidth * 2}`}>
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-2xl text-gray-800`}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500 mt-1 text-center">{label}</span>
    </div>
  );
};

// Premium Score Bar Component
const PremiumScoreBar = ({ score, label, evidence, detailedFeedback }: { score: number; label: string; evidence: string[]; detailedFeedback?: string }) => {
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'} ${score}%, #e5e7eb ${score}%)`,
          }}
        />
      </div>
      {detailedFeedback && (
        <p className="text-xs text-gray-500 mt-1">{detailedFeedback}</p>
      )}
      {evidence.length > 0 && (
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="text-xs text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1"
        >
          <InformationCircleIcon className="w-3 h-3" />
          {showEvidence ? "Hide evidence" : "Show evidence"}
        </button>
      )}
      {showEvidence && evidence.length > 0 && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-medium text-blue-700 mb-1">Evidence from interview:</p>
          <ul className="text-xs text-blue-600 space-y-1">
            {evidence.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-blue-400">•</span>
                <span>"{item}"</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const Review = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [preference, setPreference] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCountDisplay, setPollCountDisplay] = useState(0);

  const pollCountRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const stoppedRef = useRef(false);

  const stopPolling = useCallback(() => {
    stoppedRef.current = true;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchReviewData = useCallback(async () => {
    if (!sessionId || stoppedRef.current) return;

    try {
      const statusResponse = await axios.get(
        `${API_URL}/review/${sessionId}/status`,
        { withCredentials: true }
      );

      const { exists, status, isReady } = statusResponse.data.data;

      if (!exists || (!isReady && status === "processing")) {
        pollCountRef.current += 1;
        setPollCountDisplay(pollCountRef.current);

        if (pollCountRef.current >= MAX_POLLS) {
          setError("Review is taking longer than expected. Please refresh the page.");
          setLoading(false);
          stopPolling();
        }
        return;
      }

      const reviewResponse = await axios.get(
        `${API_URL}/review/${sessionId}`,
        { withCredentials: true }
      );

      if (reviewResponse.data.success) {
        setReviewData(reviewResponse.data.data);
        setLoading(false);

        try {
          const prefResponse = await interviewApi.getPreference(sessionId);
          setPreference(prefResponse.data);
        } catch (err) {
          console.error("Failed to fetch preference:", err);
        }
      } else {
        setError("Failed to load review data");
        setLoading(false);
      }

      stopPolling();

    } catch (err: any) {
      console.error("Error fetching review:", err);

      // ✅ NEW: free plan limit reached
      if (err.response?.data?.error?.code === "UPGRADE_REQUIRED") {
        toast.warning(err.response.data.error.message || "You've used your free interview report.");
        stopPolling();
        navigate("/plans");
        return;
      }

      if (err.response?.status === 404) {
        pollCountRef.current += 1;
        setPollCountDisplay(pollCountRef.current);

        if (pollCountRef.current >= MAX_POLLS) {
          setError("Review not found. The interview may still be processing.");
          setLoading(false);
          stopPolling();
        }
        return;
      }

      if (err.response?.status === 429) {
        setError("Too many requests — please wait a moment and refresh.");
        setLoading(false);
        stopPolling();
        return;
      }

      setError(err.response?.data?.message || "Failed to load review");
      setLoading(false);
      stopPolling();
    }
  }, [sessionId, stopPolling]);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    stoppedRef.current = false;
    pollCountRef.current = 0;
    setPollCountDisplay(0);
    setLoading(true);
    setError(null);
    setReviewData(null);

    fetchReviewData();

    intervalRef.current = window.setInterval(() => {
      if (pollCountRef.current >= MAX_POLLS) {
        stopPolling();
        setError("Review generation timed out. Please try again later.");
        setLoading(false);
        return;
      }
      fetchReviewData();
    }, POLL_INTERVAL_MS);

    return () => {
      stopPolling();
    };
  }, [sessionId]);

  useEffect(() => {
    const socket = (window as any).socket;
    if (!socket) return;

    const handleReviewReady = (data: { sessionId: string; reviewId: string }) => {
      if (data.sessionId === sessionId) {
        fetchReviewData();
      }
    };
    socket.on('review:ready', handleReviewReady);
    return () => {
      socket.off('review:ready', handleReviewReady);
    };
  }, [sessionId, fetchReviewData]);

  const handlePrint = () => window.print();

  const handleLinkedInShare = async () => {
    if (!reviewData) return;

    const overall_assessment = reviewData.analysis.overall_assessment;
    const strengths = reviewData.analysis.strengths;
    const areas_for_improvement = reviewData.analysis.areas_for_improvement;
    
    // Calculate average score
    const scores = reviewData.analysis.scores;
    const allScores = [
      scores.technical_skills.score,
      scores.communication_clarity.score,
      scores.confidence_presence.score,
      scores.problem_solving.score,
      scores.cultural_fit?.score || 0,
      scores.behavioral?.score || 0,
      scores.response_quality?.score || 0,
    ].filter(s => s > 0);
    const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    // ✅ Add authenticity to share text
    const authenticityScore = reviewData.authenticity_score || 0;
    const authenticityRisk = reviewData.authenticity_risk_level || 'Unknown';

    const shareText = `🎯 I just completed my ${preference?.role || 'interview'} assessment on SCORVUE!

📊 My Results:
• Overall Score: ${avgScore}%
• Verdict: ${overall_assessment.verdict}
• Top Strengths: ${strengths.slice(0, 2).map(s => s.category).join(', ')}
• Areas to Improve: ${areas_for_improvement.slice(0, 2).map(a => a.category).join(', ')}
• Authenticity Score: ${authenticityScore}/100 ${authenticityRisk !== 'Unknown' ? `(${authenticityRisk} Risk)` : ''}

Ready to ace your next interview? Try SCORVUE today! 🚀`;

    try {
      // Try to use LinkedIn's native share (works on mobile/desktop)
      if (window.LinkedIn) {
        window.LinkedIn.share({
          url: window.location.href,
          text: shareText,
        }, (response: any) => {
          if (response.success) {
            toast.success('Successfully shared on LinkedIn!');
          } else {
            manualLinkedInShare(shareText);
          }
        });
      } else {
        manualLinkedInShare(shareText);
      }
    } catch (error) {
      console.error('LinkedIn share error:', error);
      manualLinkedInShare(shareText);
    }
  };

  // Manual share fallback
  const manualLinkedInShare = (text: string) => {
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Interview Review',
          text: 'Check out my interview review!',
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
    if (!reviewData) return;
    const report = {
      sessionId: reviewData.sessionId,
      date: new Date(reviewData.createdAt).toLocaleDateString(),
      analysis: reviewData.analysis,
      metadata: reviewData.metadata,
      authenticity: reviewData.authenticity,
      authenticity_score: reviewData.authenticity_score,
      authenticity_risk_level: reviewData.authenticity_risk_level,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-review-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRetry = () => {
    stoppedRef.current = false;
    pollCountRef.current = 0;
    setPollCountDisplay(0);
    setError(null);
    setLoading(true);
    fetchReviewData();
    if (intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        if (pollCountRef.current >= MAX_POLLS) {
          stopPolling();
          setError("Review generation timed out. Please try again later.");
          setLoading(false);
          return;
        }
        fetchReviewData();
      }, POLL_INTERVAL_MS);
    }
  };

  // Loading State
  if (loading) {
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Interview</h3>
          <p className="text-gray-500 text-sm mb-4">
            {pollCountDisplay === 0
              ? "Preparing your comprehensive interview review..."
              : `Processing your interview... (${Math.min(pollCountDisplay, MAX_POLLS)}/${MAX_POLLS})`}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((pollCountDisplay / MAX_POLLS) * 100, 90)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-3">This usually takes 30-60 seconds</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !reviewData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Review</h3>
          <p className="text-gray-500 text-sm mb-6">{error || "Review data not found"}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { analysis, metadata } = reviewData;
  const {
    overall_assessment,
    scores,
    strengths,
    areas_for_improvement,
    question_by_question_analysis,
    key_insights,
    actionable_recommendations,
    interview_metrics,
    comparative_analysis
  } = analysis;

  // ✅ Get authenticity data
  const authenticityScore = reviewData.authenticity_score || reviewData.authenticity?.authenticity_score || 0;
  const authenticityRisk = reviewData.authenticity_risk_level || reviewData.authenticity?.risk_level || 'Unknown';
  const authenticityVerdict = reviewData.authenticity_verdict || reviewData.authenticity?.verdict || 'Not analyzed';
  const authenticityIndicators = reviewData.authenticity_indicators || reviewData.authenticity?.indicators || [];

  const verdictColor = getVerdictColor(overall_assessment.verdict);

  // Calculate average of all 7 scores
  const allScores = [
    scores.technical_skills.score,
    scores.communication_clarity.score,
    scores.confidence_presence.score,
    scores.problem_solving.score,
    scores.cultural_fit?.score || 0,
    scores.behavioral?.score || 0,
    scores.response_quality?.score || 0,
  ].filter(s => s > 0);
  
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  // Get top 3 strengths
  const topStrengths = strengths.slice(0, 3);

  // Get critical improvements
  const criticalImprovements = areas_for_improvement.filter(a => a.priority === "Critical" || a.priority === "High");

  return (
    <div className="min-h-screen bg-gray-50 pb-12 print:bg-white">
      {/* Header - Print friendly */}
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
            HEADER SECTION
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 print:mb-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Review Report</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {new Date(reviewData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  {metadata.total_messages} exchanges
                </span>
                {preference && (
                  <>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <BriefcaseIcon className="w-4 h-4" />
                      {preference.role}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500 capitalize">
                      {preference.difficulty}
                    </span>
                  </>
                )}
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <SignalIcon className="w-4 h-4" />
                  Premium Analysis v{metadata.analysis_version}
                </span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full border ${verdictColor} font-semibold text-sm flex items-center gap-2`}>
              <ShieldCheckIcon className="w-4 h-4" />
              {overall_assessment.verdict}
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            ✅ NEW: AUTHENTICITY BANNER
            ============================================================ */}
        {authenticityScore > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className={`rounded-2xl p-6 mb-6 border-2 ${getAuthenticityColor(authenticityScore)}`}
          >
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center">
                  {getAuthenticityRiskIcon(authenticityRisk)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">Response Authenticity Analysis</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getAuthenticityColor(authenticityScore)}`}>
                    {authenticityScore}/100
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getAuthenticityColor(authenticityScore)}`}>
                    {getAuthenticityRiskLabel(authenticityRisk)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{authenticityVerdict}</p>
                {authenticityIndicators.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500">Indicators:</p>
                    <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                      {authenticityIndicators.map((indicator, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-gray-400">•</span>
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Analyzed {reviewData.authenticity?.candidate_responses_analyzed || 0} responses
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            EXECUTIVE SUMMARY CARD
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white print:bg-blue-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <h2 className="text-sm font-medium text-blue-100 uppercase tracking-wider">Executive Summary</h2>
              <p className="text-white/90 text-sm mt-1 leading-relaxed">{overall_assessment.summary}</p>
            </div>
            <div className="border-l border-white/20 pl-4">
              <p className="text-sm font-medium text-blue-100 uppercase tracking-wider">Recommendation</p>
              <p className="text-white font-semibold text-lg">{overall_assessment.hire_recommendation || "Not Specified"}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-blue-100 text-xs">Rating:</span>
                <StarRating rating={overall_assessment.overall_rating || 0} />
              </div>
            </div>
            <div className="border-l border-white/20 pl-4">
              <p className="text-sm font-medium text-blue-100 uppercase tracking-wider">Estimated Band</p>
              <p className="text-white font-semibold text-lg">{overall_assessment.estimated_band || "Not Assessed"}</p>
              <p className="text-blue-100 text-sm flex items-center gap-1 mt-1">
                <CurrencyRupeeIcon className="w-4 h-4" />
                {overall_assessment.salary_benchmark || "Not Assessed"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            QUICK STATS ROW - Updated with Authenticity
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
            <p className="text-xs text-gray-500">Overall Score</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{overall_assessment.overall_rating?.toFixed(1) || "—"}</p>
            <p className="text-xs text-gray-500">Star Rating</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{interview_metrics.total_speaking_time || "—"}</p>
            <p className="text-xs text-gray-500">Speaking Time</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{comparative_analysis.potential_rating || "—"}</p>
            <p className="text-xs text-gray-500">Potential Rating</p>
          </div>
          {/* ✅ NEW: Authenticity Score */}
          {authenticityScore > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${getScoreColor(authenticityScore)}`}>{authenticityScore}%</p>
              <p className="text-xs text-gray-500">Authenticity</p>
            </div>
          )}
        </motion.div>

        {/* ============================================================
            SCORES SECTION - 8 Categories
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Comprehensive Score Dashboard</h2>
            <span className="text-xs text-gray-400 ml-auto">{Object.keys(scores).length} Categories</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Technical Skills</span>
                <span className={`text-sm font-bold ${getScoreColor(scores.technical_skills.score)}`}>
                  {scores.technical_skills.score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full rounded-full transition-all duration-1000 bg-blue-500" style={{ width: `${scores.technical_skills.score}%` }} />
              </div>
              {scores.technical_skills.detailed_feedback && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{scores.technical_skills.detailed_feedback}</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Communication</span>
                <span className={`text-sm font-bold ${getScoreColor(scores.communication_clarity.score)}`}>
                  {scores.communication_clarity.score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full rounded-full transition-all duration-1000 bg-blue-500" style={{ width: `${scores.communication_clarity.score}%` }} />
              </div>
              {scores.communication_clarity.detailed_feedback && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{scores.communication_clarity.detailed_feedback}</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Confidence</span>
                <span className={`text-sm font-bold ${getScoreColor(scores.confidence_presence.score)}`}>
                  {scores.confidence_presence.score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full rounded-full transition-all duration-1000 bg-blue-500" style={{ width: `${scores.confidence_presence.score}%` }} />
              </div>
              {scores.confidence_presence.detailed_feedback && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{scores.confidence_presence.detailed_feedback}</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Problem Solving</span>
                <span className={`text-sm font-bold ${getScoreColor(scores.problem_solving.score)}`}>
                  {scores.problem_solving.score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full rounded-full transition-all duration-1000 bg-blue-500" style={{ width: `${scores.problem_solving.score}%` }} />
              </div>
              {scores.problem_solving.detailed_feedback && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{scores.problem_solving.detailed_feedback}</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Cultural Fit</span>
                <span className={`text-sm font-bold ${getScoreColor(scores.cultural_fit?.score || 0)}`}>
                  {scores.cultural_fit?.score || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full rounded-full transition-all duration-1000 bg-blue-500" style={{ width: `${scores.cultural_fit?.score || 0}%` }} />
              </div>
              {scores.cultural_fit?.detailed_feedback && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{scores.cultural_fit.detailed_feedback}</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Behavioral</span>
                <span className={`text-sm font-bold ${getScoreColor(scores.behavioral?.score || 0)}`}>
                  {scores.behavioral?.score || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full rounded-full transition-all duration-1000 bg-blue-500" style={{ width: `${scores.behavioral?.score || 0}%` }} />
              </div>
              {scores.behavioral?.detailed_feedback && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{scores.behavioral.detailed_feedback}</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Response Quality</span>
                <span className={`text-sm font-bold ${getScoreColor(scores.response_quality?.score || 0)}`}>
                  {scores.response_quality?.score || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full rounded-full transition-all duration-1000 bg-blue-500" style={{ width: `${scores.response_quality?.score || 0}%` }} />
              </div>
              {scores.response_quality?.detailed_feedback && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{scores.response_quality.detailed_feedback}</p>
              )}
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall</span>
                <span className={`text-sm font-bold ${getScoreColor(scores.overall.score)}`}>
                  {scores.overall.score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-full rounded-full transition-all duration-1000 bg-indigo-500" style={{ width: `${scores.overall.score}%` }} />
              </div>
              {scores.overall.detailed_feedback && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{scores.overall.detailed_feedback}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            STRENGTHS SECTION
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <StarSolidIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Key Strengths</h2>
            <span className="text-xs text-gray-400 ml-auto">{strengths.length} identified</span>
          </div>

          {strengths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strengths.map((strength, idx) => (
                <div key={idx} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-emerald-200 rounded-lg mt-0.5">
                      <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{strength.category}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{strength.description}</p>
                      <div className="flex items-start gap-1 mt-2">
                        <span className="text-xs text-emerald-600 font-medium">Evidence:</span>
                        <span className="text-xs text-emerald-500 italic">"{strength.evidence}"</span>
                      </div>
                      {strength.impact && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Impact:</span> {strength.impact}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No strengths identified</p>
          )}
        </motion.div>

        {/* ============================================================
            AREAS FOR IMPROVEMENT
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Areas for Improvement</h2>
            <span className="text-xs text-gray-400 ml-auto">{areas_for_improvement.length} identified</span>
          </div>

          {areas_for_improvement.length > 0 ? (
            <div className="space-y-4">
              {areas_for_improvement.map((area, idx) => (
                <div key={idx} className="p-4 rounded-xl border bg-amber-50 border-amber-100">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800 text-sm">{area.category}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(area.priority)}`}>
                      {area.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{area.description}</p>
                  <div className="flex items-start gap-1 mb-2">
                    <span className="text-xs text-amber-600 font-medium">Evidence:</span>
                    <span className="text-xs text-amber-500 italic">"{area.evidence}"</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-xs text-blue-600 font-medium">Suggestion:</span>
                    <span className="text-xs text-blue-500">{area.suggestion}</span>
                  </div>
                  {area.resources && area.resources.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 font-medium">Resources:</span>
                      <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                        {area.resources.map((resource, i) => (
                          <li key={i}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No areas for improvement identified</p>
          )}
        </motion.div>

        {/* ============================================================
            QUESTION-BY-QUESTION ANALYSIS
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Question-by-Question Analysis</h2>
            <span className="text-xs text-gray-400 ml-auto">{question_by_question_analysis.length} questions</span>
          </div>

          {question_by_question_analysis.length > 0 ? (
            <div className="space-y-4">
              {question_by_question_analysis.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-400">Q{q.question_number}</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                        {q.question_category}
                      </span>
                      <h4 className="font-semibold text-gray-800 text-sm">{q.question}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getQualityColor(q.quality)}`}>
                        {q.quality}
                      </span>
                      <span className={`text-xs font-bold ${getScoreColor(q.score)}`}>{q.score}%</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Your answer:</span> {q.candidate_answer}
                  </p>
                  <p className="text-sm text-blue-600 mb-1">
                    <span className="font-medium">Feedback:</span> {q.feedback}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    <span className="font-medium">Improvement hint:</span> {q.improvement_hint}
                  </p>

                  {/* AI Assistant Buttons - No Background, Larger, with Border */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
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
          ) : (
            <p className="text-gray-500 text-sm">No question analysis available</p>
          )}
        </motion.div>

        {/* ============================================================
            KEY INSIGHTS & INTERVIEW METRICS
            ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Key Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <LightBulbIcon className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Key Insights</h2>
            </div>
            {key_insights.length > 0 ? (
              <ul className="space-y-2">
                {key_insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 border-b border-gray-50 pb-2 last:border-0">
                    <span className="text-purple-400 mt-0.5">▸</span>
                    {insight}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No key insights available</p>
            )}
          </motion.div>

          {/* Interview Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <SignalIcon className="w-5 h-5 text-cyan-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Interview Metrics</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-sm text-gray-600">Speaking Time</span>
                <span className="text-sm font-medium text-gray-900">{interview_metrics.total_speaking_time || "—"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-sm text-gray-600">Avg Response Length</span>
                <span className="text-sm font-medium text-gray-900">{interview_metrics.average_response_length || "—"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-sm text-gray-600">Confidence Pattern</span>
                <span className="text-sm font-medium text-gray-900">{interview_metrics.confidence_pattern || "—"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-sm text-gray-600">Clarity Rating</span>
                <span className="text-sm font-medium text-gray-900">{interview_metrics.clarity_rating || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Filler Words</span>
                <span className="text-sm font-medium text-gray-900">
                  {interview_metrics.filler_words_detected?.length > 0 
                    ? interview_metrics.filler_words_detected.join(", ")
                    : "None detected"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ============================================================
            COMPARATIVE ANALYSIS
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-50 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-teal-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Comparative Analysis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Against Peers</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{comparative_analysis.against_peers || "Not assessed"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Against Role Requirements</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{comparative_analysis.against_role_requirements || "Not assessed"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Potential Rating</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{comparative_analysis.potential_rating || "Not assessed"}</p>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            ACTIONABLE RECOMMENDATIONS
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-50 rounded-lg">
              <AcademicCapIcon className="w-5 h-5 text-teal-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Actionable Recommendations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Immediate Actions */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                Immediate Actions (24-48 hrs)
              </h4>
              {actionable_recommendations?.immediate_actions?.length > 0 ? (
                <ul className="space-y-1">
                  {actionable_recommendations.immediate_actions.map((action, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-red-400">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No immediate actions</p>
              )}
            </div>

            {/* Short Term */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full inline-block"></span>
                Short Term (1-2 weeks)
              </h4>
              {actionable_recommendations?.short_term?.length > 0 ? (
                <ul className="space-y-1">
                  {actionable_recommendations.short_term.map((action, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-amber-400">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No short-term actions</p>
              )}
            </div>

            {/* Long Term */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                Long Term (1-3 months)
              </h4>
              {actionable_recommendations?.long_term?.length > 0 ? (
                <ul className="space-y-1">
                  {actionable_recommendations.long_term.map((action, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-blue-400">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No long-term actions</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            FOOTER
            ============================================================ */}
        <div className="mt-6 text-center text-xs text-gray-400 print:mt-4">
          <p>Generated on {new Date(reviewData.createdAt).toLocaleString()}</p>
          <p>Analysis Version: {metadata.analysis_version} • {metadata.total_messages} exchanges analyzed • {metadata.report_type} report</p>
          {authenticityScore > 0 && (
            <p className="mt-1">Authenticity Check: {authenticityScore}/100 • Risk: {authenticityRisk}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;