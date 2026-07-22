// pages/MockTest.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NewInterviewForm from "../components/NewInterviewForm";
import { interviewApi } from "../services/interviewApi";

// Shape mirrors what NewInterviewForm reads/writes via formData + onChange.
// Adjust field names here if your backend/session creation expects different keys.
interface MockTestFormData {
  role: string;
  level: string;
  count: number;
  interviewType: string;
  company: string;
  companyTrack: string;
  resumeId: string;
}

const DEFAULT_FORM_DATA: MockTestFormData = {
  role: "",
  level: "mid",
  count: 5,
  interviewType: "oral-only",
  company: "general",
  companyTrack: "general",
  resumeId: "",
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isProcessing) return;
  if (!formData.role) {
    toast.error("Please choose a role before starting.");
    return;
  }
  setIsProcessing(true);
  try {
    const { data } = await interviewApi.createPreference({
      interviewType: formData.interviewType,
      role: formData.role,
      experienceLevel: formData.level,
      difficulty: formData.level, // or a separate difficulty field if you track one
      language: "english",        // or whatever default/selection you use
      focusAreas: [],              // populate if the form collects this elsewhere
      resumeFileId: formData.resumeId || null,
      permissions: {
        camera: false,
        microphone: false,
        speaker: false,
      },
    });

    const sessionId = data?.sessionId || data?._id;
    if (!sessionId) {
      throw new Error("No session ID returned");
    }
    navigate(`/interview/${sessionId}`);
  } catch (error: any) {
    console.error("Failed to start mock test:", error);
    if (error?.response?.data?.error?.code === "UPGRADE_REQUIRED") {
      toast.warning(error.response.data.error.message || "You've used your free interview.");
      navigate("/plans");
      return;
    }
    toast.error(error?.response?.data?.message || "Failed to start your mock test. Please try again.");
    setIsProcessing(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto py-4">
      <NewInterviewForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default MockTest;
