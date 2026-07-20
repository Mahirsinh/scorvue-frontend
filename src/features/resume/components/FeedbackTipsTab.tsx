// FeedbackTipsTab.tsx
import { motion } from "framer-motion";
import { AlertCircle, Star, Sparkles } from "lucide-react";
import type { ResumeData } from "../types";
import ReactMarkdown, { type Components } from "react-markdown";

interface FeedbackTipsTabProps {
  resumeData?: ResumeData;
  issues?: string[];
  strengths?: string[];
  streamingText?: string;
  isStreaming?: boolean;
}

export const FeedbackTipsTab = ({ issues = [], strengths = [], streamingText = "", isStreaming = false }: FeedbackTipsTabProps) => {
  const hasLegacyData = issues.length > 0 || strengths.length > 0;
  const showStreamingView = isStreaming || (streamingText && !hasLegacyData);

  let issuesText = "";
  let strengthsText = "";
  let parts: string[] = [];

  if (showStreamingView) {
    parts = streamingText.split(/##?\s*(?:🌟\s*)?Strengths/i);
    issuesText = parts[0].replace(/##?\s*(?:🚨\s*)?Issues\s*(?:Found)?/iu, "").replace(/[🚨🌟💡]/gu, "").trim();
    if (parts.length > 1) {
      strengthsText = parts[1].replace(/[🚨🌟💡]/gu, "").trim();
    }
  }

  const mdComponents: Components = {
    h1: ({ node: _, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
    h2: ({ node: _, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
    h3: ({ node: _, ...props }) => <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3" {...props} />,
    p: ({ node: _, ...props }) => <p className="text-[15px] text-gray-700 leading-relaxed mb-4" {...props} />,
    ul: ({ node: _, ...props }) => <ul className="space-y-4 mb-8 mt-4" {...props} />,
    li: ({ node: _, className, children, ...props }) => (
      <li className="flex items-start gap-3" {...props}>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
        <div className="text-[15px] text-gray-700 leading-relaxed">{children}</div>
      </li>
    ),
    strong: ({ node: _, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
  };

  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-10"
    >
      {showStreamingView ? (
        <div className="space-y-8">
          <section className="bg-white border border-red-200/50 rounded-3xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6 sm:mb-8 relative z-10">
              <div className="shrink-0 w-10 h-10 rounded-2xl border border-red-200 bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
                Issues Found
                {isStreaming && !strengthsText && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-600 uppercase tracking-widest ml-2 animate-pulse border border-red-200">
                    Live
                  </span>
                )}
              </h3>
            </div>
            <div className="max-w-none relative z-10">
              <ReactMarkdown components={mdComponents}>{issuesText}</ReactMarkdown>
              {isStreaming && !strengthsText && (
                <span className="inline-block w-2 h-4 bg-red-500 ml-1 animate-pulse align-middle" />
              )}
            </div>
          </section>

          {(strengthsText || (isStreaming && parts?.length > 1)) && (
            <section className="bg-white border border-blue-200/50 rounded-3xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6 sm:mb-8 relative z-10">
                <div className="shrink-0 w-10 h-10 rounded-2xl border border-blue-200 bg-blue-50 flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
                  Strengths
                  {isStreaming && strengthsText && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600 uppercase tracking-widest ml-2 animate-pulse border border-blue-200">
                      Live
                    </span>
                  )}
                </h3>
              </div>
              <div className="max-w-none relative z-10">
                <ReactMarkdown components={mdComponents}>{strengthsText}</ReactMarkdown>
                {isStreaming && strengthsText && (
                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse align-middle" />
                )}
              </div>
            </section>
          )}
        </div>
      ) : hasLegacyData ? (
        <>
          {issues.length > 0 && (
            <section className="bg-white border border-red-200/50 rounded-3xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-1.5 h-8 bg-red-500 rounded-full" />
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Issues Found</h3>
                <span className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold border border-red-200 uppercase tracking-widest">
                  {issues.length}
                </span>
              </div>
              <div className="space-y-4 relative z-10">
                {issues.map((issue: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-5 bg-gray-50 border border-red-200/50 rounded-2xl p-5"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center mt-0.5">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-[14.5px] text-gray-700 leading-relaxed font-medium">{issue}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {strengths.length > 0 && (
            <section className="bg-white border border-blue-200/50 rounded-3xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden mt-8">
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Strengths</h3>
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-200 uppercase tracking-widest">
                  {strengths.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {strengths.map((strength: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-5 bg-gray-50 border border-blue-200/50 rounded-2xl p-5"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl border border-blue-200 bg-blue-50 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">{idx + 1}</span>
                    </div>
                    <p className="text-[14.5px] text-gray-700 leading-relaxed font-medium">{strength}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center p-12 text-gray-500 text-sm bg-white rounded-3xl border border-gray-200/50 shadow-sm">
          No feedback available yet...
        </div>
      )}
    </motion.div>
  );
};