import { Game } from "./Game";

export function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  new Game(canvas, roomId, socket);
}
