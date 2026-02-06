"use client";
import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "./Canvas";


type CanvasProps = {
  roomId: string;
};

export default function RoomCanvas({ roomId }: CanvasProps) {
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const stored = localStorage.getItem("token");
    if (!stored) {
      setError("Please sign in to continue.");
      return;
    }
    setToken(stored);
  }, []);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({ type: "join_room", roomId: Number(roomId) }));
    };
    ws.onerror = () => {
      setError("WebSocket connection failed.");
    };
    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [token, roomId]);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button
          className="mt-3 underline"
          onClick={() => router.push("/signin")}
        >
          Go to Sign In
        </button>
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
      <Canvas roomId={roomId} socket={socket} />
    </>
  );
}

