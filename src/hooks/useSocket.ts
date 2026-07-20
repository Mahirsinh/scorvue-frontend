// hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socketUpdateSession } from "../features/session/sessionSlice";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import type { RootState } from "../app/store";
import type { SocketUpdatePayload } from "../types/session";

const BACKEND_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const useSocket = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const socketRef = useRef<Socket | null>(null);
    const user = useSelector((state: RootState) => state.auth.user);

    const dispatchRef = useRef(dispatch);
    const navigateRef = useRef(navigate);

    useEffect(() => {
        dispatchRef.current = dispatch;
        navigateRef.current = navigate;
    }, [dispatch, navigate]);

    const userId = user?._id || user?.id;

    useEffect(() => {
        if (!userId) return;

        if (socketRef.current?.connected) return;

        const socket: Socket = io(BACKEND_URL, {
            query: { userId },
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to socket');
            socket.emit('joinRoom', { userId });
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected from socket:', reason);
        });

        const handleTokenRefresh = () => {
            if (socket.disconnected) {
                console.log('Token refreshed, attempting to reconnect socket...');
                socket.connect();
            }
        };
        window.addEventListener('auth_token_refreshed', handleTokenRefresh);

        socket.on('sessionUpdate', (data: SocketUpdatePayload) => {
            console.log('Session updated', data);
            dispatchRef.current(socketUpdateSession(data));

            const status = (data.status || "").toUpperCase();
            
            if (status === "SESSION COMPLETED" || status === "COMPLETED") {
                console.log(`✅ Session completed, navigating to /review/${data.sessionId}`);
                setTimeout(() => {
                    navigateRef.current(`/review/${data.sessionId}`);
                }, 100);
            } else if (status === "QUESTIONS_READY") {
                console.log(`📝 Questions ready, navigating to /interview/${data.sessionId}`);
                navigateRef.current(`/interview/${data.sessionId}`);
            }
        });

        // ✅ NEW: free plan report limit hit — redirect to the plans page
        socket.on('review:upgrade_required', (data: { sessionId: string; message: string }) => {
            console.log('🔒 Upgrade required:', data);
            toast.warning(data.message || "You've used your free interview report. Please upgrade.");
            navigateRef.current('/plans');
        });

        return () => {
            window.removeEventListener('auth_token_refreshed', handleTokenRefresh);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [userId]);

    return socketRef;
};

export default useSocket;