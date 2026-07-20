// AtsScoreTab.tsx
import { motion } from "framer-motion";
import { Radar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
  Tooltip,
  Legend
);
import type { ResumeData } from "../types";

interface AtsScoreTabProps {
  resumeData?: ResumeData | null;
  isLoading?: boolean;
}

export const AtsScoreTab = ({ resumeData, isLoading = false }: AtsScoreTabProps) => {
  if (isLoading) {
    return (
      <motion.div
        key="ats-skeleton"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skeleton Score Card */}
          <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
            <div className="w-32 h-32 rounded-full border-8 border-gray-200/50 animate-pulse mb-6" />
            <div className="h-4 w-20 bg-gray-200 rounded-full animate-pulse mb-3" />
            <div className="h-3 w-32 bg-gray-200 rounded-full animate-pulse" />
          </div>

          {/* Skeleton Score Breakdown */}
          <div className="md:col-span-2 bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse mb-8" />
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-36 h-3 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full animate-pulse" />
                  <div className="w-10 h-3 bg-gray-200 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton Radar Chart */}
        <div>
          <div className="h-4 w-28 bg-gray-200 rounded-full animate-pulse mb-4 mt-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] shadow-sm">
              <div className="w-48 h-48 rounded-full border-4 border-gray-200/50 animate-pulse" />
            </div>
            <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] shadow-sm">
              <div className="w-48 h-48 rounded-full border-20 border-gray-200/50 animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  const atsScore =
    resumeData?.scores?.ats ||
    resumeData?.analysisReport?._v2?.scores?.ats_score ||
    0;

  const rawTextLength = resumeData?.parsedData?.rawText?.split(/\s+/).length || 400;

  const readabilityScore =
    resumeData?.analysisReport?._v2?.analysis?.readability_score || 100;

  const getRadarData = () => {
    const techLen = resumeData?.analysisReport?._v2?.skills?.technical?.length || resumeData?.analysisReport?.extracted_data?.skills?.technical?.length || 0;
    const softLen = resumeData?.analysisReport?._v2?.skills?.soft?.length || resumeData?.analysisReport?.extracted_data?.skills?.soft?.length || 0;
    const expLen = resumeData?.parsedData?.parsedProfile?.experience?.length || resumeData?.analysisReport?.extracted_data?.experience?.length || 0;
    const eduLen = resumeData?.parsedData?.parsedProfile?.education?.length || resumeData?.analysisReport?.extracted_data?.education?.length || 0;

    return [
      Math.round(Math.min(100, Math.max(40, (techLen / 12) * 100))),
      Math.round(Math.min(100, Math.max(50, (softLen / 8) * 100))),
      Math.round(Math.min(100, Math.max(40, (expLen / 4) * 100))),
      eduLen > 0 ? 95 : 30,
      atsScore || 60
    ];
  };

  const getContentBalance = () => {
    const text = resumeData?.parsedData?.rawText?.toLowerCase() || "";
    if (!text) return [35, 45, 15, 5];

    const actionVerbsMatch = text.match(/\b(led|managed|developed|created|improved|increased|designed|built|optimized|implemented|reduced|resolved|spearheaded|architected)\b/g);
    const actionVerbs = actionVerbsMatch ? actionVerbsMatch.length : 5;

    const metricsMatch = text.match(/\b(\d+%|\$\d+|\d+[kKmM]|increased by|reduced by)\b/gi);
    const metricsCount = metricsMatch ? metricsMatch.length : 2;

    const fillerMatch = text.match(/\b(helped|worked|did|was|were|assisted|responsible for|duties included)\b/g);
    const fillerCount = fillerMatch ? fillerMatch.length : 5;

    const totalWords = text.split(/\s+/).length || 1;
    const keywordsCount = Math.max(5, (totalWords * 0.1) - actionVerbs - metricsCount - fillerCount);

    const total = actionVerbs + keywordsCount + metricsCount + fillerCount || 1;

    return [
      Math.max(5, Math.round((actionVerbs / total) * 100)),
      Math.max(15, Math.round((keywordsCount / total) * 100)),
      Math.max(5, Math.round((metricsCount / total) * 100)),
      Math.max(2, Math.round((fillerCount / total) * 100))
    ];
  };

  const radarData = getRadarData();
  const balanceData = getContentBalance();

  const text = resumeData?.parsedData?.rawText || "";
  const totalSentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const avgSentenceLength = Math.max(5, Math.round(rawTextLength / totalSentences));

  const contactScore = resumeData?.parsedData?.parsedProfile?.personal_info?.email && resumeData?.parsedData?.parsedProfile?.personal_info?.phone ? 20 : 10;
  const skillsScore = (resumeData?.analysisReport?._v2?.skills?.technical?.length || 0) > 0 ? 20 : 10;
  const eduScore = (resumeData?.parsedData?.parsedProfile?.education?.length || 0) > 0 ? 20 : 0;
  const expScore = (resumeData?.parsedData?.parsedProfile?.experience?.length || 0) > 0 ? 20 : 0;
  const actionVerbsMatch = text.toLowerCase().match(/\b(led|managed|developed|created|improved|increased|designed|built|optimized|implemented|reduced|resolved|spearheaded|architected)\b/g);
  const actionVerbsCount = actionVerbsMatch ? actionVerbsMatch.length : 5;
  const actionVerbsScoreCalculated = Math.min(20, actionVerbsCount * 2);
  const lengthScore = rawTextLength > 200 && rawTextLength < 800 ? 20 : 10;

  const scoreBreakdown = [
    { label: "Contact Information", score: contactScore, max: 20, color: "bg-blue-500" },
    { label: "Skills", score: skillsScore, max: 20, color: "bg-blue-500" },
    { label: "Education", score: eduScore, max: 20, color: "bg-indigo-500" },
    { label: "Work Experience", score: expScore, max: 20, color: "bg-indigo-500" },
    { label: "Action Verbs", score: actionVerbsScoreCalculated, max: 20, color: "bg-blue-500" },
    { label: "Resume Length", score: lengthScore, max: 20, color: "bg-indigo-500" },
  ];

  const readabilityGrade = readabilityScore > 80 ? "Excellent" : readabilityScore > 60 ? "Good" : "Needs Work";
  const activeVoicePercent = Math.min(100, Math.max(40, actionVerbsCount * 5));

  const generatedFeedback = [
    avgSentenceLength > 20 ? `Sentences are a bit long (avg ${avgSentenceLength} words).` : `Good sentence length (avg ${avgSentenceLength} words).`,
    actionVerbsCount > 5 ? `Strong action verb usage (${actionVerbsCount} verbs).` : `Consider using more action verbs (found ${actionVerbsCount}).`,
    activeVoicePercent > 50 ? `Good active voice ratio (${activeVoicePercent}%).` : `Try to use more active voice.`,
    rawTextLength > 800 ? `Resume is a bit long (${rawTextLength} words).` : rawTextLength < 200 ? `Resume is too short (${rawTextLength} words).` : `Good word count (${rawTextLength} words).`,
  ];

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: "EXCELLENT", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", shadow: "shadow-emerald-500/20", gradient: "from-emerald-50" };
    if (score >= 60) return { label: "GOOD", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", shadow: "shadow-blue-500/20", gradient: "from-blue-50" };
    if (score >= 40) return { label: "FAIR", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", shadow: "shadow-amber-500/20", gradient: "from-amber-50" };
    return { label: "NEEDS WORK", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", shadow: "shadow-red-500/20", gradient: "from-red-50" };
  };
  const scoreConfig = getScoreLabel(atsScore);

  return (
    <motion.div
      key="ats"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Top Section: Score & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${scoreConfig.gradient} to-transparent pointer-events-none`} />
          <div className="relative w-36 h-36 mb-6 z-10">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${atsScore * 2.827} 282.7`}
                className={`${scoreConfig.color} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 font-display leading-none">{atsScore}</span>
              <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mt-1">/100</span>
            </div>
          </div>
          <span className={`px-4 py-1.5 rounded-full border ${scoreConfig.border} ${scoreConfig.bg} text-[10px] font-bold ${scoreConfig.color} tracking-widest uppercase mb-3 z-10`}>
            {scoreConfig.label}
          </span>
          <p className="text-[13px] text-gray-500 font-medium z-10">
            {rawTextLength} words{" "}
            <span className={rawTextLength > 800 || rawTextLength < 200 ? "text-amber-600 font-bold" : "text-blue-600 font-bold"}>
              · {rawTextLength > 800 ? "too long" : rawTextLength < 200 ? "too short" : "good length"}
            </span>
          </p>
        </div>

        {/* Score Breakdown Card */}
        <div className="md:col-span-2 bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-8">Score Breakdown</h3>
          <div className="space-y-5 relative z-10">
            {scoreBreakdown.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <span className="w-full md:w-40 text-[13px] font-bold text-gray-700">
                  {item.label}
                </span>
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-bold text-gray-600">
                    {item.score}/{item.max}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Section: Visual Insights */}
      <div>
        <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 mt-8 ml-1">Visual Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            <h4 className="text-[10px] font-bold text-gray-500 mb-6 w-full text-left uppercase tracking-widest">
              Competency Radar
            </h4>
            <div className="w-full max-w-[250px] aspect-square relative z-10">
              <Radar
                data={{
                  labels: [
                    "Tech Skills",
                    "Soft Skills",
                    "Experience",
                    "Education",
                    "Format",
                  ],
                  datasets: [
                    {
                      data: radarData,
                      backgroundColor: "rgba(59, 130, 246, 0.15)",
                      borderColor: "#3b82f6",
                      borderWidth: 2,
                      pointBackgroundColor: "#3b82f6",
                    },
                  ],
                }}
                options={{
                  scales: {
                    r: {
                      min: 0,
                      max: 100,
                      angleLines: { color: "rgba(0,0,0,0.05)" },
                      grid: { color: "rgba(0,0,0,0.05)" },
                      pointLabels: { color: "#6b7280", font: { size: 10, family: "Inter", weight: 'bold' } },
                      ticks: { display: false },
                    },
                  },
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: true,
                }}
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200/50 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            <h4 className="text-[10px] font-bold text-gray-500 mb-6 w-full text-left uppercase tracking-widest">
              Content Balance
            </h4>
            <div className="w-full max-w-[180px] aspect-square relative z-10 mb-8">
              <Doughnut
                data={{
                  labels: ["Action Verbs", "Keywords", "Metrics", "Filler"],
                  datasets: [
                    {
                      data: balanceData,
                      backgroundColor: ["#3b82f6", "#818cf8", "#f59e0b", "#ef4444"],
                      borderWidth: 0,
                      hoverOffset: 6,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  cutout: "75%",
                  layout: {
                    padding: 10,
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "rgba(255,255,255,0.95)",
                      titleColor: "#1f2937",
                      bodyColor: "#4b5563",
                      borderColor: "#e5e7eb",
                      borderWidth: 1,
                      padding: 12,
                      displayColors: true,
                      boxPadding: 4,
                      usePointStyle: true,
                    }
                  },
                  maintainAspectRatio: true,
                }}
              />
            </div>

            {/* Custom HTML Legend */}
            <div className="w-full grid grid-cols-2 gap-y-4 gap-x-2 z-10 mt-auto">
              {[
                { label: "Action Verbs", color: "text-blue-600", bg: "bg-blue-500", shadow: "shadow-blue-500/40", value: balanceData[0] },
                { label: "Keywords", color: "text-indigo-600", bg: "bg-indigo-500", shadow: "shadow-indigo-500/40", value: balanceData[1] },
                { label: "Metrics", color: "text-amber-600", bg: "bg-amber-500", shadow: "shadow-amber-500/40", value: balanceData[2] },
                { label: "Filler", color: "text-red-600", bg: "bg-red-500", shadow: "shadow-red-500/40", value: balanceData[3] },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.bg} shadow-md ${item.shadow} shrink-0`} />
                  <span className="text-xs font-bold text-gray-600 truncate">{item.label}</span>
                  <span className={`text-xs font-bold ${item.color} ml-auto`}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Readability & Scannability */}
      <div className="pb-8">
        <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 mt-8 ml-1">
          Readability & Scannability
        </h3>

        {/* Metric Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200/50 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 text-center">
              READABILITY SCORE
            </span>
            <div className="px-6 py-2 bg-blue-50 border border-blue-200 rounded-xl text-2xl font-bold text-blue-600 font-display">
              {readabilityScore}
            </div>
          </div>
          <div className="bg-white border border-gray-200/50 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 text-center">
              GRADE
            </span>
            <div className={`text-2xl font-bold font-display ${readabilityScore > 80 ? 'text-emerald-600' : readabilityScore > 60 ? 'text-blue-600' : 'text-amber-600'}`}>
              {readabilityGrade}
            </div>
          </div>
          <div className="bg-white border border-gray-200/50 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 text-center">
              AVG SENTENCE LENGTH
            </span>
            <div className="text-2xl font-bold text-gray-900 font-display">
              {avgSentenceLength} <span className="text-sm font-bold text-gray-400 ml-1">words</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200/50 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 text-center">
              ACTIVE VOICE
            </span>
            <div className={`text-2xl font-bold font-display ${activeVoicePercent > 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {activeVoicePercent}%
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-6">Feedback</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {generatedFeedback.map((fb, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-start gap-4 transition-all hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <p className="text-[14px] text-gray-700 font-medium leading-relaxed pt-1">{fb}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};