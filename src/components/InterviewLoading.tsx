// InterviewLoading.tsx
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Brain, Clock } from "lucide-react";

interface InterviewLoadingProps {
    sessionMessage?: string;
}

const InterviewLoading: React.FC<InterviewLoadingProps> = ({ sessionMessage }) => {
    const loadingMessages = [
        "Analyzing your profile...",
        "Generating tailored questions...",
        "Setting up the interview environment...",
        "Loading AI interviewer...",
        "Almost ready..."
    ];

    const getRandomMessage = () => {
        const index = Math.floor(Math.random() * loadingMessages.length);
        return loadingMessages[index];
    };

    const [currentMessage, setCurrentMessage] = React.useState(sessionMessage || getRandomMessage());

    React.useEffect(() => {
        if (!sessionMessage) {
            const interval = setInterval(() => {
                setCurrentMessage(getRandomMessage());
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [sessionMessage]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-40 gap-8"
        >
            {/* Animated Icon Container */}
            <motion.div
                animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative"
            >
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-2xl animate-pulse" />
                
                {/* Main icon */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Brain className="w-9 h-9 text-white" />
                    
                    {/* Spinning ring */}
                    <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" />
                    <div className="absolute -inset-1.5 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin-reverse" />
                </div>
                
                {/* Sparkle particles */}
                <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                </motion.div>
                <motion.div
                    className="absolute -bottom-1 -left-1"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                    <Sparkles className="w-4 h-4 text-blue-400 fill-blue-400" />
                </motion.div>
            </motion.div>

            {/* Loading Text */}
            <div className="text-center space-y-4">
                <motion.h2 
                    className="text-2xl font-bold text-gray-900 tracking-tight"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Preparing Your Interview
                </motion.h2>
                
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-600 font-medium">
                        {currentMessage}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 max-w-full">
                <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                        initial={{ x: '-100%' }}
                        animate={{ x: '0%' }}
                        transition={{ 
                            duration: 8,
                            ease: "easeInOut",
                            repeat: Infinity
                        }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-medium">
                    <span>Initializing</span>
                    <span>Loading</span>
                    <span>Ready</span>
                </div>
            </div>

            {/* Tips */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 px-6 py-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 max-w-md"
            >
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-700 font-medium">
                    💡 This usually takes 5-10 seconds. Get ready to ace your interview!
                </p>
            </motion.div>
        </motion.div>
    );
};

// Add this to your tailwind config or CSS for reverse spin animation
// @keyframes spin-reverse {
//   from { transform: rotate(0deg); }
//   to { transform: rotate(-360deg); }
// }
// .animate-spin-reverse {
//   animation: spin-reverse 3s linear infinite;
// }

export default InterviewLoading;