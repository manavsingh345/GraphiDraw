import { useEffect, useRef, useState } from "react";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjhiOGE0Zi00OWI5LTRlNWUtYmJjNi0wZjVmZGMyZjI3NmIiLCJpYXQiOjE3Njg1NzA5MjEsImV4cCI6MTc2OTE3NTcyMX0.FzpKa7uq0J4nJsCEDih8bjgvn9Ze8NNG43sjXoWKuZI");
    socketRef.current = ws;

    ws.onopen = () => {
      setLoading(false);
    };

    ws.onclose = () => {
      setLoading(true);
      socketRef.current = null;
    };

    ws.onerror = () => {
      setLoading(true);
    };

    return () => {
      ws.close(); // ✅ CLEANUP (VERY IMPORTANT)
    };
  }, []);

  return {
    socket: socketRef.current,
    loading,
  };
}
