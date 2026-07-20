import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranscriptionDisplayProps {
  transcript: string;
  isSpeaking: boolean;
  isFinal?: boolean;
  className?: string;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcript,
  isSpeaking,
  isFinal = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div
      ref={containerRef}
      className={`relative max-h-40 overflow-y-auto ${className}`}
    >
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {transcript ? (
            <motion.div
              key="transcript"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-gray-800/50 rounded-xl border border-gray-700"
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  {isFinal ? (
                    <span className="text-emerald-400">✅</span>
                  ) : isSpeaking ? (
                    <span className="text-blue-400 animate-pulse">●</span>
                  ) : (
                    <span className="text-gray-400">◯</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {transcript}
                    {!isFinal && isSpeaking && (
                      <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5" />
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {isFinal ? '✅ Final' : isSpeaking ? '🔴 Speaking...' : '⏸️ Paused'}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-gray-800/30 rounded-xl border border-gray-700/50"
            >
              <p className="text-sm text-gray-500 text-center">
                {isSpeaking ? '🎤 Listening...' : 'Speak to start transcription'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live indicator */}
      {isSpeaking && transcript && (
        <div className="absolute top-2 right-2">
          <span className="flex items-center gap-1.5 text-[10px] text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Live
          </span>
        </div>
      )}
    </div>
  );
};