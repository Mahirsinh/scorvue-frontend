// pages/Cheating.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  HomeIcon,
  ArrowPathIcon,
  ShieldExclamationIcon,
  EyeSlashIcon,
  UserIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

interface CheatingState {
  from?: string;
  sessionId?: string;
  reason?: string;
  timestamp?: string;
}

const Cheating = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheatingState;

  const reason = state?.reason || "Suspicious activity detected";
  const sessionId = state?.sessionId || "Unknown";
  const from = state?.from || "interview";
  const timestamp = state?.timestamp || new Date().toLocaleString();

  // Clear the browser history to prevent going back
  useEffect(() => {
    // Replace the current history entry so back button goes to home
    window.history.replaceState(null, "", "/cheating");
    
    // Optional: Clear all history (more aggressive)
    // This prevents the user from using the back button to go back to the interview
    const clearHistory = () => {
      // Push a new state to prevent going back
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", function(event) {
        // If user tries to go back, redirect to home
        navigate("/", { replace: true });
      });
    };
    
    clearHistory();

    // Cleanup
    return () => {
      window.removeEventListener("popstate", () => {});
    };
  }, [navigate]);

  // Force fullscreen exit (if in fullscreen)
  useEffect(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleGoHome = () => {
    // Replace the current history with home
    navigate("/", { replace: true });
  };

  const handleRetry = () => {
    // Clear any interview session data
    sessionStorage.removeItem("interviewSessionId");
    sessionStorage.removeItem("interviewStartTime");
    
    // Navigate to preferences with replace
    navigate("/live-interview/preferences", { replace: true });
  };

  // Get icon based on reason
  const getReasonIcon = () => {
    if (reason.toLowerCase().includes("tab") || reason.toLowerCase().includes("switch")) {
      return <ExclamationTriangleIcon className="w-20 h-20 text-yellow-500" />;
    } else if (reason.toLowerCase().includes("focus") || reason.toLowerCase().includes("blur")) {
      return <EyeSlashIcon className="w-20 h-20 text-red-500" />;
    } else if (reason.toLowerCase().includes("camera") || reason.toLowerCase().includes("face")) {
      return <UserIcon className="w-20 h-20 text-orange-500" />;
    }
    return <ShieldExclamationIcon className="w-20 h-20 text-red-500" />;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #EF4444 0%, transparent 50%),
                           radial-gradient(circle at 80% 50%, #EF4444 0%, transparent 50%)`,
          backgroundSize: '100% 100%',
        }} />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-2xl"
      >
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
          {/* Red Header Strip */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <XCircleIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Interview Terminated
                </h1>
              </div>
              <span className="text-xs text-white/70 bg-white/20 px-3 py-1 rounded-full">
                #{sessionId.slice(0, 8)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative bg-red-50 p-6 rounded-full">
                  {getReasonIcon()}
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
              🚫 Cheating Detected
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center mb-6">
              Your interview has been automatically terminated due to the following violation:
            </p>

            {/* Reason Card */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1">Violation Detected</p>
                  <p className="text-sm text-red-600">{reason}</p>
                  <p className="text-xs text-red-400 mt-2">
                    Detected at: {timestamp}
                  </p>
                </div>
              </div>
            </div>

            {/* Rules Violated */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Rules Violated
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  <span>Must remain focused on the interview window at all times</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  <span>Tab switching and window changes are prohibited</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  <span>Camera must remain active and facing the user</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGoHome}
                className="flex-1 py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <HomeIcon className="w-5 h-5" />
                Go Home
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-teal-600/20 hover:shadow-xl flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Try Another Interview
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6">
              For support, please contact your interview administrator.
              <br />
              <span className="text-gray-300">Session ID: {sessionId}</span>
            </p>
          </div>
        </div>

        {/* Floating warning badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-4 -right-4 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold"
        >
          <ShieldExclamationIcon className="w-4 h-4" />
          VIOLATION
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Cheating;