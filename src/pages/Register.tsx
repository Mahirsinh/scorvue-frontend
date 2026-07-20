// Register.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { googleLogin, reset } from "../features/auth/authSlice";
import type { AppDispatch, RootState } from "../app/store";
import { toast } from "react-toastify";
import heroBanner from "../assets/banner-l.png";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { 
  RocketLaunchIcon, 
  SparklesIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state: RootState) => state.auth
    );

    useEffect(() => {
        dispatch(reset());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message || "Google registration failed");
            dispatch(reset());
        }

        if (isSuccess) {
            toast.success("Registration successful");
            navigate("/");
            dispatch(reset())
        }

        if (user && !isSuccess) {
            navigate("/");
        }

    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            dispatch(googleLogin(credentialResponse.credential));
        } else {
            toast.error("Google Registration Failed");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const benefits = [
        { icon: SparklesIcon, text: "AI-powered mock interviews" },
        { icon: ChartBarIcon, text: "Real-time performance analytics" },
        { icon: UserGroupIcon, text: "500+ expert mentors" },
        { icon: CheckCircleIcon, text: "Trusted by 1M+ professionals" },
    ];

    return (
        <div className="flex items-stretch min-h-[80vh] gap-8 max-w-7xl mx-auto px-4">
            {/* Left side - Banner */}
            <div className="hidden lg:flex lg:w-1/2 rounded-3xl overflow-hidden bg-gradient-to-br from-[#6D28D9] via-[#4338CA] to-[#2563EB] p-8 flex-col justify-between relative">
                {/* glow */}
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl" />

                {/* TOP */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-7">
                        <div className="bg-white/15 p-3 rounded-xl backdrop-blur-lg">
                            <RocketLaunchIcon className="w-6 h-6 text-white"/>
                        </div>
                        <h2 className="text-white font-bold text-xl">
                            SCORVUE
                        </h2>
                        <span className="ml-auto px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-xs text-white font-semibold backdrop-blur">
                            FREE TRIAL
                        </span>
                    </div>

                    <h1 className="text-5xl font-extrabold text-white leading-tight">
                        Launch Your
                        <br />
                        <span className="text-yellow-300">
                            Dream Career
                        </span>
                    </h1>

                    <p className="mt-5 text-white/80 max-w-md leading-7">
                        Get started with 7 days of free premium access. 
                        No credit card required. Join 1M+ professionals.
                    </p>

                    <div className="flex items-center mt-8">
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map((i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-full border-2 border-white bg-white text-slate-700 font-bold flex items-center justify-center"
                                >
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="ml-5 text-white font-medium">
                            1M+ Professionals
                        </span>
                    </div>

                    {/* Benefits list - desktop */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-white/90 text-sm">
                                <benefit.icon className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                                <span>{benefit.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* HERO IMAGE */}
                <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-4">
                    <img 
                        src={heroBanner} 
                        alt="SCORVUE Hero" 
                        className="w-full max-h-[230px] object-cover drop-shadow-[0_40px_80px_rgba(0,0,0,0.35)]" 
                    />
                </div>

                {/* FOOTER */}
                <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex text-yellow-300">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className="w-4 h-4 fill-current"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                ))}
                            </div>
                            <span className="text-white font-bold">
                                4.8/5
                            </span>
                            <span className="text-white/70 text-sm">
                                (2000+ Reviews)
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <ShieldCheckIcon className="w-5 h-5 text-green-400"/>
                            Trusted & Secure
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center py-8">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-gray-100/50 relative">
                    {/* Premium badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-lg shadow-indigo-500/30 tracking-wider uppercase">
                        🚀 Free Trial • Register Now
                    </div>
                    
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            Get Started Free
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                            Sign up with Google to continue
                        </p>
                    </div>

                    <div className="w-full flex items-center justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                toast.error("Google Registration Failed");
                            }}
                            theme="outline"
                            shape="pill"
                            size="large"
                            text="continue_with"
                            width="100%"
                        />
                    </div>

                    <div className="mt-5 text-center">
                        <p className="text-sm text-gray-600 font-medium">
                            Already have an account?{" "}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold underline underline-offset-4 transition-colors">Sign In</Link>
                        </p>
                    </div>
                    
                    {/* Trust indicators */}
                    <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-center gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheckIcon className="w-3.5 h-3.5 text-green-500" />
                            <span>256-bit encryption</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1.5">
                            <UserGroupIcon className="w-3.5 h-3.5 text-blue-500" />
                            <span>1000+ users</span>
                        </div>
                    </div>

                    {/* Benefits - mobile only */}
                    <div className="mt-5 pt-5 border-t border-gray-100 lg:hidden">
                        <div className="grid grid-cols-2 gap-2">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <benefit.icon className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                                    <span>{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;