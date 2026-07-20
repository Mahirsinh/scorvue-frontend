// Login.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { reset, googleLogin } from "../features/auth/authSlice";
import type { RootState, AppDispatch } from "../app/store";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import heroBanner from "../assets/banner-r.png";
import { 
  ShieldCheckIcon, 
  SparklesIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon 
} from "@heroicons/react/24/outline";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user, isLoading, isError, isSuccess, message } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(reset());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message || "Google login failed");
            dispatch(reset());
        }

        if (isSuccess && user) {
            toast.success("Login successful");
            navigate("/");
            dispatch(reset());
        }
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            dispatch(googleLogin(credentialResponse.credential));
        } else {
            toast.error("Google Login Failed");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Premium features list
    const features = [
        { icon: SparklesIcon, text: "AI-powered interview practice" },
        { icon: ChartBarIcon, text: "Detailed performance analytics" },
        { icon: UserGroupIcon, text: "Expert mentor guidance" },
        { icon: CheckCircleIcon, text: "4.8/5 rating from 2000+ users" },
    ];

    return (
        <div className="flex items-stretch min-h-[80vh] gap-8 max-w-7xl mx-auto px-4">
            {/* Left side - Banner / Hero */}
            <div className="hidden lg:flex lg:w-1/2 rounded-3xl overflow-hidden bg-gradient-to-br from-[#2563EB] via-[#4338CA] to-[#6D28D9] p-8 flex-col justify-between relative">
                {/* glow */}
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl" />

                {/* TOP */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-7">
                        <div className="bg-white/15 p-3 rounded-xl backdrop-blur-lg">
                            <AcademicCapIcon className="w-6 h-6 text-white"/>
                        </div>
                        <h2 className="text-white font-bold text-xl">
                            SCORVUE
                        </h2>
                        <span className="ml-auto px-3 py-1 rounded-full bg-white/15 text-xs text-white font-semibold backdrop-blur">
                            PREMIUM
                        </span>
                    </div>

                    <h1 className="text-5xl font-extrabold text-white leading-tight">
                        Master Your
                        <br />
                        <span className="text-yellow-300">
                            Interview Skills
                        </span>
                    </h1>

                    <p className="mt-5 text-white/80 max-w-md leading-7">
                        Practice with AI, receive instant feedback,
                        improve communication, and crack your dream job.
                    </p>

                    <div className="flex items-center mt-8">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => {
                                const gender = Math.random() > 0.5 ? "men" : "women";
                                const id = Math.floor(Math.random() * 99) + 1;

                                return (
                                    <img
                                        key={i}
                                        src={`https://randomuser.me/api/portraits/${gender}/${id}.jpg`}
                                        alt={`Student ${i}`}
                                        className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md"
                                    />
                                );
                            })}
                        </div>

                        <span className="ml-5 text-white font-medium">
                            <span className="font-bold">1,500+</span> Learners
                        </span>
                    </div>
                    
                    {/* Features list - desktop */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-white/90 text-sm">
                                <feature.icon className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                                <span>{feature.text}</span>
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
                            Trusted by 2000+ students
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center py-8">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 border border-gray-100/50 relative">
                    {/* Premium badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-lg shadow-blue-500/30 tracking-wider uppercase">
                        Free Trial • Register Now
                    </div>
                    
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            Welcome Back!
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                            Sign in with Google to continue
                        </p>
                    </div>

                    <div className="w-full flex items-center justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                toast.error("Google Login Failed");
                            }}
                            theme="outline"
                            shape="pill"
                            size="large"
                            text="continue_with"
                            width="100%"
                        />
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 font-medium">
                            New to SCORVUE?{" "}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4 transition-colors">Create free account</Link>
                        </p>
                    </div>
                    
                    {/* Premium features - mobile only */}
                    <div className="mt-6 pt-6 border-t border-gray-100 lg:hidden">
                        <div className="grid grid-cols-2 gap-2">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <feature.icon className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                    <span>{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;