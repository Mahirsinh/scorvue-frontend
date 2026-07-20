// types/interview.ts
export interface InterviewPreference {
  _id: string;
  user: string;
  sessionId: string;
  interviewType: 'resume-jd' | 'resume-only' | 'jd-only' | 'topic-based' | 'coding' | 'system-design' | 'hr';
  role: string;
  experienceLevel: 'fresher' | '0-1' | '1-3' | '3-5' | '5+';
  difficulty: 'easy' | 'medium' | 'hard' | 'faang';
  language: 'english' | 'hindi' | 'mix';
  focusAreas: string[];
  resumeFile?: string;
  resumeFileId?: string | null;
  jdText?: string;
  jdFile?: string;
  jdFileId?: string | null;
  permissions: {
    camera: boolean;
    microphone: boolean;
    speaker: boolean;
  };
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  duration: number; // ✅ Add this
  createdAt: string;
  updatedAt: string;
}


export interface CreateInterviewPreferenceRequest {
  interviewType: string;
  role: string;
  experienceLevel: string;
  difficulty: string;
  language: string;
  focusAreas: string[];
  resumeFileId?: string | null;
  jdText?: string;
  permissions: {
    camera: boolean;
    microphone: boolean;
    speaker: boolean;
  };
}

export interface UpdateInterviewStatusRequest {
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}