// Dashboard.tsx
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { createSession, deleteSession, getSession } from "../features/session/sessionSlice"
import type { RootState, AppDispatch } from "../app/store"
import { toast } from "react-toastify"
import SessionCard from "../components/SessionCard"
import SkeletonSessionCard from "../components/SkeletonSessionCard"
import ConfirmModal from "../components/ConfirmModal"
import type { Session } from "../types/session"
import { ROLES, LEVELS, TYPES, COUNTS } from "../constants/interview"

import NewInterviewForm from "../components/NewInterviewForm"
import type { FormChangeEvent } from "../types/forms"
import { ResumeHistoryWidget } from "../features/resume/components/ResumeHistoryWidget"
import { GamificationWidget } from "../features/gamification/components/GamificationWidget"
import { motion } from "framer-motion"
import { fetchGamificationProfile } from "../features/gamification/gamificationSlice";

import {
  ArrowPathIcon,
  ChartBarIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UserGroupIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  PresentationChartLineIcon,
  ClockIcon,
  TrophyIcon
} from "@heroicons/react/24/outline"
import LiveAIInterview from "../components/LiveAIInterview"
import InterviewHistory from "../components/InterviewHistory"

const Dashboard = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { user } = useSelector((state: RootState) => state.auth)
    
    const { sessions, isLoading, isGenerating, isError, message, pagination, stats } = useSelector((state: RootState) => state.session)
    const isProcessing = isGenerating || isLoading;
    const [formData, setFormData] = useState({
        role: user?.preferredRole || ROLES[0],
        level: LEVELS[0],
        interviewType: TYPES[1].value,
        count: COUNTS[0],
        company: "general",
        companyTrack: "general",
        resumeId: "",
    })

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        sessionId: '',
    })
const { profile: gamificationProfile } = useSelector((state: RootState) => state.gamification);

// Add this useEffect to fetch gamification data
useEffect(() => {
    dispatch(getSession());
    dispatch(fetchGamificationProfile());
}, [dispatch]);


    useEffect(() => {
        dispatch(getSession())
    }, [dispatch]);

    useEffect(() => {
        if (isError && message) {
            toast.error(message);
        }
    }, [isError, message, dispatch]);

    const onChange = (e: FormChangeEvent) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        dispatch(createSession(formData));
    };

const viewSession = (session: Session) => {
    if (session.status === 'completed') {
        // Use path parameter like your working version
        navigate(`/review/${session._id}`)
    } else if (session.status === 'in-progress') {
        navigate(`/interview/${session._id}`)
    } else {
        toast.info("Session not ready yet")
    }
}


    const handleDelete = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation()
        setModalConfig({
            isOpen: true,
            sessionId: sessionId,
        })
    }

    const confirmDelete = () => {
        if (modalConfig.sessionId) {
            dispatch(deleteSession(modalConfig.sessionId));
            toast.success("Session deleted successfully");
            setModalConfig({ isOpen: false, sessionId: '' });
        }
    }

    const loadMore = () => {
        if (pagination && pagination.currentPage < pagination.totalPages) {
            dispatch(getSession({ page: pagination.currentPage + 1 }));
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // Calculate stats
    const totalSessions = stats?.totalSessions || 0;
    const completedSessions = stats?.completedSessions || 0;
    const activeSessions = stats?.activeSessions || 0;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

   const quickStats = [
    { 
        icon: DocumentTextIcon, 
        label: "Total Mock Sessions", 
        value: totalSessions,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
        textColor: "text-blue-600",
        borderColor: "border-blue-100",
        iconBg: "bg-blue-100"
    },
    { 
        icon: CheckCircleIcon, 
        label: "Completed Mock Sessions", 
        value: completedSessions,
        color: "from-emerald-500 to-emerald-600",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-600",
        borderColor: "border-emerald-100",
        iconBg: "bg-emerald-100"
    },
    { 
        icon: FireIcon, 
        label: "Active Streak", 
        value: gamificationProfile?.currentStreak || 0,  // ✅ Fixed: use gamificationProfile
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50",
        textColor: "text-orange-600",
        borderColor: "border-orange-100",
        iconBg: "bg-orange-100"
    },
    { 
        icon: TrophyIcon, 
        label: "Success Rate", 
        value: completionRate,
        display: `${completionRate}%`,
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
        textColor: "text-purple-600",
        borderColor: "border-purple-100",
        iconBg: "bg-purple-100"
    },
];


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-white rounded-3xl p-8 border border-gray-200/50 shadow-sm"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                    <div className="absolute top-0 left-0 w-32 h-full bg-white/50 blur-sm animate-[slide_2s_linear_infinite]"></div>
                </div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative mt-2">
                    <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30 flex-shrink-0">
                                <AcademicCapIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                                AI Mock Interviews
                            </span>
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                                <ShieldCheckIcon className="w-3.5 h-3.5" />
                                Job Ready
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Guest'}</span> 👋
                        </h1>
                        <p className="text-gray-600 text-sm lg:text-base max-w-2xl">
                            Ready to ace your next interview? Start a new practice session or review your progress below.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
    {/* Learners */}
    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex -space-x-2">
            {[
                "https://randomuser.me/api/portraits/women/55.jpg",
                "https://randomuser.me/api/portraits/men/32.jpg",
                "https://randomuser.me/api/portraits/women/68.jpg",
            ].map((avatar, index) => (
                <img
                    key={index}
                    src={avatar}
                    alt={`Learner ${index + 1}`}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                />
            ))}
        </div>

        <span className="text-sm font-medium text-gray-700 whitespace-nowrap ml-1">
            <span className="text-blue-600 font-bold">1,500+</span> learners
        </span>
    </div>

    {/* Rating */}
    <div className="flex items-center gap-1.5 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm whitespace-nowrap">
        <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-4 h-4 fill-current" />
            ))}
        </div>

        <span className="text-sm font-bold text-gray-700">4.8</span>
        <span className="text-xs text-gray-500">(200+)</span>
    </div>

    {/* Free Trial */}
    <div className="flex items-center gap-1.5 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 shadow-sm whitespace-nowrap">
        <BoltIcon className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-700">
        free trial available
        </span>
    </div>
