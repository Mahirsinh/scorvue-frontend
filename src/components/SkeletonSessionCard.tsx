// SkeletonSessionCard.tsx
import { motion } from "framer-motion";

export default function SkeletonSessionCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white border border-gray-200/50 rounded-3xl shadow-sm p-6 flex flex-col items-stretch gap-6 relative hover:shadow-md transition-shadow duration-300"
        >
            <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-gray-200 animate-pulse shadow-sm border border-gray-200/50"></div>
                <div className="overflow-hidden grow space-y-2">
                    <div className="h-5 bg-gray-200 animate-pulse rounded-md w-3/4"></div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-3 w-16 bg-gray-200 animate-pulse rounded-full"></div>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <div className="h-3 w-20 bg-gray-200 animate-pulse rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-5 border-t border-gray-100 relative z-10">
                <div className="space-y-1">
                    <div className="h-2 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="h-8 w-12 bg-gray-200 animate-pulse rounded-md"></div>
                        <div className="h-6 w-6 bg-gray-200 animate-pulse rounded-full"></div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="h-5 w-16 bg-gray-200 animate-pulse rounded-lg"></div>
                    <div className="h-3 w-12 bg-gray-200 animate-pulse rounded-full mt-1"></div>
                </div>
            </div>
        </motion.div>
    );
}