// hooks/useAudioStream.ts
/**
 * useAudioStream
 * ----------------
 * Captures the mic, runs a lightweight VAD (voice-activity-detection) loop
 * on the raw audio, and streams turns up to the backend over the existing
 * Socket.IO connection (see services/audioHandler.ts on the server).
 *
 * Flow:
 *  1. startAudioStream() grabs mic audio + sets up an AnalyserNode for VAD.
 *  2. When volume crosses a threshold for a few consecutive frames, we treat
 *     that as "user started speaking": we start a MediaRecorder for this
 *     turn and emit `audio:speech-start` (this is what makes the backend/
 *     Interview.tsx interrupt any in-progress TTS).
 *  3. While recording, each `ondataavailable` chunk is both buffered (for the
 *     final blob) and forwarded as `audio:chunk` (base64) for optional live
 *     transcription preview.
 *  4. When volume drops below threshold for SILENCE_MS, we stop the
 *     recorder, assemble the full turn's audio into one Blob, and emit
 *     `audio:final` — this is what the backend sends to Gemini/Whisper for
 *     a full response + evaluation.
 *  5. Socket listeners translate `audio:ai-response`, `audio:evaluation`,
 *     `audio:transcription`, `audio:error`, `audio:next-question` into state
 *     + the callbacks passed in.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

export interface AudioEvaluationPayload {
  scores?: Record<string, number>;
  feedback?: Record<string, unknown>;
  sessionId?: string;
}

export interface NextQuestionPayload {
  questionText?: string;
  questionType?: string;
  idealAnswer?: string;
  sessionId?: string;
}

export interface UseAudioStreamCallbacks {
  /** Fired the instant local VAD detects the user has started talking (use this to cancel TTS immediately, don't wait on the network). */
  onUserSpeechStart?: () => void;
  /** Interim / final transcript chunks from the backend's /audio/stream preview. */
  onTranscription?: (text: string, isFinal: boolean) => void;
  /** The AI's reply text for this turn (already includes the evaluator's "action" if you need it). */
  onAIResponse?: (text: string, action?: "follow_up" | "next_question") => void;
  /** Per-turn scoring/feedback payload. */
  onEvaluation?: (data: AudioEvaluationPayload) => void;
  /** Optional: the next scripted question, if the backend advances the script. */
  onNextQuestion?: (question: NextQuestionPayload) => void;
  /** Connection/processing status changes. */
  onStatus?: (status: "connected" | "reconnected" | "disconnected" | "processing" | "queued") => void;
  onError?: (error: string) => void;
}

export interface UseAudioStreamReturn {
  isRecording: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0-100, for a VU meter
  isConnected: boolean;
  transcript: string;
  aiMessage: string;
  error: string | null;
  startAudioStream: () => Promise<boolean>;
  stopAudioStream: () => void;
}

// ---- VAD tuning ----
const VOLUME_THRESHOLD = 14; // 0-255 scale, deviation from silence
const SPEECH_ONSET_FRAMES = 6; // consecutive above-threshold frames to confirm speech start (~debounce noise)
const SILENCE_MS = 1000; // sustained quiet before we treat the turn as over
const CHUNK_TIMESLICE_MS = 950; // how often MediaRecorder flushes a chunk while recording

function pickMimeType(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // strip the "data:audio/webm;base64," prefix
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read audio blob"));
    reader.readAsDataURL(blob);
  });
}

