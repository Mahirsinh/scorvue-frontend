// frontend/src/services/audioStreamService.ts

import { Socket } from 'socket.io-client';

interface AudioStreamConfig {
  socket: Socket; // ✅ Pass existing socket instead of URL
  sessionId: string;
  onTranscription?: (data: { text: string; isFinal: boolean }) => void;
  onAIResponse?: (data: { text: string; audio?: string }) => void;
  onEvaluation?: (data: any) => void;
  onStatus?: (status: string) => void;
  onError?: (error: string) => void;
}

class AudioStreamService {
  private socket: Socket | null = null;
  private sessionId: string | null = null;
  private config: AudioStreamConfig | null = null;
  private isConnected = false;
  private listenersSetup = false;

  connect(config: AudioStreamConfig): void {
    this.config = config;
    this.sessionId = config.sessionId;
    this.socket = config.socket; // ✅ Use existing socket

    // Only setup listeners once
    if (!this.listenersSetup) {
      this.setupListeners();
      this.listenersSetup = true;
    }

    // Check if socket is already connected
    if (this.socket.connected) {
      this.isConnected = true;
      this.config?.onStatus?.('connected');
    } else {
      // Listen for connection
      this.socket.on('connect', () => {
        this.isConnected = true;
        this.config?.onStatus?.('connected');
      });
    }
  }

  private setupListeners(): void {
    if (!this.socket) return;

    // Remove any existing listeners to avoid duplicates
    this.socket.off('audio:transcription');
    this.socket.off('audio:ai-response');
    this.socket.off('audio:evaluation');
    this.socket.off('audio:status');
    this.socket.off('audio:error');
    this.socket.off('audio:stop-tts');
    this.socket.off('audio:clear-pending');

    this.socket.on('audio:transcription', (data) => {
      console.log('📝 Transcription received:', data.text?.slice(0, 50) + '...');
      this.config?.onTranscription?.(data);
    });

    this.socket.on('audio:ai-response', (data) => {
      console.log('🤖 AI Response:', data.text?.slice(0, 50) + '...');
      this.config?.onAIResponse?.(data);
    });

    this.socket.on('audio:evaluation', (data) => {
      console.log('📊 Evaluation received');
      this.config?.onEvaluation?.(data);
    });

    this.socket.on('audio:status', (data) => {
      console.log('ℹ️ Audio status:', data.status);
      this.config?.onStatus?.(data.status);
    });

    this.socket.on('audio:error', (data) => {
      console.error('❌ Audio error:', data.message);
      this.config?.onError?.(data.message);
    });

    this.socket.on('audio:stop-tts', () => {
      console.log('🔇 AI speaking stopped');
    });

    this.socket.on('audio:clear-pending', () => {
      console.log('🧹 Pending cleared');
    });
  }

  // Send audio chunk
  sendAudioChunk(audioBlob: Blob): void {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Not connected, cannot send audio chunk');
      return;
    }

    this.blobToBase64(audioBlob, (base64) => {
      this.socket?.emit('audio:chunk', {
        sessionId: this.sessionId,
        audio: base64,
        timestamp: Date.now(),
      });
    });
  }

  // Send final audio
  sendFinalAudio(audioBlob: Blob): void {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Not connected, cannot send final audio');
      return;
    }

    this.blobToBase64(audioBlob, (base64) => {
      this.socket?.emit('audio:final', {
        sessionId: this.sessionId,
        audio: base64,
        timestamp: Date.now(),
      });
      this.config?.onStatus?.('processing');
    });
  }

  // Signal speech start
  signalSpeechStart(): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('audio:speech-start', {
      sessionId: this.sessionId,
    });
    console.log('🎤 User started speaking - interrupting AI');
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  disconnect(): void {
    // Don't disconnect the socket, just remove listeners
    if (this.socket) {
      this.socket.off('audio:transcription');
      this.socket.off('audio:ai-response');
      this.socket.off('audio:evaluation');
      this.socket.off('audio:status');
      this.socket.off('audio:error');
      this.socket.off('audio:stop-tts');
      this.socket.off('audio:clear-pending');
    }
    this.isConnected = false;
    this.listenersSetup = false;
    console.log('🔌 Audio stream disconnected');
  }

  private blobToBase64(blob: Blob, callback: (base64: string) => void): void {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      callback(base64);
    };
    reader.onerror = () => {
      console.error('Failed to convert blob to base64');
    };
    reader.readAsDataURL(blob);
  }
}

export const audioStreamService = new AudioStreamService();