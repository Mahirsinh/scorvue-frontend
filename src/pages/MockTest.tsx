// pages/MockTest.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createSession } from "../features/session/sessionSlice";
import type { AppDispatch } from "../app/store";
import NewInterviewForm from "../components/NewInterviewForm";
import { ROLES, LEVELS, TYPES, COUNTS } from "../constants/interview";

const MockTest = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    role: ROLES[0],
    level: LEVELS[0],
    interviewType: TYPES[1].value, // matches Dashboard's default (coding-mix)
    count: COUNTS[0],
    company: "general",
    companyTrack: "general",
    resumeId: "",
  });

  const onChange = (e: { target: { name: string; value: string | number } }) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!formData.role) {
      toast.error("Please choose a role before starting.");
      return;
    }

    setIsProcessing(true);
    try {
      // Same thunk Dashboard.tsx already uses successfully — hits /api/sessions,
      // which matches the Session model (role, level, interviewType, count, resumeId).
      const result = await dispatch(createSession(formData)).unwrap();
      const sessionId = result?.sessionId || result?._id;

      if (!sessionId) {
        throw new Error("No session ID returned");
      }
      navigate(`/interview/${sessionId}`);
    } catch (error: any) {
      console.error("Failed to start mock test:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to start your mock test. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <NewInterviewForm
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default MockTest;