export default function useAudioStream(
  socketRef: React.MutableRefObject<Socket | null> | React.RefObject<Socket | null>,
  sessionId: string | null,
  callbacks: UseAudioStreamCallbacks = {}
): UseAudioStreamReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const turnChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("");

  const aboveThresholdCountRef = useRef(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSpeakingRef = useRef(false); // mirrors isSpeaking without stale closures in the RAF loop
  const isStoppingRef = useRef(false);

  // ------------------------------------------------------------------
  // Socket event wiring
  // ------------------------------------------------------------------
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      callbacksRef.current.onStatus?.("connected");
    };
    const handleDisconnect = () => {
      setIsConnected(false);
      callbacksRef.current.onStatus?.("disconnected");
    };
    const handleReconnect = () => {
      setIsConnected(true);
      callbacksRef.current.onStatus?.("reconnected");
    };

    const handleTranscription = (data: { text: string; isFinal: boolean; sessionId: string }) => {
      setTranscript(data.text);
      callbacksRef.current.onTranscription?.(data.text, data.isFinal);
    };

    const handleAiResponse = (data: { text: string; action?: "follow_up" | "next_question"; sessionId: string }) => {
      setAiMessage(data.text);
      callbacksRef.current.onAIResponse?.(data.text, data.action);
    };

    const handleEvaluation = (data: AudioEvaluationPayload) => {
      callbacksRef.current.onEvaluation?.(data);
    };

    const handleNextQuestion = (data: { question: NextQuestionPayload; sessionId: string }) => {
      callbacksRef.current.onNextQuestion?.(data.question);
    };

    const handleAudioStatus = (data: { status: string }) => {
      if (data.status === "processing" || data.status === "queued") {
        callbacksRef.current.onStatus?.(data.status as "processing" | "queued");
      }
    };

    const handleAudioError = (data: { message: string }) => {
      setError(data.message);
      callbacksRef.current.onError?.(data.message);
    };

    // Backend echoes these back after it receives our own audio:speech-start;
    // harmless no-ops here since we already cancel TTS locally the instant
    // VAD fires (see onUserSpeechStart below), kept for symmetry/future use.
    const handleStopTts = () => {};
    const handleClearPending = () => {};

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect", handleReconnect);
    socket.on("audio:transcription", handleTranscription);
    socket.on("audio:ai-response", handleAiResponse);
    socket.on("audio:evaluation", handleEvaluation);
    socket.on("audio:next-question", handleNextQuestion);
    socket.on("audio:status", handleAudioStatus);
    socket.on("audio:error", handleAudioError);
    socket.on("audio:stop-tts", handleStopTts);
    socket.on("audio:clear-pending", handleClearPending);

    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect", handleReconnect);
      socket.off("audio:transcription", handleTranscription);
      socket.off("audio:ai-response", handleAiResponse);
      socket.off("audio:evaluation", handleEvaluation);
      socket.off("audio:next-question", handleNextQuestion);
      socket.off("audio:status", handleAudioStatus);
      socket.off("audio:error", handleAudioError);
      socket.off("audio:stop-tts", handleStopTts);
      socket.off("audio:clear-pending", handleClearPending);
    };
  }, [socketRef]);

  // ------------------------------------------------------------------
  // Turn lifecycle: start / stop the per-utterance MediaRecorder
  // ------------------------------------------------------------------
  const beginTurn = useCallback(() => {
    const stream = mediaStreamRef.current;
    if (!stream || mediaRecorderRef.current) return;

    turnChunksRef.current = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: mimeTypeRef.current || undefined,
      audioBitsPerSecond: 128000,
    });

    recorder.ondataavailable = (event: BlobEvent) => {
      if (!event.data || event.data.size === 0) return;
      turnChunksRef.current.push(event.data);

      // Fire-and-forget interim preview chunk (full-so-far, so it stays a
      // decodable prefix rather than an orphaned mid-stream fragment).
      const soFar = new Blob(turnChunksRef.current, { type: mimeTypeRef.current || "audio/webm" });
      blobToBase64(soFar)
        .then((base64) => {
          socketRef.current?.emit("audio:chunk", {
            sessionId,
            audio: base64,
            timestamp: Date.now(),
          });
        })
        .catch(() => {
          /* non-fatal: interim preview only */
        });
    };

    recorder.onstop = async () => {
      isStoppingRef.current = false;
      const finalBlob = new Blob(turnChunksRef.current, { type: mimeTypeRef.current || "audio/webm" });
      turnChunksRef.current = [];
      mediaRecorderRef.current = null;

      if (finalBlob.size === 0) return;

      try {
        const base64 = await blobToBase64(finalBlob);
        socketRef.current?.emit("audio:final", {
          sessionId,
          audio: base64,
          timestamp: Date.now(),
        });
      } catch (err) {
        setError("Failed to encode audio for upload");
        callbacksRef.current.onError?.("Failed to encode audio for upload");
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start(CHUNK_TIMESLICE_MS);
    setIsRecording(true);

    socketRef.current?.emit("audio:speech-start", { sessionId });
    callbacksRef.current.onUserSpeechStart?.();
  }, [sessionId, socketRef]);

  const endTurn = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || isStoppingRef.current) return;
    isStoppingRef.current = true;
    setIsRecording(false);
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  // ------------------------------------------------------------------
  // VAD loop
  // ------------------------------------------------------------------
  const runVadTick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);

    // RMS-style deviation from the 128 (silence) midpoint
    let sumSquares = 0;
    for (let i = 0; i < data.length; i++) {
      const deviation = data[i] - 128;
      sumSquares += deviation * deviation;
    }
    const rms = Math.sqrt(sumSquares / data.length);
    const level = Math.min(100, Math.round((rms / 40) * 100));
    setAudioLevel(level);

    if (rms > VOLUME_THRESHOLD) {
      aboveThresholdCountRef.current += 1;

      // Cancel any pending "end of turn" silence timer — user is still talking
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (!isSpeakingRef.current && aboveThresholdCountRef.current >= SPEECH_ONSET_FRAMES) {
        isSpeakingRef.current = true;
        setIsSpeaking(true);
        beginTurn();
      }
    } else {
      aboveThresholdCountRef.current = 0;

      if (isSpeakingRef.current && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null;
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          endTurn();
        }, SILENCE_MS);
      }
    }

    rafIdRef.current = requestAnimationFrame(runVadTick);
  }, [beginTurn, endTurn]);

  // ------------------------------------------------------------------
  // Public controls
  // ------------------------------------------------------------------
  const startAudioStream = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      mimeTypeRef.current = pickMimeType();

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      rafIdRef.current = requestAnimationFrame(runVadTick);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Microphone access failed";
      setError(message);
      callbacksRef.current.onError?.(message);
      return false;
    }
  }, [runVadTick]);

  const stopAudioStream = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    mediaRecorderRef.current = null;
    turnChunksRef.current = [];

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    isSpeakingRef.current = false;
    isStoppingRef.current = false;
    aboveThresholdCountRef.current = 0;
    setIsSpeaking(false);
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  // Safety net: always tear down media on unmount
  useEffect(() => {
    return () => {
      stopAudioStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isRecording,
    isSpeaking,
    audioLevel,
    isConnected,
    transcript,
    aiMessage,
    error,
    startAudioStream,
    stopAudioStream,
  };
}