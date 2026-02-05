import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { HTTP_BACKEND } from "@/config";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
    }
  | {
    type:"text",
    x:number;
    y:number;
    text:string;
    fontSize:number;
    fontFamily:string;
    fontWeight: 300;
  };

    
export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private socket: WebSocket;

  private clicked = false;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private currentStroke: { x: number; y: number }[] = [];    //for pencil
  private activeTextIndex: number | null = null;             //for text
  private isTyping = false;
  private showCursor = true;                                //for text blinking cursor
  private cursorInterval: number | null = null;

  private cameraX = 0;         //cameraX,cameraY,lastPanX,lastPanY  for infinite canvas
  private cameraY = 0;
  private lastPanX = 0;
  private lastPanY = 0;

  private draftShape: Shape | null = null;   //imp for will drawing shapes on infinite anywhere




  private onMouseDown!: (e: MouseEvent) => void;
  private onMouseUp!: (e: MouseEvent) => void;
  private onMouseMove!: (e: MouseEvent) => void;
  

  constructor(canvas: HTMLCanvasElement,roomId: string,socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;

    this.resize();
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("keydown", this.handleKeyDown);
    this.currentStroke=[]
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  // CANVAS SIZE  
  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private handleResize = () => {
    this.resize();
    this.clearCanvas();
  };

  

  // TOOL or Shapes
  setTool(tool: Tool) {
    this.selectedTool = tool;

    if (tool === "hand") {
      this.canvas.style.cursor = "grab";
    } else if (tool === "text") {
      this.canvas.style.cursor = "text";
    } else {
      this.canvas.style.cursor = "crosshair";
    }
  }

  // init
  private async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  //SOCKET 
  private initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsed = JSON.parse(message.message);
        this.existingShapes.push(parsed.shape);
        this.clearCanvas();
      }
      if(message.type === "reset"){
        this.existingShapes = [];
        this.activeTextIndex = null;
        this.isTyping = false;
        this.stopCursorBlink();
        this.clearCanvas();
      }
    };
  }

  // DRAW 
  private clearCanvas() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.cameraX, this.cameraY);


    this.ctx.strokeStyle = "white";

    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x,shape.y,shape.width,shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(shape.centerX,shape.centerY,shape.radius,0,Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      }else if(shape.type === "pencil"){
        if (shape.points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(shape.points[0].x, shape.points[0].y);

        shape.points.forEach(p => {
            this.ctx.lineTo(p.x, p.y);
        });

        this.ctx.stroke();
        this.ctx.closePath();
      }else if(shape.type === "text"){
        this.ctx.font = `${shape.fontWeight} ${shape.fontSize}px ${shape.fontFamily}`;
        this.ctx.fillStyle="white";
        this.ctx.textBaseline = "top";
        let displayText = shape.text;

      if (this.isTyping && this.activeTextIndex !== null && shape === this.existingShapes[this.activeTextIndex] && this.showCursor) {
        displayText += "|";
      }

        this.ctx.fillText(displayText, shape.x, shape.y);
      }
    });

    //draw active pencil stroke fixed with pan everywhere in world draw not break imp.
    if (this.selectedTool === "pencil" && this.currentStroke.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.currentStroke[0].x, this.currentStroke[0].y);

        this.currentStroke.forEach(p => {
          this.ctx.lineTo(p.x, p.y);
        });

        this.ctx.stroke();
        this.ctx.closePath();
    }
    //same for rect and circle
    if (this.draftShape) {
        const shape = this.draftShape;

        if (shape.type === "rect") {
          this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }

        if (shape.type === "circle") {
          this.ctx.beginPath();
          this.ctx.arc(
            shape.centerX,
            shape.centerY,
            shape.radius,
            0,
            Math.PI * 2
          );
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }

    this.ctx.restore();
  }


  private initMouseHandlers() {
    const getPos = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left - this.cameraX,
        y: e.clientY - rect.top - this.cameraY,
      };
    };

    this.onMouseDown = (e: MouseEvent) => {
      this.clicked = true;
      const pos = getPos(e);
      this.startX = pos.x;
      this.startY = pos.y;

      if(this.selectedTool === 'pencil'){
        this.currentStroke = [{ x: pos.x, y: pos.y }];
        return;
      }

      if (this.selectedTool === "hand") {
        this.canvas.style.cursor = "grabbing";
        this.lastPanX = e.clientX;
        this.lastPanY = e.clientY;
        return;
      }

      
      if(this.selectedTool === 'text'){
        const textShape: Shape = {
        type: "text",
        x: pos.x,
        y: pos.y,
        text: "",
        fontSize: 20,
        fontFamily: "Cursive, Arial, sans-serif",
        fontWeight: 300
      };

        this.existingShapes.push(textShape);
        this.activeTextIndex = this.existingShapes.length - 1;
        this.isTyping = true;
        this.startCursorBlink();
        this.clearCanvas();
      }
    };

    

    this.onMouseUp = (e: MouseEvent) => {
      if (!this.clicked) return;
      this.clicked = false;

      const pos = getPos(e);
      let shape: Shape | null = null;

      if (this.selectedTool === "text") return;
      if (this.selectedTool === "hand"){
        this.canvas.style.cursor = "grab";
        return;
      } 

      if (this.draftShape) {
        const shape = this.draftShape;
        this.draftShape = null;

        this.existingShapes.push(shape);
        this.clearCanvas();

        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(
            JSON.stringify({
              type: "chat",
              roomId: Number(this.roomId),
              message: JSON.stringify({ shape }),
            })
          );
        }
      return;
      }
      
      if (this.selectedTool === "pencil") {
        shape = {
            type: "pencil",
            points: this.currentStroke,
        };
        this.currentStroke = []; // reset for next stroke
      }


      if (!shape) return;

      this.existingShapes.push(shape);
      this.clearCanvas();

      //  Send Shape data TO DB
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            type: "chat",
            roomId: Number(this.roomId),
            message: JSON.stringify({ shape }),
          })
        );
      }
    };

    this.onMouseMove = (e: MouseEvent) => {
      if (!this.clicked) return;

      const pos = getPos(e);
      if(this.selectedTool === 'pencil'){
        this.currentStroke.push({ x: pos.x, y: pos.y });
        this.clearCanvas();
        return;
      }
      if (this.selectedTool === "hand" && this.clicked) {
        const dx = e.clientX - this.lastPanX;
        const dy = e.clientY - this.lastPanY;

        this.cameraX += dx;
        this.cameraY += dy;

        this.lastPanX = e.clientX;
        this.lastPanY = e.clientY;

        this.clearCanvas();
        return;
      }


      if (this.selectedTool === "rect") {
        const x = Math.min(this.startX, pos.x);
        const y = Math.min(this.startY, pos.y);
        const width = Math.abs(pos.x - this.startX);
        const height = Math.abs(pos.y - this.startY);

        this.draftShape = { type: "rect", x, y, width, height };
        this.clearCanvas();
        return;
      }

      if (this.selectedTool === "circle") {
        const x = Math.min(this.startX, pos.x);
        const y = Math.min(this.startY, pos.y);
        const w = Math.abs(pos.x - this.startX);
        const h = Math.abs(pos.y - this.startY);
        const radius = Math.max(w, h) / 2;

        this.draftShape = {
          type: "circle",
          centerX: x + radius,
          centerY: y + radius,
          radius,
        };
        this.clearCanvas();
        return;
      }  
    };

    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
  }

  //for text 
  private handleKeyDown = (e: KeyboardEvent) => {
      if (!this.isTyping || this.activeTextIndex === null) return;

      const shape = this.existingShapes[this.activeTextIndex];
      if (shape.type !== "text") return;

      if (e.key === "Enter") {
        const shape = this.existingShapes[this.activeTextIndex];
        this.isTyping = false;
        this.activeTextIndex = null;
        this.stopCursorBlink();

        //  SEND TEXT TO DB
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(
            JSON.stringify({
              type: "chat",
              roomId: Number(this.roomId),
              message: JSON.stringify({ shape }),
            })
          );
        }
        return;
      }

      if (e.key === "Backspace") {
        shape.text = shape.text.slice(0, -1);
      } else if (e.key.length === 1) {
        shape.text += e.key;
      }

      this.clearCanvas();
  };

  private startCursorBlink() {
    if (this.cursorInterval) return;

    this.cursorInterval = window.setInterval(() => {
      this.showCursor = !this.showCursor;
      this.clearCanvas();
    }, 500);
  }

  private stopCursorBlink() {
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
      this.cursorInterval = null;
    }
    this.showCursor = false;
  }

  public async resetCanvas() {
    this.existingShapes = [];
    this.activeTextIndex = null;
    this.isTyping = false;
    this.stopCursorBlink();
    this.clearCanvas();

    //clear DB
    await fetch(`${HTTP_BACKEND}/chats/${this.roomId}`, {
      method: "DELETE",
    });

    //notify others via socket
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: "reset",
          roomId: Number(this.roomId),
        })
      );
    }
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("keydown", this.handleKeyDown);
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.socket.onmessage = null;
    this.stopCursorBlink();
 }

}
