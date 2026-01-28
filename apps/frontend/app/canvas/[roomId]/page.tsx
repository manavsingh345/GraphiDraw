"use client";

import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";


export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cleanup = initDraw(canvas, ctx);

    return cleanup;
  }, []);

  return (
    <canvas ref={canvasRef}/>
  );
}
