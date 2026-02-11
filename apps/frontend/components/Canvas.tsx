import { useEffect, useRef, useState } from "react";
import { Game } from "@/draw/Game";
import ToolBar from "./ToolBar";
import GraphiBar from "./GraphiBar";


type CanvasProps = {
  roomPublicId: string;
  socket: WebSocket;
};

export type Tool = "circle" | "rect" | "pencil" | "text" | "reset" | "hand" | "select" | "eraser";

export function Canvas({ roomPublicId, socket }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [selectedTool, setSelected] = useState<Tool>("select");
  const [strokeColor, setStrokeColor] = useState("#A84D00");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);

  // tool sync and reset
  useEffect(() => {
    if(!game) return;

    if(selectedTool === 'reset'){
      game.resetCanvas();
      setSelected('select');
      return;
    }

    game.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (!game) return;
    game.setStrokeColor(strokeColor);
  }, [strokeColor, game]);

  useEffect(() => {
    if (!game) return;
    game.setFillColor(fillColor);
  }, [fillColor, game]);

  useEffect(() => {
    if (!game) return;
    game.setStrokeWidth(strokeWidth);
  }, [strokeWidth, game]);

  // game init
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const g = new Game(canvas, roomPublicId, socket);
    setGame(g);

    return () => {
      g?.destroy?.(); //cleanup hook
    };
  }, [roomPublicId, socket]);
  

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50  items-center gap-3 flex flex-col">
        <a
          href="https://manavv.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/90 text-slate-900 shadow-lg shadow-slate-900/10 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-xl"
          aria-label="Manav Portfolio"
          title="Manav Portfolio"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm6.93 9h-2.14a15.6 15.6 0 0 0-1.1-4.06A8.02 8.02 0 0 1 18.93 11zM12 4.07c.95 1.24 1.7 2.95 2.13 4.93H9.87C10.3 7.02 11.05 5.31 12 4.07zM5.07 11a8.02 8.02 0 0 1 3.24-4.06A15.6 15.6 0 0 0 7.2 11H5.07zM7.2 13c.2 1.48.62 2.85 1.21 4.06A8.02 8.02 0 0 1 5.07 13H7.2zm2.67 0h4.26c-.43 1.98-1.18 3.69-2.13 4.93-.95-1.24-1.7-2.95-2.13-4.93zm5.72 4.06c.59-1.21 1.01-2.58 1.21-4.06h2.13a8.02 8.02 0 0 1-3.34 4.06zM16.8 11h-9.6c.17-1.53.54-2.91 1.08-4.06h7.44c.54 1.15.91 2.53 1.08 4.06z" />
          </svg>
        </a>
        <a
          href="https://github.com/manavsingh345/GraphiDraw"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/90 text-slate-900 shadow-lg shadow-slate-900/10 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-xl"
          aria-label="GraphiDraw GitHub"
          title="GraphiDraw on GitHub"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.38-3.37-1.38-.45-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.36 1.12 2.94.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.86c.85 0 1.7.12 2.5.35 1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.33.68.98.68 1.98 0 1.43-.01 2.59-.01 2.95 0 .27.18.59.69.49A10.05 10.05 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
          </svg>
        </a>
      </div>
      <GraphiBar
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        fillColor={fillColor}
        setFillColor={setFillColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 block"
      />
      <ToolBar selectedTool={selectedTool} setSelected={setSelected} />
    </>
  );
}


