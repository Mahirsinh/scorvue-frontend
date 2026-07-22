// App.tsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import useSocket from "./hooks/useSocket";
import { logout } from "./features/auth/authSlice";
import type { AppDispatch } from "./app/store";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewRunner from "./pages/InterviewRunner";
import SessionReview from "./pages/SessionReview";

import MockTest from "./pages/MockTest";

import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import NotFound from "./pages/NotFound";



import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import { LeaderboardWidget } from "./features/gamification/components/LeaderboardWidget";
import { BadgeIcon } from "lucide-react";
import WhiteboardModal from "./components/WhiteboardModal";
import VerbalRecorder from "./components/VerbalRecorder";
import SpeechAnalyticsPanel from "./components/SpeechAnalyticsPanel";
import SkeletonSessionCard from "./components/SkeletonSessionCard";
import SessionReviewStats from "./components/SessionReviewStats";
import SessionCard from "./components/SessionCard";
import Profile from "./pages/Profile";
import InterviewPreferences from "./pages/InterviewPreferences"; // ✅ Add this import
import Interview from "./pages/Interview";
import Review from "./pages/Review";
import Cheating from "./pages/Cheating";
import History from "./pages/History";
import Landing from "./pages/Landing";
import Plan from "./pages/Plan";
import NewInterviewForm from "./components/NewInterviewForm"; // ✅ Mock test form

function App() {
  useSocket();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleUnauthorized = () => {
      toast.dismiss();
      dispatch(logout());
    };
    window.addEventListener("auth_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth_unauthorized", handleUnauthorized);
  }, [dispatch]);

  return (
    <>
      <div className="relative min-h-screen bg-white text-surface-900 overflow-x-hidden">
        {/* Premium decorative background elements - soft blue/white theme */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/60 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-50/30 rounded-full blur-3xl"></div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={1800}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Header />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full"
            >

              <Routes location={location} key={location.pathname}>
                <Route element={<PublicRoute />}>
                <Route path="/home" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                <Route path="/" element={<PrivateRoute />} >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />

                  <Route path="/review-interview/:sessionId" element={<Review />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/plans" element={<Plan />} />
                  <Route path="/interview/:sessionId" element={<InterviewRunner />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/review/:sessionId" element={<SessionReview />} />
                      <Route path="/cheating" element={<Cheating />} />
                  {/* ✅ Add the new route here */}
                  <Route path="/live-interview/preferences" element={<InterviewPreferences />} />
                  {/* ✅ Mock test entry point */}
                  <Route path="/mock" element={<NewInterviewForm />} />
                </Route>
                
                <Route path="/profile" element={<PrivateRoute />}>
                
                  <Route path="/profile" element={<Profile />} />
              
                </Route>
                <Route path="/interview" element={<PrivateRoute />}>
    <Route path="/interview" element={<Interview   />} />
</Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  )
}

export default App;
