import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleEllipsis, RectangleHorizontal, RectangleVertical } from "lucide-react";

type CanvasProps = {
  roomId: string;
  socket:WebSocket;
};
type Shape= "circle" | "rect" | "pencil";

export function Canvas({ roomId,socket }: CanvasProps){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool,setSelected] = useState<Shape>("circle");

    useEffect(()=>{
        //@ts-ignore
        window.selectedTool=selectedTool;
    },[selectedTool]);

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
        <>
            <canvas ref={canvasRef}/>
            <ToopBar setSelected={setSelected} selectedTool={selectedTool}/>
        </>
    )
}

function ToopBar({selectedTool,setSelected}:{selectedTool:Shape,setSelected:(s:Shape)=>void}){
  return <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-white flex justify-center items-center">
          <div className="flex gap-2">
          <IconButton onClick={()=>{setSelected("pencil")}} icon={<Pencil/>} active={selectedTool==="pencil"}/>
          <IconButton onClick={()=>{setSelected("circle")}} icon={<Circle/>} active={selectedTool==="circle"}/>
          <IconButton onClick={()=>{setSelected("rect")}} icon={<RectangleHorizontal/>} active={selectedTool==="rect"}/>
          </div>
      </div>
}