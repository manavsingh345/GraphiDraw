import { useEffect, useRef, useState } from "react";
import { Game } from "@/draw/Game";
import ToolBar from "./ToolBar";
import GraphiBar from "./GraphiBar";


type CanvasProps = {
  roomId: string;
  socket: WebSocket;
};

export type Tool = "circle" | "rect" | "pencil" | "text" | "reset" | "hand" | "select";

export function Canvas({ roomId, socket }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [selectedTool, setSelected] = useState<Tool>("select");
  const [strokeColor, setStrokeColor] = useState("#A84D00");
  const [fillColor, setFillColor] = useState("transparent");

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

  // game init
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const g = new Game(canvas, roomId, socket);
    setGame(g);

    return () => {
      g?.destroy?.(); //cleanup hook
    };
  }, [roomId, socket]);
  

  return (
    <>
      <GraphiBar
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        fillColor={fillColor}
        setFillColor={setFillColor}
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 block"
      />
      <ToolBar selectedTool={selectedTool} setSelected={setSelected} />
    </>
  );
}


