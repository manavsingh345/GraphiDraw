import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Hand, Pencil, RectangleHorizontal, Text, TextAlignCenter, Trash } from "lucide-react";
import { Game } from "@/draw/Game";

type CanvasProps = {
  roomId: string;
  socket: WebSocket;
};

export type Tool = "circle" | "rect" | "pencil" | "text" | "reset" | "hand";

export function Canvas({ roomId, socket }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [selectedTool, setSelected] = useState<Tool>("pencil");

  // tool sync and reset
  useEffect(() => {
    if(!game) return;

    if(selectedTool === 'reset'){
      game.resetCanvas();
      setSelected('pencil');
      return;
    }

    game.setTool(selectedTool);
  }, [selectedTool, game]);

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
      <canvas
        ref={canvasRef}
        className="fixed inset-0 block"
      />
      <ToolBar selectedTool={selectedTool} setSelected={setSelected} />
    </>
  );
}

function ToolBar({
  selectedTool,
  setSelected,
}: {
  selectedTool: Tool;
  setSelected: (s: Tool) => void;
}) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-white rounded-md shadow px-2 py-1">
      <div className="flex gap-2">
        <IconButton
          onClick={() => setSelected("pencil")}
          icon={<Pencil />}
          active={selectedTool === "pencil"}
        />
        <IconButton
          onClick={() => setSelected("circle")}
          icon={<Circle />}
          active={selectedTool === "circle"}
        />
        <IconButton
          onClick={() => setSelected("rect")}
          icon={<RectangleHorizontal />}
          active={selectedTool === "rect"}
        />
        <IconButton
          onClick={() => setSelected("text")}
          icon={<Text/>}
          active={selectedTool === "text"}
        />
        <IconButton
          onClick={() => setSelected("reset")}
          icon={<Trash/>}
          active={selectedTool === "reset"}
        />
        <IconButton
          onClick={() => setSelected("hand")}
          icon={<Hand />}   
          active={selectedTool === "hand"}
        />

      </div>
    </div>
  );
}
