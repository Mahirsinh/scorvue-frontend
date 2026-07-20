// pages/Profile.tsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, updateProfile, reset } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../app/store";
import { 
  LogOut, User, Mail, Save, ShieldCheckIcon, AtSign, ArrowLeft, 
  Crown, Sparkles, Zap, Star, Award, Gem, TrendingUp 
} from "lucide-react";
import { motion } from "framer-motion";
import { ROLES } from "../constants/interview";
import CustomSelect from "../components/CustomSelect";
import { toast } from "react-toastify";

const Profile = () => {
    const { user, isProfileLoading } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user?.name || "",
        preferredRole: user?.preferredRole || "",
    });

    // Check if user has elite/premium plan
    const isElite = user?.plan?.toLowerCase() === 'elite';
    const isPremium = user?.plan?.toLowerCase() === 'premium' || user?.plan?.toLowerCase() === 'elite';
    const planLabel = user?.plan 
        ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) 
        : "Free";
    
    // Get plan emoji/icon
    const getPlanIcon = () => {
        if (isElite) return <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />;
        if (isPremium) return <Star className="w-5 h-5 text-blue-400 fill-blue-400" />;
        return <ShieldCheckIcon className="w-5 h-5 text-gray-400" />;
    };

    const getPlanColor = () => {
        if (isElite) return "from-amber-500 via-yellow-500 to-orange-500";
        if (isPremium) return "from-blue-500 to-indigo-500";
        return "from-gray-400 to-gray-500";
    };

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    const handleRoleChange = (name: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [name]: String(value) }));
    };

    const handleSave = async () => {
        if (!user) return;
        
        if (formData.name === user.name && formData.preferredRole === user.preferredRole) {
            toast.info("No changes detected");
            return;
        }

        try {
            await dispatch(updateProfile({ ...user, ...formData })).unwrap();
            toast.success("Profile updated successfully");
            dispatch(reset());
        } catch (error: unknown) {
            const errorMessage = (error as { message?: string })?.message || "Failed to update profile";
            toast.error(errorMessage);
            dispatch(reset());
        }
    };

    const isGoogleUser = !!user?.avatar && user.avatar.startsWith('http');

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-3xl shadow-lg border overflow-hidden relative ${
                    isElite 
                        ? 'border-amber-200/50 shadow-amber-100/50' 
                        : isPremium
                        ? 'border-blue-200/50 shadow-blue-100/50'
                        : 'border-gray-200/50'
                }`}
            >
                {/* Premium Glow Effect - Elite Only */}
                {isElite && (
                    <>
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-75"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-150"></div>
                    </>
                )}

                {/* Premium Shimmer - Elite Only */}
                {isElite && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_4s_infinite] bg-gradient-to-r from-transparent via-amber-400/5 to-transparent"></div>
                    </div>
                )}

                {/* Header */}
                <div className={`relative z-10 px-8 py-6 flex items-center justify-between ${
                    isElite 
                        ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600' 
                        : isPremium
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/')}
                            className="p-2 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                Profile Settings
                                {isElite && (
                                    <span className="flex items-center gap-1">
                                        <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                                        <Zap className="w-4 h-4 text-orange-300 fill-orange-300 animate-bounce" />
                                    </span>
                                )}
                            </h1>
                            <p className="text-white/80 text-sm font-medium mt-0.5">
                                {isElite ? '✨ Elite Member - Premium Benefits Active' : 'Manage your account details'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>

                {/* User Profile Section */}
                <div className={`relative z-10 px-8 pt-8 pb-6 border-b ${
                    isElite ? 'border-amber-100' : 'border-gray-100'
                }`}>
                    <div className={`flex items-center gap-6 p-6 rounded-2xl border ${
                        isElite 
                            ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-200' 
                            : isPremium
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
                            : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                    }`}>
                        {/* Avatar with Premium Ring */}
                        <div className="relative">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className={`w-20 h-20 rounded-full object-cover border-4 shadow-lg ${
                                        isElite 
                                            ? 'border-amber-300 shadow-amber-500/30 ring-4 ring-amber-400/20' 
                                            : isPremium
                                            ? 'border-blue-300 shadow-blue-500/20'
                                            : 'border-white shadow-blue-500/20'
                                    }`}
                                />
                            ) : (
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg ${
                                    isElite 
                                        ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 shadow-amber-500/30 ring-4 ring-amber-400/20' 
                                        : isPremium
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30'
                                        : 'bg-gradient-to-r from-gray-600 to-gray-700 shadow-gray-500/30'
                                }`}>
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                            )}
                            
                            {/* Premium Badge Overlay */}
                            {isElite && (
                                <div className="absolute -top-1 -right-1">
                                    <div className="relative">
                                        <div className="w-7 h-7 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 animate-bounce">
                                            <Crown className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <div className="absolute inset-0 w-7 h-7 bg-amber-400 rounded-full animate-ping opacity-50"></div>
                                    </div>
                                </div>
                            )}
                            {isPremium && !isElite && (
                                <div className="absolute -top-1 -right-1">
                                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                                        <Star className="w-4 h-4 text-white fill-white" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className={`text-2xl font-bold ${
                                isElite ? 'text-amber-800' : 'text-gray-900'
                            }`}>
                                {user?.name}
                            </p>
                            <p className="text-gray-500 flex items-center gap-2">
                                <Mail size={16} className="flex-shrink-0" />
                                {user?.email}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {/* Plan Badge */}
                                <span className={`text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                                    isElite 
                                        ? 'text-amber-700 bg-amber-50 border-amber-300 shadow-sm shadow-amber-200/50' 
                                        : isPremium
                                        ? 'text-blue-700 bg-blue-50 border-blue-300'
                                        : 'text-gray-600 bg-gray-50 border-gray-200'
                                }`}>
                                    {getPlanIcon()}
                                    <span className={`font-bold ${
                                        isElite ? 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent' : ''
                                    }`}>
                                        {isElite ? '✦ ' : ''}{planLabel}{isElite ? ' ✦' : ''}
                                    </span>
                                    {isElite && (
                                        <>
                                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                                            <span className="text-[8px] text-amber-600 font-bold uppercase tracking-wider">Elite</span>
                                        </>
                                    )}
                                </span>
                                
                                {isElite && (
                                    <>
                                        <span className="text-xs text-amber-300">•</span>
                                        <span className="text-[10px] text-amber-600 flex items-center gap-1">
                                            <Gem size={12} className="text-amber-500" />
                                            <span className="font-medium">VIP Access</span>
                                        </span>
                                        <span className="text-xs text-amber-300">•</span>
                                        <span className="text-[10px] text-amber-600 flex items-center gap-1">
                                            <TrendingUp size={12} className="text-amber-500" />
                                            <span className="font-medium">Priority Support</span>
                                        </span>
                                    </>
                                )}
                                
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <AtSign size={14} />
                                    {isGoogleUser ? 'Google Account' : 'Email Account'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 space-y-8">
                    <div className="space-y-6">
                        {/* Name Input */}
                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider ml-1 block mb-1.5 ${
                                isElite ? 'text-amber-700' : 'text-gray-600'
                            }`}>
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <User size={18} />
                                </div>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className={`w-full bg-gray-50 border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-300 text-gray-900 placeholder:text-gray-400 ${
                                        isElite 
                                            ? 'border-amber-200 focus:ring-amber-500/20 focus:border-amber-500' 
                                            : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                                    }`}
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        {/* Email (Locked) */}
                        <div className="opacity-60">
                            <label className={`text-xs font-bold uppercase tracking-wider ml-1 block mb-1.5 ${
                                isElite ? 'text-amber-700' : 'text-gray-600'
                            }`}>
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <div className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-11 pr-4 py-3 flex items-center text-sm font-medium text-gray-500 cursor-not-allowed">
                                    {user?.email}
                                </div>
                            </div>
                        </div>

                        {/* Account Type Indicator */}
                        <div className={`rounded-xl p-4 border ${
                            isElite ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                            <p className={`text-sm flex items-center gap-2 ${
                                isElite ? 'text-amber-700' : 'text-gray-500'
                            }`}>
                                <span className="font-medium">Account Type:</span>
                                {isGoogleUser ? (
                                    <span className="text-blue-600 flex items-center gap-1.5">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Google Account
                                    </span>
                                ) : (
                                    <span className="text-gray-600 flex items-center gap-1.5">
                                        <Mail size={16} />
                                        Email Account
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Role Selection */}
                        <div className={`z-10 ${isElite ? 'premium-select' : ''}`}>
                            <CustomSelect 
                                label="Preferred Role"
                                name="preferredRole"
                                value={formData.preferredRole}
                                options={ROLES}
                                onChange={handleRoleChange}
                            />
                        </div>
                    </div>

                    {/* Primary Actions */}
                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={handleSave}
                            disabled={isProfileLoading}
                            className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 active:scale-[0.98] ${
                                isProfileLoading 
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                    : isElite
                                    ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white shadow-md shadow-amber-500/30 hover:shadow-lg'
                                    : isPremium
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/30 hover:shadow-lg'
                                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-md shadow-gray-500/30'
                            }`}
                        >
                            <Save size={18} />
                            {isProfileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        
                        <button 
                            onClick={() => navigate('/')}
                            className={`px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                                isElite 
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' 
                                    : isPremium
                                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                            }`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* CSS for shimmer animation */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default Profile;