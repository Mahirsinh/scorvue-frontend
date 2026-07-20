// ResumeHistoryWidget.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { TooltipItem, ChartOptions } from "chart.js";
import { getUserResumes } from "../../../services/resumeApi";
import type { ResumeData } from "../types";
import { DocumentTextIcon, ChartBarIcon } from "@heroicons/react/24/outline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const ResumeHistoryWidget = () => {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await getUserResumes();
        const sorted = data.sort((a: ResumeData, b: ResumeData) =>
          new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
        );
        setResumes(sorted);
      } catch (error) {
        console.error("Failed to fetch resume history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[200px]">
        <div className="w-8 h-8 rounded-full border-3 border-blue-500/20 border-t-blue-500 animate-spin mb-3" />
        <span className="text-gray-400 text-xs font-medium">Loading history...</span>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[200px] text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <DocumentTextIcon className="w-7 h-7 text-gray-400" />
        </div>
        <h3 className="text-gray-600 font-semibold text-sm">No resume history</h3>
        <p className="text-gray-400 text-xs mt-1">Upload a resume to track your ATS score</p>
      </div>
    );
  }

  const chartData = resumes.map(r => {
    const atsScore = r.scores?.ats || r.analysisReport?._v2?.scores?.ats_score || 0;
    return atsScore;
  });

  const labels = resumes.map(r => {
    const d = new Date(r.createdAt || "");
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const data = {
    labels,
    datasets: [
      {
        label: "ATS Score",
        data: chartData,
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "#3b82f6",
        borderWidth: 2,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#3b82f6",
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleFont: { family: "Inter", size: 11, weight: 600 },
        titleColor: "#1e293b",
        bodyFont: { family: "Inter", size: 12, weight: "bold" as const },
        bodyColor: "#3b82f6",
        padding: 8,
        cornerRadius: 6,
        displayColors: false,
        borderColor: "#e2e8f0",
        borderWidth: 1,
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            return `ATS Score: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#94a3b8",
          font: { family: "Inter", size: 9 },
          stepSize: 25,
        },
        border: { dash: [3, 3] },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#94a3b8",
          font: { family: "Inter", size: 8 },
          maxTicksLimit: 5,
          maxRotation: 20,
          minRotation: 0,
        },
      },
    },
  };

  const latestScore = chartData[chartData.length - 1] || 0;
  const averageScore = chartData.reduce((a, b) => a + b, 0) / chartData.length || 0;
  const highestScore = Math.max(...chartData) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/30">
            <ChartBarIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">ATS Score History</h3>
            <p className="text-gray-400 text-[9px] font-medium">Track your resume improvements</p>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[8px] font-bold text-blue-600">
          {resumes.length} Scans
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
          <div className="text-lg font-bold text-blue-600">{latestScore}</div>
          <div className="text-[7px] text-gray-500 uppercase tracking-wider">Latest</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
          <div className="text-lg font-bold text-emerald-600">{Math.round(averageScore)}</div>
          <div className="text-[7px] text-gray-500 uppercase tracking-wider">Average</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
          <div className="text-lg font-bold text-purple-600">{highestScore}</div>
          <div className="text-[7px] text-gray-500 uppercase tracking-wider">Best</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[140px] w-full">
        <Line data={data} options={options} />
      </div>

      <div className="mt-2 pt-1.5 border-t border-gray-100 flex justify-between items-center">
        <span className="text-[7px] text-gray-400">Last {resumes.length} scans</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <span className="text-[7px] text-gray-500 font-medium">ATS Score</span>
        </div>
      </div>
    </motion.div>
  );
};