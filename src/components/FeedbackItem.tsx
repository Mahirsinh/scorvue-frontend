// FeedbackItem.tsx
import React from "react";
import { Ghost, Brain, FileText, Mic, Sparkles, CheckCircle, Award, Code } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { FeedbackItemProps } from "../types/components";
import { sanitizeQuestionText, formatIdealAnswer } from "../utils/formatters";
import SpeechAnalyticsPanel from "./SpeechAnalyticsPanel";

const FeedbackItem: React.FC<FeedbackItemProps> = ({ question, index }) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-blue-600";
        if (score >= 40) return "text-amber-600";
        return "text-red-600";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-emerald-50 border-emerald-200";
        if (score >= 60) return "bg-blue-50 border-blue-200";
        if (score >= 40) return "bg-amber-50 border-amber-200";
        return "bg-red-50 border-red-200";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Fair";
        return "Needs Work";
    };

    return (
        <div className="bg-white border border-gray-200/50 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group/item">
            <div className="p-8 sm:p-10 space-y-8">
                {/* Question Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                                Q{index + 1}
                            </span>
                            <div className="h-px w-12 bg-gray-200"></div>
                            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">
                                {question.questionType || 'Technical'}
                            </span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                            {sanitizeQuestionText(question.questionText)}
                        </h4>
                    </div>

                    <div className="flex gap-3 shrink-0 w-full lg:w-auto">
                        <div className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl border bg-gray-50 border-gray-200 flex justify-center items-center gap-2">
                            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">Score</span>
                            <span className={`text-sm font-bold ${getScoreColor(question.technicalScore || 0)}`}>
                                {question.technicalScore || 0}%
                            </span>
                        </div>

                        <div className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl border bg-gray-50 border-gray-200 flex justify-center items-center gap-2">
                            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confidence</span>
                            <span className={`text-sm font-bold ${getScoreColor(question.confidenceScore || 0)}`}>
                                {question.confidenceScore || 0}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Submission */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 ml-1">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Your Response</span>
                        <div className="h-px grow bg-gray-200"></div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden transition-all group-hover/item:border-gray-300">
                        {question.userSubmittedCode && question.userSubmittedCode !== 'undefined' && (
                            <div className="p-6 sm:p-8 border-b border-gray-200 relative">
                                <div className="absolute top-4 right-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-70">
                                    <Code className="w-3.5 h-3.5 inline mr-1" />
                                    Code
                                </div>
                                <pre className="text-xs sm:text-sm font-mono text-gray-700 overflow-x-auto pb-2 leading-relaxed">
                                    {question.userSubmittedCode}
                                </pre>
                            </div>
                        )}

                        {question.userAnswerText && (
                            <div className="p-6 sm:p-8 relative">
                                <div className="absolute top-4 right-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-70">
                                    <Mic className="w-3.5 h-3.5 inline mr-1" />
                                    Transcript
                                </div>
                                <p className="text-sm sm:text-base text-gray-600 italic leading-relaxed font-medium pt-4 sm:pt-0">
                                    « {question.userAnswerText} »
                                </p>
                            </div>
                        )}

                        {!question.userAnswerText && (!question.userSubmittedCode || question.userSubmittedCode === 'undefined') && (
                            <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <Ghost className="w-10 h-10 mb-4 mx-auto text-gray-300" />
                                No response recorded
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Insights and Ideal Implementation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-1">
                            <Brain className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">AI Feedback</span>
                        </div>
                        <div className="bg-blue-50 p-6 sm:p-8 rounded-2xl text-sm sm:text-base text-gray-700 border-l-4 border-blue-500 leading-relaxed">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                                    li: ({ children }) => <li className="text-gray-700">{children}</li>,
                                    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                                    code: ({ children }) => <code className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                                }}
                            >
                                {question.aiFeedback || "No feedback available"}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-1">
                            <Award className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Ideal Answer</span>
                        </div>
                        <div className="bg-indigo-50 p-6 sm:p-8 rounded-2xl text-sm sm:text-[13px] border border-indigo-100 overflow-x-auto leading-relaxed">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-700">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-gray-700">{children}</ul>,
                                    li: ({ children }) => <li className="text-gray-700">{children}</li>,
                                    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                                    code: ({ children }) => <code className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                                }}
                            >
                                {formatIdealAnswer(question.idealAnswer) || "No ideal answer provided"}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Speech Analytics */}
                {question.speechMetrics && (
                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3 ml-1 mb-4">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Speech Analytics</span>
                            <div className="h-px grow bg-gray-200"></div>
                        </div>
                        <SpeechAnalyticsPanel metrics={question.speechMetrics} />
                    </div>
                )}

                {/* Status Badge */}
                {question.isEvaluated && (
                    <div className="flex items-center gap-2 pt-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-600">Evaluated</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackItem;