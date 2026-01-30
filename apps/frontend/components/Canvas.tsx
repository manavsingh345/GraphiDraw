import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";

type CanvasProps = {
  roomId: string;
  socket:WebSocket;
};
export function Canvas({ roomId,socket }: CanvasProps){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let cleanup: (() => void) | undefined;

        const setup = async () => {
        cleanup = await initDraw(canvas, ctx, roomId,socket); 
        };

        setup();

        return () => {
        cleanup?.();
        };
    }, [roomId,socket]); 
    return (
        <canvas ref={canvasRef}/>
    )
}