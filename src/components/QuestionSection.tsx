// QuestionSection.tsx
import React from "react";

interface QuestionSectionProps {
    index: number;
    text: string;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ index, text }) => {
    return (
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-200/50 p-10 mb-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M12 2v20M2 12h20M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/></svg>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
                    Question {index + 1}
                </span>
                <span className="text-xs text-gray-400 font-medium">•</span>
                <span className="text-xs text-gray-500 font-medium">Technical Briefing</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold leading-relaxed text-gray-900 tracking-tight max-w-4xl">
                {text}
            </h2>
        </div>
    );
};

export default QuestionSection;