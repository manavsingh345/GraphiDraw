import { Game } from "./Game";

export function initDraw( canvas: HTMLCanvasElement, roomPublicId: string, socket: WebSocket) {
  new Game(canvas, roomPublicId, socket);
}
