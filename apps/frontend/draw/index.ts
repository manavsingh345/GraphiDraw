import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import { start } from "repl";

function resize(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
type Shape = {
    type:"rect";
    x:number;
    y:number;
    width:number;
    height:number;
} | {
    type:"circle";
    centerX:number;
    centerY:number;
    radius:number;
} | {
    type:"pencil";
    startX:number;
    startY:number;
    endX:number;
    endY:number;
}


export async function initDraw(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,roomId:string,socket:WebSocket){
  resize(canvas);
  let existingShapes: Shape[] = await getExistingShapes(roomId);

  const onResize = () =>{
    resize(canvas);
    clearCanvas(existingShapes,ctx,canvas);
  } 
  window.addEventListener("resize", onResize);

  //socket logic 
  socket.onmessage = (event)=>{
      const message=JSON.parse(event.data);
      if(message.type === "chat"){
        const parsedShape=JSON.parse(message.message);
        existingShapes.push(parsedShape.shape);
        clearCanvas(existingShapes,ctx,canvas);
      }
  }

   clearCanvas(existingShapes,ctx,canvas);
  
  let clicked = false;
  let startX = 0;
  let startY = 0;

  const getPos = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onMouseDown = (e: MouseEvent) => {
    clicked = true;
     const pos = getPos(e);
     startX = pos.x;
     startY = pos.y;
  };

  const onMouseUp = (e:MouseEvent) => {
    clicked = false;

    const pos = getPos(e);
    const x = Math.min(startX,pos.x);
    const y = Math.min(startY,pos.y);
    const width = Math.abs(pos.x - startX);
    const height = Math.abs(pos.y - startY);

    // @ts-ignore
    const selectedTool=window.selectedTool;
    let shape: Shape | null = null;
    if(selectedTool==='rect'){
      shape = { 
        type:'rect',
        x:startX,
        y:startY,
        width,
        height
      }
    }else if(selectedTool==='circle'){
      const x = Math.min(startX,pos.x);
      const y = Math.min(startY,pos.y);
      const w = Math.abs(pos.x - startX);
      const h = Math.abs(pos.y - startY);

      const radius=Math.max(w,h)/2;
       shape = { 
        type:'circle',
        radius:radius,
        centerX:x + radius,
        centerY:y + radius,
      }
      
    }

    if(!shape) return;
    existingShapes.push(shape);

    if(socket.readyState === WebSocket.OPEN){
    socket.send(JSON.stringify({
      type:"chat",
      roomId: Number(roomId),
      message:JSON.stringify({shape})
    }))
  }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!clicked) return;

    const pos = getPos(e);
    const width = pos.x - startX;
    const height = pos.y - startY;
    clearCanvas(existingShapes,ctx,canvas);
    ctx.strokeStyle = "white";
    //@ts-ignore
    const selectedTool=window.selectedTool;
    if(selectedTool==='rect'){
      ctx.strokeRect(startX, startY, width, height);
    }else if(selectedTool === 'circle'){
      const x = Math.min(startX,pos.x);
      const y = Math.min(startY,pos.y);
      const w = Math.abs(pos.x - startX);
      const h = Math.abs(pos.y - startY);

      const radius = Math.max(w,h)/2;
      const centerX = x + radius;
      const centerY = y + radius;
      ctx.beginPath();
      ctx.arc(centerX,centerY,radius,0,Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
    
  };

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);

  return () => {
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("mousemove", onMouseMove);
  };
}

function clearCanvas(existingShapes:Shape[]=[],ctx:CanvasRenderingContext2D,canvas:HTMLCanvasElement){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        existingShapes.map((shape)=>{
            if(shape.type==="rect"){
              ctx.strokeStyle = "white";
              ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }else if(shape.type === 'circle'){
              ctx.beginPath();
              ctx.arc(shape.centerX,shape.centerY,shape.radius,0,Math.PI * 2);
              ctx.stroke();
              ctx.closePath();
            }
        })
}


async function getExistingShapes(roomId: string){
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages ?? [];
    if (messages.length === 0) {
      console.log("No existing shapes (new room)");
      return [];
    }
    const shapes = messages.map((x:{message:string})=>{
        const messageData = JSON.parse(x.message);
        return messageData.shape;
    })
    return shapes;
}