</div>
                </div>
            </motion.div>

         {/* Quick Stats Grid */}
<motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
>
    {quickStats.map((stat, index) => (
        <motion.div
            key={index}
            variants={itemVariants}
            className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
        >
            <div className="flex items-center justify-between">
                <div className={`${stat.iconBg} p-2.5 rounded-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0`}>
                    <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{(stat as any).display ?? stat.value}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1.5 font-medium truncate">{stat.label}</p>
            <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(100, typeof stat.value === 'number' ? stat.value : 0)}%` }}></div>
            </div>
        </motion.div>
    ))}
</motion.div>
{/* Live AI Interview Component */}
<div className="mb-8">
    <LiveAIInterview userName={user?.name} />
</div>

{/* Quick Stats Grid */}
<motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
>
    {/* ... rest of your quick stats ... */}
</motion.div>
{/* Spacer */}
<div className="h-6"></div>

{/* New Interview Form - Full Width */}
<motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.2 }}
    className="relative group"
>
 
</motion.div>

{/* Spacer */}
<div className="h-8"></div>

{/* Section Title for Widgets */}
<div className="flex items-center gap-3 mb-4">
    <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
    <h2 className="text-xl font-bold text-gray-900">Your Progress</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
</div>
   <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
        <GamificationWidget />
    </motion.div>
{/* Gamification & Resume Widgets - Side by Side with equal width */}

    {/* Gamification Widget - Takes 2/3 of the space */}
 

    {/* Resume History Widget - Takes 1/3 of the space, stacked vertically */}
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="lg:col-span-1 bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 hover:shadow-md transition-shadow duration-300 flex flex-col"
    >
        <ResumeHistoryWidget />
    </motion.div>


{/* Spacer */}
<div className="h-8"></div>


<div className="mt-6">
    <InterviewHistory limit={5} showViewAll={true} />
</div>
            {/* Practice Test History Section */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30 flex-shrink-0">
                            <PresentationChartLineIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-gray-900">Practice Test History</h2>
                            <p className="text-sm text-gray-500 truncate">Track your progress and review past sessions</p>
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                            {sessions?.length || 0} total
                        </span>
                    </div>
                    <button 
                        onClick={() => dispatch(getSession())}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all duration-200 border border-blue-200 flex-shrink-0"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
{/* Interview History - Full Width */}

                <div className="grid gap-6">
                    {isLoading && (!sessions || !Array.isArray(sessions) || sessions.length === 0) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <SkeletonSessionCard key={i} />
                            ))}
                        </div>
                    ) : (
                        (!sessions || !Array.isArray(sessions) || sessions.length === 0) ? (
                            <motion.div
                                variants={itemVariants}
                                className="bg-white rounded-3xl py-20 text-center border-2 border-dashed border-gray-200"
                            >
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No sessions yet</h3>
                                <p className="text-gray-500 mt-1 text-sm">Start your first interview practice session above</p>
                                <button 
                                    onClick={() => {
                                        const form = document.querySelector('form');
                                        if (form) form.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all hover:-translate-y-0.5"
                                >
                                    Create First Session
                                </button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sessions.map((session, index) => (
                                    <motion.div key={session._id || index} variants={itemVariants} className="h-full">
                                        <SessionCard
                                            session={session}
                                            onClick={viewSession}
                                            onDelete={handleDelete}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {pagination && pagination.currentPage < pagination.totalPages && (
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={loadMore}
                            disabled={isLoading}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-8 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm shadow-sm hover:shadow-md"
                        >
                            {isLoading ? 'Loading...' : 'Load More Sessions'}
                        </button>
                    </div>
                )}
            </motion.div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title="Delete Session?"
                message="This will permanently delete this interview session from your history. This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setModalConfig({ isOpen: false, sessionId: '' })}
                isDanger={true}
            />
        </div>
    );
}

export default Dashboard
