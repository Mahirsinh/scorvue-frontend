// pages/History.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
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
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const History = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVerdict, setFilterVerdict] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_URL}/review`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const sorted = response.data.data.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setInterviews(sorted);
        setFilteredInterviews(sorted);
      } else {
        setError("Failed to load interview history");
      }
    } catch (err: any) {
      console.error("Error fetching interview history:", err);
      if (err.response?.status === 404) {
        setInterviews([]);
        setFilteredInterviews([]);
      } else {
        setError(err.response?.data?.message || "Failed to load interview history");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter and search
  useEffect(() => {
    let result = interviews;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.preferenceId?.role?.toLowerCase().includes(term) ||
        item.analysis?.overall_assessment?.verdict?.toLowerCase().includes(term) ||
        item.sessionId?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter(item => item.status === filterStatus);
    }

    // Verdict filter
    if (filterVerdict !== "all") {
      result = result.filter(item => 
        item.analysis?.overall_assessment?.verdict === filterVerdict
      );
    }

    setFilteredInterviews(result);
  }, [searchTerm, filterStatus, filterVerdict, interviews]);

  const handleViewReview = (sessionId: string) => {
    navigate(`/review/${sessionId}`);
  };

  const handleDeleteReview = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this interview review?")) return;

    try {
      await axios.delete(
        `${API_URL}/review/${sessionId}`,
        { withCredentials: true }
      );
      toast.success("Review deleted successfully");
      setInterviews(prev => prev.filter(item => item.sessionId !== sessionId));
      setFilteredInterviews(prev => prev.filter(item => item.sessionId !== sessionId));
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

  const getVerdictOptions = () => {
    const verdicts = new Set<string>();
    interviews.forEach(item => {
      if (item.analysis?.overall_assessment?.verdict) {
        verdicts.add(item.analysis.overall_assessment.verdict);
      }
    });
    return Array.from(verdicts);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterVerdict("all");
  };

  // Stats
  const totalInterviews = interviews.length;
  const completedCount = interviews.filter(i => i.status === "completed").length;
  const avgScore = interviews.length > 0 
    ? Math.round(interviews.reduce((acc, i) => acc + (i.analysis?.scores?.overall?.score || 0), 0) / interviews.length)
    : 0;

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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading History</h3>
          <p className="text-gray-500 text-sm">Fetching your interview history...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load History</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview History</h1>
                <p className="text-sm text-gray-500">View all your past interview reviews</p>
              </div>
            </div>
            <button
              onClick={fetchHistory}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all duration-200 border border-blue-200"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalInterviews}</p>
            <p className="text-xs text-gray-500">Total Interviews</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
            <p className="text-xs text-gray-500">Average Score</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{filteredInterviews.length}</p>
            <p className="text-xs text-gray-500">Filtered Results</p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-gray-200 p-4 mb-6"
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by role, verdict, or session ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
              {(filterStatus !== "all" || filterVerdict !== "all") && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            {/* Clear Filters */}
            {(searchTerm || filterStatus !== "all" || filterVerdict !== "all") && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4"
            >
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Verdict</label>
                <select
                  value={filterVerdict}
                  onChange={(e) => setFilterVerdict(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">All Verdicts</option>
                  {getVerdictOptions().map(verdict => (
                    <option key={verdict} value={verdict}>{verdict}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Interview List */}
        {filteredInterviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-12 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No interviews found</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || filterStatus !== "all" || filterVerdict !== "all"
                ? "Try adjusting your filters or search terms"
                : "Complete your first live interview to see results here"}
            </p>
            {!searchTerm && filterStatus === "all" && filterVerdict === "all" && (
              <button
                onClick={() => navigate('/live-interview/preferences')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Start Your First Interview
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredInterviews.map((interview, index) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleViewReview(interview.sessionId)}
                className="group p-4 bg-white hover:bg-blue-50/50 rounded-xl border border-gray-200 hover:border-blue-200 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left side - Interview Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Verdict Badge */}
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getVerdictBadge(interview.analysis?.overall_assessment?.verdict || "Analysis Pending")}`}>
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
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          #{interview.sessionId.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
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
                        {interview.metadata?.report_type && (
                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                            {interview.metadata.report_type}
                          </span>
                        )}
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
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Showing {filteredInterviews.length} of {interviews.length} interviews</p>
        </div>
      </div>
    </div>
  );
};

export default History;