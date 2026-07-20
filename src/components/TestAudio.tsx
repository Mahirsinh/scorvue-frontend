// frontend/src/components/TestAudio.tsx

import React from "react";
import { useAudioStream } from "../hooks/useAudioStream";

export const TestAudio = () => {
  const {
    isRecording,
    isSpeaking,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    getLevelPercentage,
  } = useAudioStream({
    onSpeechStart: () => {
      console.log("🎤 Speech Started");
    },

    onSpeechEnd: (blob) => {
      console.log("✅ Speech Ended");
      console.log("Blob Size:", blob.size);
    },

    onAudioLevel: (level) => {
      console.log("Audio Level:", level);
    },
  });

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6">

      <h2 className="text-2xl font-bold">
        🎤 Microphone Test
      </h2>

      {error && (
        <div className="rounded bg-red-100 text-red-700 p-3">
          ❌ {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="px-5 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {isRecording ? "Recording..." : "Start Microphone"}
        </button>

        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="px-5 py-2 rounded bg-red-600 text-white disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      <div className="space-y-2 text-lg">

        <p>
          Recording:
          <span className="ml-2 font-semibold">
            {isRecording ? "🟢 Yes" : "🔴 No"}
          </span>
        </p>

        <p>
          Speaking:
          <span className="ml-2 font-semibold">
            {isSpeaking ? "🟢 Speaking" : "⚪ Silent"}
          </span>
        </p>

        <p>
          Audio Level:
          <span className="ml-2 font-semibold">
            {Math.round(getLevelPercentage())}%
          </span>
        </p>

        <p>
          Raw Value:
          <span className="ml-2 font-semibold">
            {audioLevel.toFixed(5)}
          </span>
        </p>

      </div>

      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ${
            isSpeaking ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{
            width: `${getLevelPercentage()}%`,
          }}
        />
      </div>
    </div>
  );
};