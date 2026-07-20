// services/interviewApi.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface InterviewPreferenceData {
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

export interface InterviewPreferenceResponse {
  success: boolean;
  data: {
    sessionId: string;
    _id: string;
    user: string;
    interviewType: string;
    role: string;
    experienceLevel: string;
    difficulty: string;
    language: string;
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
    status: "pending" | "in-progress" | "completed" | "cancelled";
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UserPreferencesResponse {
  success: boolean;
  data: InterviewPreferenceResponse['data'][];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const interviewApi = {
  /**
   * Create a new interview preference/session
   */
  createPreference: async (data: InterviewPreferenceData): Promise<InterviewPreferenceResponse> => {
    const response = await axios.post(`${API_URL}/interview/preferences`, data, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Get interview preference by session ID
   */
  getPreference: async (sessionId: string): Promise<InterviewPreferenceResponse> => {
    const response = await axios.get(`${API_URL}/interview/preferences/${sessionId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Get all interview preferences for the current user
   */
  getUserPreferences: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<UserPreferencesResponse> => {
    const response = await axios.get(`${API_URL}/interview/preferences`, {
      params,
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Update interview status
   */
  updateStatus: async (sessionId: string, status: string): Promise<{ success: boolean; data: any }> => {
    const response = await axios.put(
      `${API_URL}/interview/preferences/${sessionId}/status`,
      { status },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete interview preference
   */
  deletePreference: async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`${API_URL}/interview/preferences/${sessionId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Upload resume file for interview
   */
  uploadResume: async (sessionId: string, file: File): Promise<{ success: boolean; data: any }> => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await axios.post(
      `${API_URL}/interview/preferences/${sessionId}/resume`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload job description file for interview
   */
  uploadJdFile: async (sessionId: string, file: File): Promise<{ success: boolean; data: any }> => {
    const formData = new FormData();
    formData.append('jd', file);
    
    const response = await axios.post(
      `${API_URL}/interview/preferences/${sessionId}/jd`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default interviewApi;