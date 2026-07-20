// pages/InterviewPreferences.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  SparklesIcon,
  DocumentTextIcon,
  UserCircleIcon,
  BriefcaseIcon,
  ChartBarIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  ServerIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { interviewApi } from "../services/interviewApi";
import axios from "axios";

type InterviewType = 
  | "resume-jd"
  | "resume-only"
  | "jd-only"
  | "topic-based"
  | "coding"
  | "system-design"
  | "hr";

type ExperienceLevel = "fresher" | "0-1" | "1-3" | "3-5" | "5+";
type Difficulty = "easy" | "medium" | "hard" | "faang";
type Language = "english" | "hindi" | "mix";

interface FocusArea {
  id: string;
  label: string;
  checked: boolean;
}

interface ExtractedResumeData {
  extractedInfo: {
    role: string | null;
    experienceLevel: ExperienceLevel | null;
    yearsOfExperience: number;
    skills: string[];
    technologies: string[];
    summary: string | null;
    education?: string[];
  };
  suggestedDifficulty: Difficulty;
  suggestedRole: string | null;
  suggestedExperienceLevel: ExperienceLevel | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ✅ Helper function to get duration label for difficulty
const getDurationLabel = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'easy': return '5 min';
    case 'medium': return '15 min';
    case 'hard': return '25 min';
    case 'faang': return '30 min';
    default: return '15 min';
  }
};

