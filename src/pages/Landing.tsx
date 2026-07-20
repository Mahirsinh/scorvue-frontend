// pages/Landing.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import type { RootState } from "../app/store";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/live-interview/preferences");
    } else {
      navigate("/login");
    }
  };

  const features = [
    {
      icon: AcademicCapIcon,
      title: "AI-Powered Interviews",
      description: "Practice with realistic AI interviewers that adapt to your responses in real-time.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      icon: ChartBarIcon,
      title: "Instant Feedback & Scores",
      description: "Get detailed performance metrics including technical skills, communication, and confidence.",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      icon: ShieldCheckIcon,
      title: "Evidence-Based Reviews",
      description: "Every score comes with specific quotes from your interview, so you know exactly what to improve.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      icon: RocketLaunchIcon,
      title: "Career-Ready Insights",
      description: "Get salary benchmarks, role fit analysis, and actionable recommendations to land your dream job.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  const stats = [
    { label: "Practice Interviews", value: "10,000+", icon: PlayIcon },
    { label: "Active Users", value: "5,000+", icon: UserGroupIcon },
    { label: "Success Rate", value: "94%", icon: CheckCircleIcon },
    { label: "Avg. Score Increase", value: "42%", icon: ChartBarIcon },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Choose Your Role",
      description: "Select your target role, difficulty level, and focus areas.",
      icon: BriefcaseIcon,
    },
    {
      step: "02",
      title: "Start Interview",
      description: "Have a natural conversation with our AI interviewer.",
      icon: PlayIcon,
    },
    {
      step: "03",
      title: "Get Instant Review",
      description: "Receive comprehensive feedback with scores, strengths, and improvement areas.",
      icon: DocumentTextIcon,
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer at Google",
      quote: "SCORVUE helped me crack my Google interview! The real-time feedback and detailed reviews were game-changing.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
    },
    {
      name: "Rahul Patel",
      role: "Product Manager at Microsoft",
      quote: "The AI interviewer is incredibly realistic. I felt prepared for every question in my actual interview.",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      rating: 5,
    },
    {
      name: "Sneha Reddy",
      role: "Data Scientist at Amazon",
      quote: "The evidence-based feedback helped me identify and fix my weak areas quickly. Highly recommended!",
      avatar: "https://randomuser.me/api/portraits/women/46.jpg",
      rating: 5,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-32">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-r from-indigo-500/5 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full">
                <SparklesIcon className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">🚀 Next-Gen AI Interviewing</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Master Your Next
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Interview with AI
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 max-w-lg">
                Practice with our intelligent AI interviewer, get instant feedback with evidence-based scores,
                and land your dream job with confidence.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                >
                  Start Free Interview
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-2"
                >
                  <PlayIcon className="w-5 h-5" />
                  How It Works
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <stat.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Hero Image/Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-400 rounded-full opacity-20 blur-2xl"></div>

                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  {/* Mock Interview UI */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 border-2 border-white"></div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">AI Interviewer</p>
                      <p className="text-white/60 text-xs">Live • 2 participants</p>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-white/60 text-xs">Recording</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <div className="bg-white/10 rounded-lg px-3 py-2 flex-1">
                        <p className="text-white text-sm">Tell me about your experience with React and TypeScript.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">U</span>
                      </div>
                      <div className="bg-white/10 rounded-lg px-3 py-2 flex-1">
                        <p className="text-white text-sm">I've been working with React for 3 years...</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"></div>
                    </div>
                    <span className="text-white/60 text-xs">85%</span>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <div className="flex items-center gap-1 text-white/60 text-xs">
                      <ShieldCheckIcon className="w-3 h-3" />
                      <span>AI-Powered • Real-time</span>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 hidden lg:block">
                  <div className="bg-white rounded-xl shadow-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-gray-900">4.8</span>
                      <span className="text-xs text-gray-500">(200+)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Why Choose <span className="text-blue-600">SCORVUE</span>?
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Everything you need to ace your interviews and land your dream job.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`${feature.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.textColor}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              How It <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Get started in just 3 simple steps and start practicing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200"></div>

            {howItWorks.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative text-center"
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 border-2 border-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              What Our Users <span className="text-blue-600">Say</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have improved their interview skills with SCORVUE.
            </p>
            <button
              onClick={handleGetStarted}
              className="group px-10 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              Start Your Free Interview
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-blue-200 text-sm mt-4">No credit card required • Free to start</p>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">SCORVUE</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} SCORVUE. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">Made with ❤️ for job seekers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;