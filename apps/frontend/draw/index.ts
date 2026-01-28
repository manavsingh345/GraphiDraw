function resize(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function initDraw(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D){
  resize(canvas);

  const onResize = () => resize(canvas);
  window.addEventListener("resize", onResize);

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

  const onMouseUp = () => {
    clicked = false;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!clicked) return;

    const pos = getPos(e);
    const width = pos.x - startX;
    const height = pos.y - startY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.strokeRect(startX, startY, width, height);
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
