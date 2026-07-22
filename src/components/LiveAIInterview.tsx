// components/LiveAIInterview.tsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  SparklesIcon,
  PlayIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  CpuChipIcon,
  StarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import bannerImage from "../assets/interviewcompo-img.png"; // adjust path as needed

interface LiveAIInterviewProps {
  userName?: string;
}

const LiveAIInterview = ({ userName }: LiveAIInterviewProps) => {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    navigate('/live-interview/preferences');
  };

  const handleMockTest = () => {
    navigate('/mocktest');
  };

  const features = [
    { icon: MicrophoneIcon, label: "Voice & Video", description: "Real-time AI interaction" },
    { icon: ChartBarIcon, label: "Instant Feedback", description: "Performance analytics" },
    { icon: CheckCircleIcon, label: "Job Ready", description: "Industry-specific questions" },
  ];

  const stats = [
    { value: "1,500+", label: "Candidates Trained" },
    { value: "4.8/5", label: "Average Rating" },
    { value: "92%", label: "Success Rate" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-3xl shadow-xl shadow-blue-500/20 border border-blue-400/20"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
        {/* Left Content */}
        <div className="flex flex-col justify-center space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 w-fit"
          >
            <SparklesIcon className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              AI-Powered Mock Interviews
            </span>
            <CpuChipIcon className="w-4 h-4 text-cyan-300" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl lg:text-5xl font-bold text-white leading-tight"
          >
            Crack Interviews with
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              AI-Powered Practice
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-blue-100/80 text-base lg:text-lg max-w-lg leading-relaxed"
          >
            Get real-time feedback, attempt coding challenges, and improve with every practice session.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-6 pt-2"
          >
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-8 w-px bg-white/20 first:hidden" />
                <div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-blue-200/70 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                  <feature.icon className="w-4 h-4 text-blue-200" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{feature.label}</div>
                  <div className="text-[9px] text-blue-200/70">{feature.description}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center gap-3"
          >
            <button
              onClick={handleStartInterview}
              className="group relative inline-flex items-center gap-3 w-fit px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-2xl shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <PlayIcon className="w-5 h-5" />
              <span className="text-sm tracking-wide">Start Live Interview</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded-full animate-pulse">
                LIVE
              </span>
            </button>

            <button
              onClick={handleMockTest}
              className="group inline-flex items-center gap-3 w-fit px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span className="text-sm tracking-wide">Attempt a Mock Test</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <p className="text-[10px] text-blue-200/50 flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            Takes 15-20 mins • No credit card required
          </p>
        </div>

        {/* Right Content - Banner Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center relative"
        >
          <div className="relative w-full max-w-md">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl -translate-y-4" />
            
            {/* Image Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10">
              <img
                src={bannerImage}
                alt="AI Interview"
                className="w-full h-auto object-cover"
              />
              
              {/* Floating Badge - Top Right */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white">Live</span>
                </div>
              </div>

              {/* Floating Badge - Bottom Left */}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="w-4 h-4 text-blue-300" />
                  <span className="text-xs font-medium text-white">1,500+ practicing</span>
                </div>
              </div>

              {/* Floating Badge - Bottom Right */}
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-medium text-white">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative bottom bar */}
      <div className="relative z-10 px-8 pb-4 flex flex-wrap items-center justify-between gap-4 text-[10px] text-blue-200/50 border-t border-white/5 pt-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <VideoCameraIcon className="w-3.5 h-3.5" />
            AI Video Interview
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5">
            <MicrophoneIcon className="w-3.5 h-3.5" />
            Voice Analysis
          </span>
        </div>
        <span className="flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-yellow-300" />
          Powered by Advanced AI
        </span>
      </div>
    </motion.div>
  );
};

export default LiveAIInterview;
