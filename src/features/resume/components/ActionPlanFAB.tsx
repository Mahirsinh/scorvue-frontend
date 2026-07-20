// ActionPlanFAB.tsx
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Lightbulb, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActionPlanFABProps {
  issues: string[];
}

export const ActionPlanFAB = ({ issues }: ActionPlanFABProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!issues || issues.length === 0) return null;

  const topIssues = issues.slice(0, 3);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end" ref={popoverRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 bg-white border border-blue-200 shadow-xl shadow-blue-500/10 rounded-2xl overflow-hidden origin-bottom-right"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-200">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" /> Top Priority Fixes
              </h4>
            </div>
            <div className="p-4 space-y-3">
              {topIssues.map((issue, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-blue-600">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {issue}
                  </p>
                </div>
              ))}
              {issues.length > 3 && (
                <div className="pt-2 border-t border-gray-100 text-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                    + {issues.length - 3} more issues in Feedback tab
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        {/* Pulse effect */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30" />
        )}
        
        {isOpen ? (
          <X className="w-6 h-6 text-white" strokeWidth={2.5} />
        ) : (
          <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-4 bg-white text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-200 shadow-sm">
            View Action Plan
          </div>
        )}
      </button>
    </div>
  );
};