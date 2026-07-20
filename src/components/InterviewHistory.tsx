// components/InterviewHistory.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid,
  SparklesIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import axios from "axios";
import { interviewApi } from "../services/interviewApi";

interface InterviewHistoryItem {
  _id: string;
  sessionId: string;
  status: "pending" | "processing" | "completed" | "failed";
  analysis: {
    overall_assessment: {
      verdict: string;
      overall_rating: number;
    };
    scores: {
      overall: {
        score: number;
      };
    };
  };
  metadata: {
    total_messages: number;
    report_type: string;
  };
  createdAt: string;
  preferenceId?: {
    role: string;
    difficulty: string;
    duration: number;
  };
}

interface InterviewHistoryProps {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const InterviewHistory = ({ limit = 5, showViewAll = true, className = "" }: InterviewHistoryProps) => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_URL}/review`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Sort by createdAt descending (newest first)
        const sorted = response.data.data.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setInterviews(sorted.slice(0, limit));
      } else {
        setError("Failed to load interview history");
      }
    } catch (err: any) {
      console.error("Error fetching interview history:", err);
      if (err.response?.status === 404) {
        setInterviews([]);
      } else {
        setError(err.response?.data?.message || "Failed to load interview history");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [limit]);

  const handleViewReview = (sessionId: string) => {
    navigate(`/review-interview/${sessionId}`);
  };

  const handleDeleteReview = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this interview review?")) return;

    try {
      await axios.delete(
        `${API_URL}/review-interview/${sessionId}`,
        { withCredentials: true }
      );
      toast.success("Review deleted successfully");
      setInterviews(prev => prev.filter(item => item.sessionId !== sessionId));
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const getVerdictBadge = (verdict: string) => {
    const colors = {
      "Strong Hire": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Hire": "bg-blue-100 text-blue-700 border-blue-200",
      "Lean Hire": "bg-amber-100 text-amber-700 border-amber-200",
      "No Hire": "bg-orange-100 text-orange-700 border-orange-200",
      "Strong No Hire": "bg-red-100 text-red-700 border-red-200",
      "Analysis Pending": "bg-gray-100 text-gray-600 border-gray-200",
    };
    return colors[verdict as keyof typeof colors] || colors["Analysis Pending"];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
      case "failed":
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case "processing":
        return <ArrowPathIcon className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <ClockIconSolid className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Loading State
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            Interview History
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            Interview History
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (interviews.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            Interview History
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AcademicCapIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-gray-700 font-medium mb-1">No interviews yet</h3>
          <p className="text-gray-400 text-sm">Complete your first live interview to see results here</p>
          <button
            onClick={() => navigate('/live-interview/preferences')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Start Your First Interview
          </button>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
          Interview History
          <span className="text-xs text-gray-400 font-normal ml-2">
            ({interviews.length} {interviews.length === 1 ? 'interview' : 'interviews'})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          {showViewAll && interviews.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All
              <ChevronRightIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Interview List */}
      <div className="space-y-3">
        <AnimatePresence>
          {interviews.map((interview, index) => (
            <motion.div
              key={interview._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleViewReview(interview.sessionId)}
              className="group p-4 bg-gray-50 hover:bg-blue-50/50 rounded-xl border border-gray-100 hover:border-blue-200 cursor-pointer transition-all duration-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left side - Interview Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Verdict Badge */}
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getVerdictBadge(interview.analysis?.overall_assessment?.verdict || "Analysis Pending")}`}>
                    {interview.analysis?.overall_assessment?.verdict || "Pending"}
                  </div>

                  {/* Role & Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {interview.preferenceId?.role || "Interview"}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {interview.preferenceId?.difficulty || "Medium"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {formatDate(interview.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChatBubbleLeftRightIcon className="w-3 h-3" />
                        {interview.metadata?.total_messages || 0} exchanges
                      </span>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(interview.status)}
                        <span className="capitalize">{interview.status}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Score & Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Score */}
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getScoreColor(interview.analysis?.scores?.overall?.score || 0)}`}>
                      {interview.analysis?.scores?.overall?.score || 0}%
                    </span>
                    <p className="text-[10px] text-gray-400">Overall Score</p>
                  </div>

                  {/* Star Rating */}
                  {interview.analysis?.overall_assessment?.overall_rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(interview.analysis?.overall_assessment?.overall_rating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}

                  {/* View & Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReview(interview.sessionId);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Review"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteReview(interview.sessionId, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Review"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View All Button at Bottom (if not shown at top) */}
      {!showViewAll && interviews.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
          >
            View All Interviews
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;