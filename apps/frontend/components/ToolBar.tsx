import { Circle, Hand, MousePointer2, Pencil, RectangleHorizontal,Text,Trash } from "lucide-react";
import { IconButton } from "./IconButton";

export type Tool = "circle" | "rect" | "pencil" | "text" | "reset" | "hand" | "select";
export default function ToolBar({
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
          onClick={() => setSelected("select")}
          icon={<MousePointer2 />}
          label="Select"
          active={selectedTool === "select"}
        />
        <IconButton
          onClick={() => setSelected("hand")}
          icon={<Hand />}
          label="Hand"
          active={selectedTool === "hand"}
        />
        <IconButton
          onClick={() => setSelected("pencil")}
          icon={<Pencil />}
          label="Pencil"
          active={selectedTool === "pencil"}
        />
        <IconButton
          onClick={() => setSelected("circle")}
          icon={<Circle />}
          label="Circle"
          active={selectedTool === "circle"}
        />
        <IconButton
          onClick={() => setSelected("rect")}
          icon={<RectangleHorizontal />}
          label="Rectangle"
          active={selectedTool === "rect"}
        />
        <IconButton
          onClick={() => setSelected("text")}
          icon={<Text/>}
          label="Text"
          active={selectedTool === "text"}
        />
        <IconButton
          onClick={() => setSelected("reset")}
          icon={<Trash/>}
          label="Reset"
          active={selectedTool === "reset"}
        />
        
        
      </div>
    </div>
  );
}