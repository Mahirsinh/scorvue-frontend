// JobMatchTab.tsx
import { useState } from "react";
import { Sparkles, FileText, Zap, Hourglass, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch } from "../../../app/store";
import { createSession } from "../../session/sessionSlice";
import type { ResumeData } from "../types";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CoverLetterPDF } from "./CoverLetterPDF";

interface JobMatchTabProps {
  resumeData: ResumeData;
}

export const JobMatchTab = ({ resumeData }: JobMatchTabProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [loadingKeyword, setLoadingKeyword] = useState<string | null>(null);

  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);

  const handleGenerateCoverLetter = async () => {
    if (!resumeData._id) return;
    try {
      setIsGeneratingCL(true);
      setCoverLetter("");

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/resume/${resumeData._id}/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok || !response.body) {
        throw new Error("Error generating cover letter");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let text = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
          setCoverLetter(text);
        }
      }

      toast.success("Cover letter generated!");
    } catch (error) {
      toast.error("Error generating cover letter");
      console.error(error);
    } finally {
      setIsGeneratingCL(false);
    }
  };

  const copyToClipboard = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      toast.success("Copied to clipboard!");
    }
  };

  const handlePractice = async (keyword: string) => {
    try {
      setLoadingKeyword(keyword);
      const action = await dispatch(createSession({
        role: `Focus: ${keyword}`.substring(0, 50),
        level: "Intermediate",
        interviewType: "oral-only",
        count: 3
      })).unwrap();

      toast.success(`Spinning up interview for ${keyword}...`);
      const sessionAction = action as { sessionId?: string; _id?: string };
      navigate(`/interview/${sessionAction.sessionId || sessionAction._id}`);
    } catch (error) {
      toast.error(`Failed to start session: ${error}`);
      setLoadingKeyword(null);
    }
  };

  const matchScore = resumeData?.jdMatchReport?.match_score || 0;
  const matchedKws = resumeData?.jdMatchReport?.matched_skills || [];
  const missingKws = resumeData?.jdMatchReport?.missing_skills || [];
  const totalKws = matchedKws.length + missingKws.length;
  const coverage = totalKws > 0 ? Math.round((matchedKws.length / totalKws) * 100) : 0;
  const explanation = resumeData?.jdMatchReport?.explanation || "Significant gaps between your resume and this role.";

  let colorClass = "text-red-600";
  let borderClass = "border-red-200";
  let bgClass = "bg-red-500";
  let bgLightClass = "bg-red-50";
  let label = "LOW MATCH";

  if (matchScore >= 80) {
    colorClass = "text-blue-600";
    borderClass = "border-blue-200";
    bgClass = "bg-blue-500";
    bgLightClass = "bg-blue-50";
    label = "HIGH MATCH";
  } else if (matchScore >= 50) {
    colorClass = "text-amber-600";
    borderClass = "border-amber-200";
    bgClass = "bg-amber-500";
    bgLightClass = "bg-amber-50";
    label = "MODERATE MATCH";
  }

  const baseScore = matchScore;
  const projectedScore = Math.min(100, baseScore + (missingKws.length > 0 ? 20 : 0));

  return (
    <motion.div
      key="jobmatch"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {!resumeData?.jdMatchReport && !resumeData?.jdText ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200/50 rounded-3xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">No Job Description Provided</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md text-center font-medium">
            To see your match score and keyword gap analysis, please upload your resume again and paste a job description.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Match Score Card */}
          <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-stretch gap-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className={`flex flex-col items-center justify-center w-36 h-28 rounded-2xl border ${borderClass} ${bgLightClass} relative overflow-hidden`}>
              <span className={`text-6xl font-bold ${colorClass} font-display relative z-10 leading-none`}>{matchScore}</span>
              <span className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-widest relative z-10">/ 100</span>
            </div>
            <div className="flex-1 flex flex-col justify-center w-full">
              <div className="mb-5">
                <span className={`px-4 py-1.5 rounded-full border ${borderClass} ${colorClass} text-[10px] font-bold tracking-widest uppercase`}>
                  {label}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div className={`h-full ${bgClass} rounded-full transition-all duration-1000`} style={{ width: `${matchScore}%` }} />
              </div>
              <p className="text-[13px] font-medium text-gray-600 leading-relaxed">{explanation}</p>
            </div>
          </div>

          {/* JD Keyword Coverage & Recommendation */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-5">JD Keyword Coverage</h3>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[13px] text-gray-700 font-bold">Keywords Matched</span>
                <span className="text-[13px] font-bold text-blue-600">{matchedKws.length} / {totalKws}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${coverage}%` }} />
              </div>
              <span className="text-xs font-bold text-blue-600">{coverage}%</span>
            </div>
            <div className="bg-white border border-gray-200/50 rounded-2xl p-6 border-l-4 border-l-indigo-500 shadow-sm">
              <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Recommendation</h4>
              <p className="text-[13px] font-medium text-gray-700 leading-relaxed">
                {coverage >= 80 ? `✅ Excellent keyword coverage (${coverage}%). Your resume aligns very well with the job description.` :
                  coverage >= 50 ? `📊 Moderate keyword coverage (${coverage}%). Add more role-specific terms from the job description to improve your chances.` :
                    `⚠️ Low keyword coverage (${coverage}%). Consider heavily tailoring your resume to include the missing keywords below.`}
              </p>
            </div>
          </div>

          {/* Keyword Gap Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Panel */}
            <div className="bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold tracking-widest text-blue-600 uppercase">Matched</h3>
                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold">{matchedKws.length}</span>
              </div>
              {matchedKws.length === 0 ? (
                <p className="text-[13px] text-gray-500 font-medium italic">No matched keywords.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {matchedKws.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-bold text-blue-600">
                      <CheckCircle className="w-3 h-3 inline mr-1 text-blue-500" />
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Panel */}
            <div className="bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold tracking-widest text-red-600 uppercase">Missing</h3>
                <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold">{missingKws.length}</span>
              </div>
              {missingKws.length === 0 ? (
                <p className="text-[13px] text-gray-500 font-medium italic">No missing keywords found.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {missingKws.map((kw, i) => (
                    <span key={i} className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-red-600 cursor-default transition-all hover:bg-red-100">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      {kw}
                      <button
                        onClick={() => handlePractice(kw)}
                        disabled={loadingKeyword === kw}
                        title={`Start an AI Mock Interview focusing on ${kw}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 bg-red-200 hover:bg-red-300 text-red-700 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {loadingKeyword === kw ? <Hourglass className="w-3 h-3 animate-spin" /> : <>Practice <Zap className="w-3 h-3 fill-current" /></>}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Score Projection */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 ml-1">Score Projection</h3>
            <div className="bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <div className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">CURRENT SCORE</span>
                  <span className="text-5xl font-bold text-gray-900 font-display">{baseScore}</span>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-400 hidden md:block" />
                <div className="flex-1 w-full bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-3 relative z-10">WITH MISSING KEYWORDS</span>
                  <div className="flex items-center gap-3 relative z-10">
                    <span className="text-5xl font-bold text-blue-600 font-display">{projectedScore}</span>
                    <span className="px-2 py-1 bg-blue-200 text-blue-700 text-xs font-bold rounded-lg">+{projectedScore - baseScore}</span>
                  </div>
                </div>
              </div>

              {missingKws.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">TOP KEYWORDS TO ADD:</p>
                  <div className="flex flex-wrap gap-2.5">
                    {missingKws.slice(0, 5).map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-bold text-blue-600">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover Letter Generator */}
          <div className="pt-6 border-t border-gray-200">
            {!coverLetter ? (
              <button
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCL}
                className={`w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold text-[11px] sm:text-sm tracking-wider sm:tracking-widest uppercase transition-all flex items-center justify-center gap-2 sm:gap-3 ${
                  isGeneratingCL ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'
                }`}
              >
                {isGeneratingCL ? (
                  <>
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                    <span className="whitespace-nowrap">Generating Tailored Cover Letter...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="whitespace-nowrap">Generate Tailored Cover Letter</span>
                  </>
                )}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-blue-200 rounded-2xl p-6 shadow-md"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                  <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2 whitespace-nowrap">
                    <Sparkles className="w-5 h-5" /> Tailored Cover Letter
                  </h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center border border-blue-200"
                    >
                      Copy to Clipboard
                    </button>
                    {coverLetter && resumeData?.parsedData?.parsedProfile && (
                      <PDFDownloadLink
                        document={<CoverLetterPDF coverLetterText={coverLetter} personalInfo={resumeData.parsedData.parsedProfile.personal_info} />}
                        fileName="Tailored_Cover_Letter.pdf"
                        className="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 text-center"
                      >
                        {({ loading }) => (
                          <>
                            <span>{loading ? "Generating..." : "Download PDF"}</span>
                          </>
                        )}
                      </PDFDownloadLink>
                    )}
                  </div>
                </div>
                <div className="max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {coverLetter}
                  {isGeneratingCL && <span className="animate-pulse font-bold text-blue-600">|</span>}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};