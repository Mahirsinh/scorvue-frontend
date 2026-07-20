// AccountModal.tsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, updateProfile, reset } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../app/store";
import { X, LogOut, User, Mail, Save, ShieldCheckIcon, CalendarIcon, AtSign  } from "lucide-react";
import { motion } from "framer-motion";
import { ROLES } from "../constants/interview";
import CustomSelect from "./CustomSelect";
import { toast } from "react-toastify";

const AccountModal = ({ onClose }: { onClose: () => void }) => {
    const { user, isProfileLoading } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user?.name || "",
        preferredRole: user?.preferredRole || "",
    });

    // Lock background scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        onClose();
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

    // Determine if user signed up with Google (has avatar URL)
    const isGoogleUser = !!user?.avatar && user.avatar.startsWith('http');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-visible"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between rounded-t-3xl">
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Account Settings</h1>
                        <p className="text-white/80 text-xs font-medium mt-0.5">Manage your profile</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/10 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User Profile Section */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                        {/* Profile Picture - Google Avatar or Fallback */}
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg shadow-blue-500/20"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-sm text-gray-500 truncate flex items-center gap-2">
                                <Mail size={14} className="flex-shrink-0" />
                                {user?.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                    <ShieldCheckIcon size={14} className="text-emerald-500" />
                                    Premium Member
                                </span>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <AtSign  size={12} />
                                    {isGoogleUser ? 'Google Account' : 'Email Account'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-5">
                        {/* Name Input */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1 block mb-1.5">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <User size={16} />
                                </div>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        {/* Email (Locked) */}
                        <div className="opacity-60">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1 block mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={16} />
                                </div>
                                <div className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 flex items-center text-sm font-medium text-gray-500 cursor-not-allowed">
                                    {user?.email}
                                </div>
                            </div>
                        </div>

                        {/* Account Type Indicator */}
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                <span className="font-medium">Account Type:</span>
                                {isGoogleUser ? (
                                    <span className="text-blue-600 flex items-center gap-1">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Google Account
                                    </span>
                                ) : (
                                    <span className="text-gray-600 flex items-center gap-1">
                                        <Mail size={14} />
                                        Email Account
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Role Selection */}
                        <div className="z-10">
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
                    <div className="flex gap-3 pt-3">
                        <button 
                            onClick={handleSave}
                            disabled={isProfileLoading}
                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 active:scale-[0.98] ${
                                isProfileLoading 
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/30 hover:shadow-lg'
                            }`}
                        >
                            <Save size={16} />
                            {isProfileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        
                        <button 
                            onClick={onLogout}
                            className="w-12 h-12 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all duration-200 border border-red-200 hover:border-red-300 group active:scale-[0.95] cursor-pointer"
                            title="Sign Out"
                        >
                            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AccountModal;