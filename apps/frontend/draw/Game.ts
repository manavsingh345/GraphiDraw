import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

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
      startX: number;
      startY: number;
      endX: number;
      endY: number;
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

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;

    this.resize();
    window.addEventListener("resize", this.handleResize);

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  /* -------------------- CANVAS SIZE -------------------- */

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private handleResize = () => {
    this.resize();
    this.clearCanvas();
  };

  private onMouseDown!: (e: MouseEvent) => void;
  private onMouseUp!: (e: MouseEvent) => void;
  private onMouseMove!: (e: MouseEvent) => void;
  /* -------------------- TOOL -------------------- */

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  /* -------------------- INIT -------------------- */

  private async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  /* -------------------- SOCKET -------------------- */

  private initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsed = JSON.parse(message.message);
        this.existingShapes.push(parsed.shape);
        this.clearCanvas();
      }
    };
  }

  /* -------------------- DRAW -------------------- */

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "white";

    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(
          shape.x,
          shape.y,
          shape.width,
          shape.height
        );
      } else if (shape.type === "circle") {
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
    });
  }

  /* -------------------- MOUSE -------------------- */

  private initMouseHandlers() {
    const getPos = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    this.onMouseDown = (e: MouseEvent) => {
      this.clicked = true;
      const pos = getPos(e);
      this.startX = pos.x;
      this.startY = pos.y;
    };

    this.onMouseUp = (e: MouseEvent) => {
      if (!this.clicked) return;
      this.clicked = false;

      const pos = getPos(e);
      let shape: Shape | null = null;

      if (this.selectedTool === "rect") {
        const x = Math.min(this.startX, pos.x);
        const y = Math.min(this.startY, pos.y);
        const width = Math.abs(pos.x - this.startX);
        const height = Math.abs(pos.y - this.startY);

        shape = { type: "rect", x, y, width, height };
      }

      if (this.selectedTool === "circle") {
        const x = Math.min(this.startX, pos.x);
        const y = Math.min(this.startY, pos.y);
        const w = Math.abs(pos.x - this.startX);
        const h = Math.abs(pos.y - this.startY);
        const radius = Math.max(w, h) / 2;

        shape = {
          type: "circle",
          centerX: x + radius,
          centerY: y + radius,
          radius,
        };
      }

      if (!shape) return;

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
    };

    this.onMouseMove = (e: MouseEvent) => {
      if (!this.clicked) return;

      const pos = getPos(e);
      this.clearCanvas();
      this.ctx.strokeStyle = "white";

      if (this.selectedTool === "rect") {
        this.ctx.strokeRect(
          this.startX,
          this.startY,
          pos.x - this.startX,
          pos.y - this.startY
        );
      }

      if (this.selectedTool === "circle") {
        const x = Math.min(this.startX, pos.x);
        const y = Math.min(this.startY, pos.y);
        const w = Math.abs(pos.x - this.startX);
        const h = Math.abs(pos.y - this.startY);
        const radius = Math.max(w, h) / 2;

        this.ctx.beginPath();
        this.ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    };

    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.socket.onmessage = null;
 }

}