const InterviewPreferences = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // State for each step
  const [interviewType, setInterviewType] = useState<InterviewType>("resume-jd");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileId, setResumeFileId] = useState<string | null>(null);
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("fresher");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [language, setLanguage] = useState<Language>("english");
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([
    { id: "technical", label: "Technical", checked: true },
    { id: "hr", label: "HR", checked: false },
    { id: "behavioural", label: "Behavioural", checked: false },
    { id: "coding", label: "Coding", checked: false },
    { id: "problem-solving", label: "Problem Solving", checked: false },
    { id: "communication", label: "Communication", checked: false },
    { id: "leadership", label: "Leadership", checked: false },
    { id: "system-design", label: "System Design", checked: false },
  ]);

  const [autoFilled, setAutoFilled] = useState({
    role: false,
    experienceLevel: false,
    difficulty: false,
  });

  // Device permissions
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    speaker: false,
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const roles = [
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Java Developer",
    ".NET Developer",
    "Python Developer",
    "React Developer",
    "Data Analyst",
    "DevOps Engineer",
    "ML Engineer",
  ];

  const interviewTypes = [
    { id: "resume-jd", label: "Resume + Job Description", recommended: true, icon: DocumentTextIcon, requiresResume: true, requiresJd: true },
    { id: "resume-only", label: "Resume Only", icon: DocumentTextIcon, requiresResume: true, requiresJd: false },
    { id: "jd-only", label: "Job Description Only", icon: BriefcaseIcon, requiresResume: false, requiresJd: true },
    { id: "topic-based", label: "Topic-based Practice", icon: SparklesIcon, requiresResume: false, requiresJd: false },
    { id: "coding", label: "Coding Interview", icon: CodeBracketIcon, requiresResume: false, requiresJd: false },
    { id: "system-design", label: "System Design", icon: ServerIcon, requiresResume: false, requiresJd: false },
    { id: "hr", label: "HR Interview", icon: UserGroupIcon, requiresResume: false, requiresJd: false },
  ];

  const experienceLevels = [
    { id: "fresher", label: "Fresher" },
    { id: "0-1", label: "0-1 Years" },
    { id: "1-3", label: "1-3 Years" },
    { id: "3-5", label: "3-5 Years" },
    { id: "5+", label: "5+ Years" },
  ];

  const difficulties = [
    { id: "easy", label: "Easy", color: "bg-emerald-500" },
    { id: "medium", label: "Medium", color: "bg-amber-500" },
    { id: "hard", label: "Hard", color: "bg-orange-500" },
    { id: "faang", label: "FAANG", color: "bg-red-500" },
  ];

  const languages = [
    { id: "english", label: "English" },
    { id: "hindi", label: "Hindi" },
    { id: "mix", label: "Mix (English + Hindi)" },
  ];

  // Check if current interview type requires resume
  const requiresResume = interviewTypes.find(t => t.id === interviewType)?.requiresResume ?? false;
  const requiresJd = interviewTypes.find(t => t.id === interviewType)?.requiresJd ?? false;

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const toggleFocusArea = (id: string) => {
    setFocusAreas(prev =>
      prev.map(area =>
        area.id === id ? { ...area, checked: !area.checked } : area
      )
    );
  };

  const EXTRACT_POLL_INTERVAL_MS = 2000;
  const EXTRACT_POLL_MAX_ATTEMPTS = 20;

  const pollForExtraction = async (
    resumeId: string,
    toastId: string | number
  ): Promise<ExtractedResumeData> => {
    for (let attempt = 1; attempt <= EXTRACT_POLL_MAX_ATTEMPTS; attempt++) {
      const extractResponse = await axios.get(
        `${API_URL}/resume/${resumeId}/extract`,
        { withCredentials: true, validateStatus: () => true }
      );

      console.log(`Extract response (attempt ${attempt}):`, extractResponse.status, extractResponse.data);

      const responseData = extractResponse.data;

      if (extractResponse.status === 202) {
        toast.update(toastId, {
          render: `Analyzing your resume... (attempt ${attempt}/${EXTRACT_POLL_MAX_ATTEMPTS})`,
          type: "info",
          isLoading: true,
        });
        await new Promise((resolve) => setTimeout(resolve, EXTRACT_POLL_INTERVAL_MS));
        continue;
      }

      if (!responseData?.success) {
        throw new Error(responseData?.message || "Extraction failed");
      }

      const extractedData = responseData.data as ExtractedResumeData;
      if (!extractedData) {
        throw new Error("No extraction data returned");
      }
      return extractedData;
    }

    throw new Error(
      "Resume processing is taking longer than expected. You can still fill details manually."
    );
  };

  const uploadAndExtractResume = async (file: File) => {
    setIsExtracting(true);
    const toastId = toast.loading("Uploading & analyzing resume...");

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const uploadResponse = await axios.post(
        `${API_URL}/resume/upload`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      console.log('Upload response:', uploadResponse.data);

      if (!uploadResponse.data?.success) {
        throw new Error(uploadResponse.data?.message || 'Upload failed');
      }

      const resumeId = uploadResponse.data.data?.resumeId;
      if (!resumeId) {
        throw new Error("No resume ID returned from server");
      }

      setResumeFileId(resumeId);

      toast.update(toastId, { render: "Extracting your profile...", type: "info", isLoading: true });

      const extractedData = await pollForExtraction(resumeId, toastId);

      const suggestedRole = extractedData.suggestedRole || extractedData.extractedInfo?.role || null;
      const suggestedExperienceLevel = extractedData.suggestedExperienceLevel || extractedData.extractedInfo?.experienceLevel || null;
      const suggestedDifficulty = extractedData.suggestedDifficulty || getDifficultyFromExperience(suggestedExperienceLevel);

      if (suggestedRole) {
        const roleExists = roles.some(r => r.toLowerCase() === suggestedRole.toLowerCase());
        if (roleExists) {
          const matchedRole = roles.find(r => r.toLowerCase() === suggestedRole.toLowerCase());
          setSelectedRole(matchedRole || suggestedRole);
          setCustomRole("");
        } else {
          setCustomRole(suggestedRole);
          setSelectedRole("");
        }
        setAutoFilled(prev => ({ ...prev, role: true }));
        toast.info(`Role auto-filled: ${suggestedRole}`);
      }

      if (suggestedExperienceLevel) {
        setExperienceLevel(suggestedExperienceLevel);
        setAutoFilled(prev => ({ ...prev, experienceLevel: true }));
      }

      if (suggestedDifficulty) {
        setDifficulty(suggestedDifficulty);
        setAutoFilled(prev => ({ ...prev, difficulty: true }));
      }

      const skills = extractedData.extractedInfo?.skills || [];
      if (skills.length > 0) {
        const skillDisplay = skills.slice(0, 5).join(', ');
        toast.success(`Found ${skills.length} skills: ${skillDisplay}${skills.length > 5 ? '...' : ''}`);
      }

      toast.update(toastId, { 
        render: "✅ Resume analyzed! Fields auto-filled.", 
        type: "success", 
        isLoading: false,
        autoClose: 3000,
      });

    } catch (error: any) {
      console.error("Extraction error:", error);
      
      if (error?.response?.status === 202) {
        toast.update(toastId, {
          render: "⏳ Resume is being processed. You can continue manually.",
          type: "warning",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to analyze resume. You can still fill details manually.";
        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const getDifficultyFromExperience = (level?: string | null): Difficulty => {
    switch (level) {
      case "fresher":
      case "0-1":
        return "easy";
      case "1-3":
        return "medium";
      case "3-5":
        return "hard";
      case "5+":
        return "faang";
      default:
        return "medium";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload PDF or DOCX file");
        return;
      }
      
      if (currentStep === 1) {
        setResumeFile(file);
        setValidationErrors(prev => ({ ...prev, resume: "" }));
        await uploadAndExtractResume(file);
      } else if (currentStep === 2) {
        setJdFile(file);
        setValidationErrors(prev => ({ ...prev, jd: "" }));
      }
    }
  };

  const testCamera = async () => {
    try {
      setIsTesting(true);
      setTestStatus(prev => ({ ...prev, camera: "Testing..." }));
      
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setPermissions(prev => ({ ...prev, camera: true }));
      setTestStatus(prev => ({ ...prev, camera: "✅ Working" }));
      toast.success("Camera is working!");
    } catch (error) {
      console.error("Camera error:", error);
      setPermissions(prev => ({ ...prev, camera: false }));
      setTestStatus(prev => ({ ...prev, camera: "❌ Failed" }));
      toast.error("Camera access denied. Please allow camera permissions.");
    } finally {
      setIsTesting(false);
    }
  };

  const testMicrophone = async () => {
    try {
      setIsTesting(true);
      setTestStatus(prev => ({ ...prev, microphone: "Testing..." }));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        setPermissions(prev => ({ ...prev, microphone: true }));
        setTestStatus(prev => ({ ...prev, microphone: "✅ Working" }));
        toast.success("Microphone is working!");
      } else {
        setTestStatus(prev => ({ ...prev, microphone: "❌ No audio track" }));
        toast.warning("No audio track detected.");
      }
      
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Microphone error:", error);
      setPermissions(prev => ({ ...prev, microphone: false }));
      setTestStatus(prev => ({ ...prev, microphone: "❌ Failed" }));
      toast.error("Microphone access denied. Please allow microphone permissions.");
    } finally {
      setIsTesting(false);
    }
  };

  const testSpeaker = async () => {
    try {
      setIsTesting(true);
      setTestStatus(prev => ({ ...prev, speaker: "Testing..." }));
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.1;
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
        setPermissions(prev => ({ ...prev, speaker: true }));
        setTestStatus(prev => ({ ...prev, speaker: "✅ Working" }));
        toast.success("Speaker is working!");
        setIsTesting(false);
      }, 1000);
    } catch (error) {
      console.error("Speaker error:", error);
      setPermissions(prev => ({ ...prev, speaker: false }));
      setTestStatus(prev => ({ ...prev, speaker: "❌ Failed" }));
      toast.error("Speaker test failed.");
      setIsTesting(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch(step) {
      case 0:
        return true;
      case 1:
        if (requiresResume && !resumeFile) {
          errors.resume = "Please upload your resume";
          toast.error("Please upload your resume");
          return false;
        }
        return true;
      case 2:
        if (requiresJd && !jdText.trim() && !jdFile) {
          errors.jd = "Please provide a job description";
          toast.error("Please provide a job description");
          return false;
        }
        return true;
      case 3:
        if (!selectedRole && !customRole.trim()) {
          errors.role = "Please select or enter a role";
          toast.error("Please select or enter a role");
          return false;
        }
        return true;
      case 4:
        return true;
      case 5:
        if (!focusAreas.some(area => area.checked)) {
          errors.focus = "Please select at least one focus area";
          toast.error("Please select at least one focus area");
          return false;
        }
        return true;
      case 6:
        if (!permissions.camera || !permissions.microphone) {
          errors.permissions = "Camera and Microphone are required";
          toast.warning("Please test and enable Camera & Microphone");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    const visibleSteps = getVisibleSteps();
    const currentIndex = visibleSteps.indexOf(currentStep);
    if (currentIndex < visibleSteps.length - 1) {
      setCurrentStep(visibleSteps[currentIndex + 1]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const response = await axios.post(
        `${API_URL}/resume/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('Upload response:', response.data);
      
      if (response.data.success && response.data.data) {
        const resumeId = response.data.data.resumeId;
        if (resumeId) {
          return resumeId;
        }
        throw new Error('No resume ID returned from server');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to upload file';
      throw new Error(errorMessage);
    }
  };

  const handleStartInterview = async () => {
    if (!permissions.camera || !permissions.microphone) {
      toast.warning("Please test and enable Camera & Microphone before starting");
      setCurrentStep(6);
      return;
    }

    if (requiresResume && !resumeFile) {
      toast.warning("Please upload your resume");
      setCurrentStep(1);
      return;
    }

    if (requiresJd && !jdText.trim() && !jdFile) {
      toast.warning("Please provide a job description");
      setCurrentStep(2);
      return;
    }

    if (!selectedRole && !customRole.trim()) {
      toast.warning("Please select or enter your role");
      setCurrentStep(3);
      return;
    }

    if (!focusAreas.some(area => area.checked)) {
      toast.warning("Please select at least one focus area");
      setCurrentStep(5);
      return;
    }

    setIsSubmitting(true);

    try {
      let resumeFileId = null;

      if (requiresResume && resumeFile) {
        toast.info("Uploading resume...");
        try {
          resumeFileId = await uploadFile(resumeFile);
          toast.success("Resume uploaded successfully!");
        } catch (uploadError: any) {
          toast.error(uploadError.message || "Failed to upload resume");
          setIsSubmitting(false);
          return;
        }
      }

      toast.info("Creating interview session...");
      
      const response = await interviewApi.createPreference({
        interviewType,
        role: customRole || selectedRole,
        experienceLevel,
        difficulty,
        language,
        focusAreas: focusAreas.filter(a => a.checked).map(a => a.id),
        resumeFileId: resumeFileId || undefined,
        jdText: jdText || undefined,
        permissions: {
          camera: permissions.camera,
          microphone: permissions.microphone,
          speaker: permissions.speaker,
        },
      });

      toast.success("Interview session created! 🚀");
      navigate(`/interview?sessionId=${response.data.sessionId}`);
    } catch (error: any) {
      console.error("Failed to create interview:", error);
      
      if (error.message === 'Network Error') {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(error?.response?.data?.message || "Failed to create interview session. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    const titles = [
      "Choose Interview Type",
      "Upload Resume",
      "Job Description",
      "Select Role",
      "Experience & Difficulty",
      "Focus Areas",
      "Language & Setup"
    ];
    return titles[currentStep];
  };

  const getVisibleSteps = (): number[] => {
    const steps = [0, 3, 4, 5, 6];
    if (requiresResume) steps.splice(1, 0, 1);
    if (requiresJd) steps.splice(2, 0, 2);
    return steps;
  };

  const visibleSteps = getVisibleSteps();
  const currentStepIndex = visibleSteps.indexOf(currentStep);
  const totalSteps = visibleSteps.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
      >
        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-7">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Interview Setup</h1>
              <p className="text-blue-100/80 text-sm mt-1">
                Step {currentStepIndex + 1} of {totalSteps}: {getStepTitle()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm font-medium">
                {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
              </span>
            </div>
          </div>
          <div className="mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="p-8 min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <>
                  <h3 className="text-xl font-bold text-gray-900">Choose Interview Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {interviewTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = interviewType === type.id;
                      return (
                        <button
                          key={type.id}
                          onClick={() => {
                            setInterviewType(type.id as InterviewType);
                            setValidationErrors({});
                          }}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl ${isSelected ? "bg-blue-100" : "bg-gray-100"}`}>
                            <Icon className={`w-5 h-5 ${isSelected ? "text-blue-600" : "text-gray-500"}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{type.label}</p>
                            {type.recommended && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                ⭐ Recommended
                              </span>
                            )}
                          </div>
                          {isSelected && <CheckCircleIcon className="w-5 h-5 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <h3 className="text-xl font-bold text-gray-900">Upload Resume</h3>
                  <div
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
                      resumeFile
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
                    } ${isExtracting ? "opacity-70 pointer-events-none" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isExtracting}
                    />
                    {isExtracting ? (
                      <div className="space-y-3">
                        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="font-semibold text-gray-900">Analyzing your resume...</p>
                        <p className="text-sm text-gray-500">Extracting skills, role, and experience</p>
                      </div>
                    ) : resumeFile ? (
                      <div className="space-y-2">
                        <CheckCircleIcon className="w-14 h-14 text-emerald-500 mx-auto" />
                        <p className="font-semibold text-gray-900">{resumeFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {autoFilled.role && (
                          <div className="flex items-center justify-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            <RocketLaunchIcon className="w-3 h-3" />
                            Auto-filled: {customRole || selectedRole}
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setResumeFile(null);
                            setResumeFileId(null);
                            setAutoFilled({ role: false, experienceLevel: false, difficulty: false });
                          }}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <CloudArrowUpIcon className="w-14 h-14 text-gray-400 mx-auto" />
                        <p className="text-gray-600 font-medium">Drag & Drop PDF/DOCX</p>
                        <p className="text-sm text-gray-400">or click to browse</p>
                      </div>
                    )}
                  </div>
                  {validationErrors.resume && (
                    <p className="text-red-500 text-sm flex items-center gap-2 mt-2">
                      <ExclamationCircleIcon className="w-4 h-4" />
                      {validationErrors.resume}
                    </p>
                  )}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4" />
                      AI will extract: Skills • Role • Experience • Technologies
                    </p>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h3 className="text-xl font-bold text-gray-900">Job Description</h3>
                  <div className="space-y-4">
                    <textarea
                      placeholder="Paste job description here..."
                      value={jdText}
                      onChange={(e) => {
                        setJdText(e.target.value);
                        setValidationErrors(prev => ({ ...prev, jd: "" }));
                      }}
                      className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    />
                    {validationErrors.jd && (
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <ExclamationCircleIcon className="w-4 h-4" />
                        {validationErrors.jd}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 font-medium">OR</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <button
                      onClick={() => document.getElementById('jd-file-input')?.click()}
                      className="w-full py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                      <CloudArrowUpIcon className="w-4 h-4" />
                      Upload JD PDF
                    </button>
                    <input
                      id="jd-file-input"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    {jdFile && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-700">{jdFile.name}</span>
                        <button
                          onClick={() => setJdFile(null)}
                          className="ml-auto text-red-500 hover:text-red-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h3 className="text-xl font-bold text-gray-900">Select Role</h3>
                  {autoFilled.role && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                      <RocketLaunchIcon className="w-4 h-4" />
                      Role auto-filled from resume
                      <span className="text-xs text-emerald-400 ml-2">(you can change it)</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setCustomRole("");
                          setValidationErrors(prev => ({ ...prev, role: "" }));
                          setAutoFilled(prev => ({ ...prev, role: false }));
                        }}
                        className={`p-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${
                          selectedRole === role && !customRole
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {role}
                        {autoFilled.role && selectedRole === role && (
                          <span className="ml-2 text-[10px] text-emerald-500">✨</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Custom Role</label>
                    <input
                      type="text"
                      placeholder="Enter custom role..."
                      value={customRole}
                      onChange={(e) => {
                        setCustomRole(e.target.value);
                        setSelectedRole("");
                        setValidationErrors(prev => ({ ...prev, role: "" }));
                        setAutoFilled(prev => ({ ...prev, role: false }));
                      }}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    {validationErrors.role && (
                      <p className="text-red-500 text-sm flex items-center gap-2 mt-2">
                        <ExclamationCircleIcon className="w-4 h-4" />
                        {validationErrors.role}
                      </p>
                    )}
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Experience Level</h3>
                    {autoFilled.experienceLevel && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg mb-3">
                        <RocketLaunchIcon className="w-4 h-4" />
                        Experience auto-filled from resume
                        <span className="text-xs text-emerald-400 ml-2">(you can change it)</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => {
                            setExperienceLevel(level.id as ExperienceLevel);
                            setAutoFilled(prev => ({ ...prev, experienceLevel: false }));
                          }}
                          className={`p-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${
                            experienceLevel === level.id
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {level.label}
                          {autoFilled.experienceLevel && experienceLevel === level.id && (
                            <span className="ml-2 text-[10px] text-emerald-500">✨</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Difficulty Level</h3>
                    {autoFilled.difficulty && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg mb-3">
                        <RocketLaunchIcon className="w-4 h-4" />
                        Difficulty auto-set based on experience
                        <span className="text-xs text-emerald-400 ml-2">(you can change it)</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {difficulties.map((diff) => (
                        <button
                          key={diff.id}
                          onClick={() => {
                            setDifficulty(diff.id as Difficulty);
                            setAutoFilled(prev => ({ ...prev, difficulty: false }));
                          }}
                          className={`p-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-300 flex flex-col items-center ${
                            difficulty === diff.id
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span>{diff.label}</span>
                          <span className="text-xs text-gray-400 mt-1">
                            {getDurationLabel(diff.id as Difficulty)}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${diff.color} mt-1`} />
                          {autoFilled.difficulty && difficulty === diff.id && (
                            <span className="ml-2 text-[10px] text-emerald-500">✨</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <>
                  <h3 className="text-xl font-bold text-gray-900">Focus Areas</h3>
                  <p className="text-sm text-gray-500 -mt-4">Select all that apply</p>
                  {validationErrors.focus && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <ExclamationCircleIcon className="w-4 h-4" />
                      {validationErrors.focus}
                    </p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {focusAreas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => toggleFocusArea(area.id)}
                        className={`p-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${
                          area.checked
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 justify-center">
                          {area.checked && <CheckCircleIcon className="w-4 h-4 text-blue-600" />}
                          {area.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {currentStep === 6 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Interview Language</h3>
                    <p className="text-sm text-gray-500 -mt-2 mb-4">
                      Choose your preferred interview language
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setLanguage(lang.id as Language)}
                          className={`p-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${
                            language === lang.id
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Camera & Microphone Check</h3>
                    {validationErrors.permissions && (
                      <p className="text-red-500 text-sm flex items-center gap-2 mb-4">
                        <ExclamationCircleIcon className="w-4 h-4" />
                        {validationErrors.permissions}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: "camera", label: "Camera", icon: VideoCameraIcon, test: testCamera },
                        { id: "microphone", label: "Microphone", icon: MicrophoneIcon, test: testMicrophone },
                        { id: "speaker", label: "Speaker", icon: SpeakerWaveIcon, test: testSpeaker },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className={`p-5 rounded-xl border-2 text-center transition-all duration-300 ${
                            permissions[item.id as keyof typeof permissions]
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <item.icon className={`w-10 h-10 mx-auto mb-3 ${
                            permissions[item.id as keyof typeof permissions]
                              ? "text-emerald-500"
                              : "text-gray-400"
                          }`} />
                          <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                          {testStatus[item.id] && (
                            <p className={`text-xs font-medium mt-1 ${
                              testStatus[item.id].includes("✅") ? "text-emerald-600" :
                              testStatus[item.id].includes("❌") ? "text-red-600" :
                              "text-amber-600"
                            }`}>
                              {testStatus[item.id]}
                            </p>
                          )}
                          <button
                            onClick={item.test}
                            disabled={isTesting}
                            className={`mt-3 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                              permissions[item.id as keyof typeof permissions]
                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isTesting ? "Testing..." : 
                             permissions[item.id as keyof typeof permissions] ? "✅ Enabled" : "Test"}
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 relative">
                      <video
                        ref={videoRef}
                        className="w-full max-h-[200px] object-cover"
                        muted
                        playsInline
                        autoPlay
                      />
                      {!permissions.camera && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                          <p className="text-white text-sm font-medium">Click "Test" to start camera</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-between">
          <button
            onClick={() => {
              if (currentStepIndex > 0) {
                setCurrentStep(visibleSteps[currentStepIndex - 1]);
              }
            }}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
              currentStepIndex > 0
                ? "text-gray-700 hover:bg-gray-200"
                : "text-gray-400 cursor-not-allowed"
            }`}
            disabled={currentStepIndex === 0}
          >
            Back
          </button>
          {currentStepIndex < totalSteps - 1 ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              Next Step
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleStartInterview}
              disabled={isSubmitting || isExtracting}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {requiresResume && resumeFile ? "Uploading & Creating..." : "Creating Session..."}
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  Start Interview
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewPreferences;