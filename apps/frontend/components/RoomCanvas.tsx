"use client";
import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "./Canvas";


type CanvasProps = {
  roomPublicId: string;
};

export default function RoomCanvas({ roomPublicId }: CanvasProps) {
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const UNAUTHORIZED_CLOSE_CODE = 4001;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const stored = localStorage.getItem("token") ?? sessionStorage.getItem("token");
    if (!stored) {
      setRequiresAuth(true);
      setError("Please sign in to continue.");
      router.replace("/signin");
      return;
    }
    setRequiresAuth(false);
    setToken(stored);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    let disposed = false;
    setError("");
    const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
    ws.onopen = () => {
      if (disposed) return;
      setSocket(ws);
      setError("");
      ws.send(JSON.stringify({ type: "join_room", roomPublicId }));
    };
    ws.onerror = () => {
      if (disposed) return;
      setError("WebSocket connection failed. Please retry.");
    };
    ws.onclose = (event) => {
      if (disposed) return;
      setSocket(null);
      if (event.code === UNAUTHORIZED_CLOSE_CODE) {
        setRequiresAuth(true);
        setError("Session expired. Please sign in again.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        router.replace("/signin");
      }
    };

    return () => {
      disposed = true;
      ws.close();
    };
  }, [token, roomPublicId, retryCount, router]);

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
  return (
    <>
      <Canvas roomPublicId={roomPublicId} socket={socket} />
    </>
  );
}

