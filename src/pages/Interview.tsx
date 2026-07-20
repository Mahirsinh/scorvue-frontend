// pages/Interview.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as Human from '@vladmandic/human';

import { motion, AnimatePresence } from "framer-motion";
import {
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ClockIcon,
  PhoneXMarkIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { interviewApi } from "../services/interviewApi";
import type { InterviewPreference } from "../types/interview";
import axios from "axios";

import { TranscriptionDisplay } from "../components/TranscriptionDisplay";
import useSocket from "../hooks/useSocket";
import useAudioStream from "../hooks/useAudioStream";

// Simple animated avatar component (free, no external library needed)
const AnimatedAvatar = ({ isSpeaking, isVideoOff }: { isSpeaking: boolean; isVideoOff: boolean }) => {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" role="img" aria-label="AI interviewer avatar">
      <defs>
        <linearGradient id="avatarBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#CCFBF1" />
          <stop offset="100%" stopColor="#99F6E4" />
        </linearGradient>
        <linearGradient id="avatarShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle cx="100" cy="100" r="100" fill="url(#avatarBg)" />
      
      {/* Shine effect */}
      <circle cx="100" cy="100" r="100" fill="url(#avatarShine)" />
      
      {/* Body/neck */}
      <ellipse cx="100" cy="170" rx="45" ry="30" fill="#0F766E" fillOpacity="0.7" />
      
      {/* Head */}
      <circle cx="100" cy="85" r="38" fill="#0F766E" fillOpacity="0.85" />
      
      {/* Eyes */}
      <div className="relative">
        {/* Left eye */}
        <circle cx="88" cy="80" r="4" fill="white" />
        <circle cx="88" cy="80" r="2.5" fill="#1A1A2E" />
        <circle cx="89" cy="79" r="1" fill="white" />
        
        {/* Right eye */}
        <circle cx="112" cy="80" r="4" fill="white" />
        <circle cx="112" cy="80" r="2.5" fill="#1A1A2E" />
        <circle cx="113" cy="79" r="1" fill="white" />
      </div>
      
      {/* Mouth - animated based on speaking */}
      {isSpeaking ? (
        // Speaking mouth (oval, animated)
        <g>
          <ellipse cx="100" cy="98" rx="12" ry="8" fill="#1A1A2E" />
          <ellipse cx="100" cy="97" rx="10" ry="6" fill="#E53E3E" />
          <rect x="90" y="93" width="20" height="8" rx="2" fill="#E53E3E" />
          <animate attributeName="ry" values="3;7;4;8;3;6;3" dur="0.3s" repeatCount="indefinite" />
        </g>
      ) : isVideoOff ? (
        // Video off - smile with X eyes
        <g>
          <circle cx="88" cy="80" r="6" fill="#1A1A2E" />
          <circle cx="112" cy="80" r="6" fill="#1A1A2E" />
          <line x1="84" y1="76" x2="92" y2="84" stroke="white" strokeWidth="2" />
          <line x1="92" y1="76" x2="84" y2="84" stroke="white" strokeWidth="2" />
          <line x1="108" y1="76" x2="116" y2="84" stroke="white" strokeWidth="2" />
          <line x1="116" y1="76" x2="108" y2="84" stroke="white" strokeWidth="2" />
          <path d="M90 102 Q100 110 110 102" stroke="#1A1A2E" strokeWidth="2" fill="none" />
        </g>
      ) : (
        // Normal smile
        <path d="M90 95 Q100 105 110 95" stroke="#1A1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      
      {/* Blush effect */}
      <ellipse cx="78" cy="92" rx="8" ry="5" fill="#FF6B6B" fillOpacity="0.2" />
      <ellipse cx="122" cy="92" rx="8" ry="5" fill="#FF6B6B" fillOpacity="0.2" />
      
      {/* Speaking animation rings */}
      {isSpeaking && (
        <>
          <circle cx="100" cy="100" r="50" fill="none" stroke="#0F766E" strokeWidth="1.5" strokeOpacity="0.3">
            <animate attributeName="r" values="50;65;50" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="strokeOpacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="100" r="55" fill="none" stroke="#0F766E" strokeWidth="1" strokeOpacity="0.2">
            <animate attributeName="r" values="55;70;55" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
            <animate attributeName="strokeOpacity" values="0.2;0;0.2" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// AI Interviewer Panel
const AIAvatar = ({
  isSpeaking,
  message,
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
}: {
  isSpeaking: boolean;
  message: string;
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}) => {
  return (
    <div className="relative flex flex-col items-center h-full justify-center bg-white">
      {/* Simple label - no status indicators */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full z-10">
        <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-teal-600'}`} />
        <span className="text-xs font-medium text-gray-600">AI Interviewer</span>
      </div>

      <div className="relative">
        <div
          className={`relative w-36 h-36 md:w-44 md:h-44 rounded-full border-4 overflow-hidden bg-teal-50 transition-all duration-500 ${
            isSpeaking ? "border-green-500 shadow-lg shadow-green-500/30" : "border-gray-200"
          }`}
        >
          <AnimatedAvatar isSpeaking={isSpeaking} isVideoOff={isVideoOff} />
        </div>
      </div>

      {/* Message bubble */}
      <div className="absolute bottom-20 left-4 right-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md">
          <div className="flex items-start gap-3">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              {message || "I'm ready to have a conversation with you. Let's talk!"}
            </p>
          </div>
        </div>
      </div>

      {/* AI controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-full z-10">
        <button
          onClick={onToggleMute}
          className={`p-1.5 rounded-full transition-all ${
            isMuted ? "bg-red-50 text-red-500" : "hover:bg-gray-200 text-gray-500"
          }`}
          aria-label="Toggle AI voice"
        >
          {isMuted ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
        </button>
        <button
          onClick={onToggleVideo}
          className={`p-1.5 rounded-full transition-all ${
            isVideoOff ? "bg-red-50 text-red-500" : "hover:bg-gray-200 text-gray-500"
          }`}
          aria-label="Toggle AI camera"
        >
          {isVideoOff ? <VideoCameraSlashIcon className="w-4 h-4" /> : <VideoCameraIcon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

// Control Button
const ControlButton = ({
  icon: Icon,
  label,
  active,
  onClick,
  variant = "default",
  disabled = false,
}: {
  icon: any;
  label?: string;
  active?: boolean;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}) => {
  const base = "relative p-3.5 rounded-full transition-all duration-200 flex items-center justify-center border";

  const styles =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600 border-red-500 text-white"
      : active
      ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-500"
      : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-600";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <Icon className="w-5 h-5" />
      {label && (
        <span className="absolute -bottom-6 text-[10px] text-gray-400 whitespace-nowrap font-medium">{label}</span>
      )}
    </button>
  );
};

// Get duration based on difficulty
const getDurationForDifficulty = (difficulty: string): number => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 5 * 60 * 1000; // 5 minutes
    case 'medium':
      return 15 * 60 * 1000; // 15 minutes
    case 'hard':
      return 25 * 60 * 1000; // 25 minutes
    case 'faang':
      return 30 * 60 * 1000; // 30 minutes
    default:
      return 15 * 60 * 1000; // Default 15 minutes
  }
};

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);

  const socketRef = useSocket();

  // ✅ Web Speech API for TTS (browser built-in, zero latency)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ✅ Face Detection State
  const [faceDetected, setFaceDetected] = useState(true);
  const [noFaceCount, setNoFaceCount] = useState(0);
  const [humanInstance, setHumanInstance] = useState<any>(null);
  const [isFaceDetectionInitialized, setIsFaceDetectionInitialized] = useState(false);
  const faceDetectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noFaceDetectionLimit = 15; // Reduced to 15 frames = 1.5 seconds at 10fps for faster response
  const [faceDetectionError, setFaceDetectionError] = useState(false);
  const [isCheatingTriggered, setIsCheatingTriggered] = useState(false);

  const [preference, setPreference] = useState<InterviewPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isCameraError, setIsCameraError] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);

  // Timer state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [, forceTick] = useState(0);
  const [maxDuration, setMaxDuration] = useState<number>(15 * 60 * 1000); // Default
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isEnding, setIsEnding] = useState(false);

  // ✅ Initialize Face Detection
  useEffect(() => {
    const initHuman = async () => {
      try {
        const human = new Human.Human({
          modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models/',
          face: {
            enabled: true,
            detector: {
              maxDetected: 5,
              minConfidence: 0.6, // Increased confidence threshold to reduce false positives
            },
            mesh: {
              enabled: false,
            },
            emotion: {
              enabled: false,
            },
            description: {
              enabled: false,
            },
          },
          body: { enabled: false },
          hand: { enabled: false },
          object: { enabled: false },
          gesture: { enabled: false },
        });

        await human.load();
        setHumanInstance(human);
        setIsFaceDetectionInitialized(true);
        console.log('✅ Face detection initialized successfully');
      } catch (error) {
        console.error('Failed to initialize face detection:', error);
        setFaceDetectionError(true);
        toast.error('Face detection initialization failed. Please refresh the page.');
      }
    };

    initHuman();

    return () => {
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
        faceDetectionIntervalRef.current = null;
      }
      if (humanInstance && typeof humanInstance.dispose === 'function') {
        try {
          humanInstance.dispose();
        } catch (error) {
          console.warn('Error disposing human instance:', error);
        }
      }
    };
  }, []);

  // ✅ Start face detection when interview starts and camera is ready
  useEffect(() => {
    if (!interviewStarted || !isCameraReady || !humanInstance || !videoRef.current) return;

    const detectFace = async () => {
      if (!videoRef.current || !humanInstance || !isCameraReady || isEnding || isCheatingTriggered) return;

      try {
        // Ensure video has data
        if (videoRef.current.readyState < 2) return;

        // Perform face detection with higher confidence threshold
        const result = await humanInstance.detect(videoRef.current, { 
  face: { 
    enabled: true,
    minConfidence: 0.6,
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
});

let hasFace = false;
if (result.face && result.face.length > 0) {
  for (const face of result.face) {
    // Use `score` (overall face score), not `confidence`
    if (face.score && face.score > 0.6) {
      hasFace = true;
      break;
    }
  }
}

// Fix the box-size check — box is [x, y, width, height], an array
if (hasFace && result.face && result.face.length > 0) {
  const face = result.face[0];
  const box = face.box; // [x, y, width, height]
  if (Array.isArray(box) && box.length === 4) {
    const [, , boxWidth, boxHeight] = box;
    const videoWidth = videoRef.current.videoWidth || 640;
    const videoHeight = videoRef.current.videoHeight || 480;
    const faceRatio = (boxWidth * boxHeight) / (videoWidth * videoHeight);

    // Lower this threshold too — at typical webcam distance a face
    // is often 2-4% of frame area, not 5%+
    if (faceRatio < 0.02) {
      hasFace = false;
    }
  }
}

        
        if (hasFace) {
          setNoFaceCount(0);
          setFaceDetected(true);
        } else {
          setNoFaceCount(prev => {
            const newCount = prev + 1;
            if (newCount >= noFaceDetectionLimit && !isEnding && !isCheatingTriggered) {
              // No face detected for too long - trigger cheating immediately
              handleNoFaceCheating();
              return 0;
            }
            return newCount;
          });
          setFaceDetected(false);
        }
      } catch (error) {
        console.error('Face detection error:', error);
        setFaceDetectionError(true);
      }
    };

    // Run face detection every 100ms (10fps) for performance
    faceDetectionIntervalRef.current = setInterval(detectFace, 100);

    return () => {
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
        faceDetectionIntervalRef.current = null;
      }
    };
  }, [interviewStarted, isCameraReady, humanInstance, isEnding, isCheatingTriggered]);

  // ✅ Handle no face detection - trigger cheating immediately
  const handleNoFaceCheating = useCallback(() => {
    // Don't trigger if already ending or if interview hasn't started
    if (isEnding || !interviewStarted || isCheatingTriggered) return;

    console.warn('⚠️ No face detected for extended period - triggering cheating detection');
    
    // Set cheating triggered flag to prevent multiple triggers
    setIsCheatingTriggered(true);
    
    // Stop the interval to prevent multiple triggers
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }

    toast.error("⚠️ No face detected! Interview terminated.");
    
    // Immediately navigate to cheating page
    navigate("/cheating", { 
      state: { 
        from: "interview",
        sessionId: sessionId,
        reason: "No face detected during interview - candidate left the camera"
      } 
    });
  }, [isEnding, interviewStarted, navigate, sessionId, isCheatingTriggered]);

  // ✅ Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // ✅ Speak text using Web Speech API
  const speakText = useCallback((text: string) => {
    if (!text || isMuted) return;

    // Cancel any ongoing speech
    cancelSpeech();

    const synth = speechSynthesisRef.current;
    if (!synth) {
      console.warn('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Select a good voice if available
    const voices = synth.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    synth.speak(utterance);
  }, [isMuted]);

  // ✅ Cancel speech
  const cancelSpeech = useCallback(() => {
    const synth = speechSynthesisRef.current;
    if (synth) {
      synth.cancel();
    }
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // Force re-render every second for timer
  useEffect(() => {
    if (!interviewStarted) return;
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [interviewStarted]);

  // Update timer display
  useEffect(() => {
    if (!interviewStarted || !startTime) return;

    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, maxDuration - elapsed);
      setTimeRemaining(remaining);

      // Auto-end when time runs out
      if (remaining <= 0 && !isEnding) {
        handleEndInterview();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [interviewStarted, startTime, maxDuration]);

  // Audio Stream Hook
  const {
    isRecording,
    isSpeaking: isUserSpeaking,
    audioLevel,
    isConnected,
    transcript,
    aiMessage: aiTranscript,
    error: audioError,
    startAudioStream,
    stopAudioStream,
  } = useAudioStream(socketRef, sessionId, {
    onUserSpeechStart: () => {
      // ✅ Cancel speech when user starts speaking
      cancelSpeech();
    },
    onTranscription: (text, isFinal) => {
      // Silent - no display
    },
    onAIResponse: (text) => {
      setAiMessage(text);
      // ✅ Speak using Web Speech API
      speakText(text);
    },
    onEvaluation: (data) => {
      console.log("📊 Evaluation:", data);
    },
    onStatus: (status) => {
      console.log("🔌 Socket status:", status);
      setIsSocketConnected(status === "connected" || status === "reconnected");
    },
    onError: (error) => {
      toast.error(`Audio error: ${error}`);
    },
  });

  // Handle end interview
  const handleEndInterview = async () => {
    if (!sessionId || isEnding) return;

    setIsEnding(true);

    try {
      // ✅ Cancel speech
      cancelSpeech();

      // Stop audio stream
      stopAudioStream();

      // Stop face detection
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
        faceDetectionIntervalRef.current = null;
      }

      // Update status on backend via HTTP
      await interviewApi.updateStatus(sessionId, "completed");

      // Emit socket event to trigger review generation on backend
      if (socketRef.current) {
        console.log('📤 Emitting interview:end event for session:', sessionId);
        socketRef.current.emit('interview:end', { sessionId });
      } else {
        console.warn('⚠️ Socket not available, review may not be generated');
        // Fallback: Direct API call to generate review
        try {
          await axios.post(
            `${API_URL}/review/generate`,
            { sessionId },
            { withCredentials: true }
          );
          console.log('✅ Review generation triggered via API fallback');
        } catch (reviewError) {
          console.error('Failed to trigger review generation:', reviewError);
        }
      }

      toast.success("Interview completed! Generating your review...");

      // Navigate to review page
      navigate(`/review-interview/${sessionId}`);
    } catch (error) {
      console.error("Error ending interview:", error);
      toast.error("Failed to end interview properly");
      setIsEnding(false);
    }
  };

  // Format time remaining
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Parse session ID from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("sessionId");

    if (!id) {
      toast.error("No interview session found");
      navigate("/live-interview/preferences");
      return;
    }

    setSessionId(id);

    const fetchPreference = async () => {
      try {
        const response = await interviewApi.getPreference(id);
        const pref = response.data as InterviewPreference;
        setPreference(pref);

        // Set max duration based on difficulty
        const duration = getDurationForDifficulty(pref.difficulty);
        setMaxDuration(duration);

        await interviewApi.updateStatus(id, "in-progress");
        setAiMessage(
          `Hello! I'm your AI interviewer. I'm here to have a natural conversation with you. Feel free to speak naturally, and I'll respond accordingly. Let's start with you telling me about yourself! 🎯`
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch interview:", error);
        toast.error("Interview session not found or expired");
        navigate("/live-interview/preferences");
      }
    };

    fetchPreference();

    // ✅ Request fullscreen on mount
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (err) {
        console.log('Fullscreen request failed (user may need to click first)');
      }
    };
    requestFullscreen();

    // ✅ Handle fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [location, navigate]);

  // ✅ Initialize camera with better error handling
  const initializeCamera = useCallback(async () => {
    if (isCameraReady) return true;
    if (isInitializingCamera) return false;

    setIsInitializingCamera(true);
    setIsCameraError(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
        setIsCameraError(false);
        toast.success("Camera connected successfully!");
        
        // Reset face detection state
        setNoFaceCount(0);
        setFaceDetected(true);
        setIsCheatingTriggered(false);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Camera initialization error:", error);
      setIsCameraError(true);
      toast.error("Failed to access camera. Please check permissions.");
      return false;
    } finally {
      setIsInitializingCamera(false);
    }
  }, [isCameraReady, isInitializingCamera]);

  // ✅ Auto-initialize camera on mount (after rules are shown)
  useEffect(() => {
    if (!showRules && !isCameraReady && !isInitializingCamera) {
      initializeCamera();
    }
  }, [showRules, isCameraReady, isInitializingCamera, initializeCamera]);

  // Start interview with real audio
  const handleStartInterview = async () => {
    // Ensure camera is ready
    let cameraReady = isCameraReady;
    if (!cameraReady) {
      const success = await initializeCamera();
      cameraReady = success;
      if (!cameraReady) {
        toast.error("Please enable camera to start the interview");
        return;
      }
    }

    setShowRules(false);
    setInterviewStarted(true);
    setStartTime(Date.now());

    const success = await startAudioStream();
    if (!success) {
      toast.error("Failed to start audio. Please check microphone permissions.");
      return;
    }

    toast.success("Interview started! You can speak naturally. 🎤");

    // AI speaks first
    setTimeout(() => {
      const firstMessage =
        "Hello! I'm your AI interviewer. Tell me about yourself - your background, experience, and what brings you here today?";
      setAiMessage(firstMessage);
      speakText(firstMessage);
    }, 2000);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudioStream();
      cancelSpeech();
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
        faceDetectionIntervalRef.current = null;
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      if (humanInstance && typeof humanInstance.dispose === 'function') {
        try {
          humanInstance.dispose();
        } catch (error) {
          console.warn('Error disposing human instance:', error);
        }
      }
    };
  }, [stopAudioStream, cameraStream, cancelSpeech, humanInstance]);

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.log('Fullscreen toggle error:', err);
    }
  };

  // ✅ Cheating detection - Navigate to cheating page when tab is hidden
  useEffect(() => {
    if (!interviewStarted) return;

    let cheatingDetected = false;

    const handleVisibilityChange = () => {
      if (document.hidden && !cheatingDetected) {
        cheatingDetected = true;
        toast.error("⚠️ Tab switching detected! Interview terminated.");
        
        // Navigate to cheating page
        navigate("/cheating", { 
          state: { 
            from: "interview",
            sessionId: sessionId,
            reason: "Tab switching detected during interview"
          } 
        });
      }
    };

    // Also detect window blur (switching to another app)
    const handleBlur = () => {
      if (!cheatingDetected) {
        cheatingDetected = true;
        toast.error("⚠️ Window focus lost! Interview terminated.");
        navigate("/cheating", { 
          state: { 
            from: "interview",
            sessionId: sessionId,
            reason: "Window focus lost during interview"
          } 
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [interviewStarted, navigate, sessionId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#FAFAF9]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl"
            >
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-teal-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    Face-to-Face Interview
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Difficulty: <span className="font-semibold capitalize">{preference?.difficulty || 'Medium'}</span>
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    { icon: VideoCameraIcon, text: "Keep your camera on for a personal connection", color: "text-sky-500", bg: "bg-sky-50" },
                    { icon: MicrophoneIcon, text: "Speak naturally - AI will listen and respond", color: "text-teal-600", bg: "bg-teal-50" },
                    { icon: ChatBubbleLeftRightIcon, text: "Conversation flows like a real interview", color: "text-violet-500", bg: "bg-violet-50" },
                    { icon: ExclamationTriangleIcon, text: "Stay focused - don't switch tabs or apps", color: "text-amber-500", bg: "bg-amber-50" },
                    { icon: ShieldCheckIcon, text: "Professional and friendly environment", color: "text-indigo-500", bg: "bg-indigo-50" },
                  ].map((rule, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className={`w-9 h-9 rounded-lg ${rule.bg} flex items-center justify-center flex-shrink-0`}>
                        <rule.icon className={`w-5 h-5 ${rule.color}`} />
                      </div>
                      <span className="text-sm text-gray-600">{rule.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/live-interview/preferences")}
                    className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-all"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleStartInterview}
                    className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all hover:-translate-y-0.5"
                  >
                    Start Interview
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interview Interface */}
      <div className="flex flex-col h-screen">
        {/* Top Bar - Clean with timer */}
        <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  interviewStarted && isSocketConnected ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
              <span className="text-xs font-semibold text-gray-700">
                {interviewStarted ? (isSocketConnected ? "Live" : "Reconnecting...") : "Connecting..."}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2 text-gray-500">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs font-mono">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* Timer - Shows remaining time */}
          {interviewStarted && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-gray-500">Time Remaining:</span>
                <span className={`font-mono ${timeRemaining < 60000 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <span className="text-xs text-gray-400 capitalize">
                {preference?.difficulty || 'medium'}
              </span>
            </div>
          )}

          <button onClick={toggleFullscreen} className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Stage: AI (left) / Candidate (right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 min-h-0">
          {/* AI Interviewer Panel */}
          <div className="relative rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
            <AIAvatar
              isSpeaking={isSpeaking}
              message={aiMessage}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              onToggleMute={() => setIsMuted(!isMuted)}
              onToggleVideo={() => setIsVideoOff(!isVideoOff)}
            />
          </div>

          {/* Candidate (self) Panel */}
          <div className="relative rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-gray-900">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
              muted
              playsInline
              autoPlay
            />

            {!isCameraReady && !isInitializingCamera && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center p-6">
                  <VideoCameraIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">Camera not ready</p>
                  <p className="text-sm text-gray-400 mb-4">
                    {isCameraError ? "Please allow camera permissions" : "Initializing..."}
                  </p>
                  <button
                    onClick={initializeCamera}
                    className="px-6 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all"
                  >
                    {isCameraError ? "Retry Camera" : "Enable Camera"}
                  </button>
                </div>
              </div>
            )}

            {isInitializingCamera && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Initializing camera...</p>
                </div>
              </div>
            )}

            {/* ✅ Face Detection Status Indicator */}
            {interviewStarted && isCameraReady && isFaceDetectionInitialized && (
              <div className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm ${
                faceDetected ? 'bg-emerald-500/90' : 'bg-red-500/90'
              } transition-all duration-300`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  faceDetected ? 'bg-white' : 'bg-white'
                }`} />
                <span className="text-xs font-medium text-white">
                  {faceDetected ? '✓ Face Detected' : `⚠️ No Face (${noFaceCount}/${noFaceDetectionLimit})`}
                </span>
              </div>
            )}

            {/* self label */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              <div className={`w-1.5 h-1.5 rounded-full ${isCameraReady ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-[11px] text-white font-medium">You</span>
              {isVideoOff && <span className="text-[10px] text-white/70">(video off)</span>}
            </div>

            {/* Progress bar - shows interview progress */}
            {interviewStarted && (
              <div className="absolute bottom-3 left-4 right-4">
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-1000 rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, (1 - (timeRemaining / maxDuration)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating bottom control bar */}
        <div className="flex-shrink-0 flex items-center justify-center pb-6 pt-2">
          <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-lg px-5 py-3 rounded-full">
            <ControlButton
              icon={MicrophoneIcon}
              label="Speak"
              active={isRecording}
              onClick={() => {
                toast.info(isRecording ? "Listening..." : "Speak naturally");
              }}
              disabled={!interviewStarted}
            />
            <ControlButton
              icon={isVideoOff ? VideoCameraSlashIcon : VideoCameraIcon}
              label="Video"
              active={isVideoOff}
              onClick={() => setIsVideoOff(!isVideoOff)}
            />
            <div className="w-px h-6 bg-gray-200" />
            <ControlButton
              icon={AdjustmentsHorizontalIcon}
              label="Settings"
              onClick={() => toast.info("Settings coming soon!")}
            />
            <ControlButton
              icon={PhoneXMarkIcon}
              label="End"
              variant="danger"
              onClick={() => {
                if (window.confirm("Are you sure you want to end the interview? Your progress will be saved for review.")) {
                  handleEndInterview();
                }
              }}
              disabled={isEnding}
            />
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
};

export default Interview;