// types/user.ts
interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    avatar?: string | null;
    token: string;
    preferredRole?: string;
    plan?: string; // ✅ NEW - "free" | "elite"
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isError: boolean;
    message: string;
    isSuccess: boolean;
    isLoading: boolean;
    isProfileLoading: boolean;
}

export type { User, AuthState };