"use client";
import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Canvas } from "./Canvas";

type CanvasProps = {
  roomPublicId: string;
};

export default function RoomCanvas({ roomPublicId }: CanvasProps) {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const UNAUTHORIZED_CLOSE_CODE = 4001;
  const requiresAuth = isLoaded && !isSignedIn;
  const error =
    (requiresAuth ? "Please sign in to continue." : null) ??
    sessionError ??
    wsError;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (requiresAuth) {
      router.replace("/signin");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    getToken()
      .then((nextToken) => {
        setToken(nextToken);
        if (!nextToken) {
          setSessionError("Unable to start an authenticated session. Please sign in again.");
        }
      })
      .catch(() => {
        setSessionError("Unable to start an authenticated session. Please sign in again.");
      });
  }, [requiresAuth, isSignedIn, router, getToken]);

  useEffect(() => {
    if (!token) return;

    let disposed = false;
    const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
    ws.onopen = () => {
      if (disposed) return;
      setSocket(ws);
      setWsError(null);
      ws.send(JSON.stringify({ type: "join_room", roomPublicId }));
    };
    ws.onerror = () => {
      if (disposed) return;
      setWsError("WebSocket connection failed. Please retry.");
    };
    ws.onclose = (event) => {
      if (disposed) return;
      setSocket(null);
      if (event.code === UNAUTHORIZED_CLOSE_CODE) {
        setSessionError("WebSocket session unauthorized or expired. Please refresh the page.");
        return;
      }
      setWsError("WebSocket connection failed. Please retry.");
    };

    return () => {
      disposed = true;
      ws.close();
    };
  }, [token, roomPublicId, retryCount]);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        {requiresAuth ? (
          <button className="mt-3 underline" onClick={() => router.push("/signin")}>
            Go to Sign In
          </button>
        ) : (
          <button className="mt-3 underline" onClick={() => setRetryCount((c) => c + 1)}>
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card sketch-border shadow-sketch px-6 py-4 rounded-xl text-center">
          <div className="text-lg font-semibold">Connecting to server...</div>
          <div className="text-sm text-muted-foreground mt-1">Please wait a moment</div>
        </div>
      </div>
    );
  }

  return <Canvas roomPublicId={roomPublicId} socket={socket} />;
}
