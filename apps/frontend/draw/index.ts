function resize(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
type Shape = {
    type:"react";
    x:number;
    y:number;
    width:number;
    height:number;
} | {
    type:"circle";
    centerX:number;
    centerY:number;
    radius:number;
}


export function initDraw(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D){
  resize(canvas);
  let existingShapes: Shape[] = [];

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

  const onMouseUp = (e:MouseEvent) => {
    clicked = false;

    const pos = getPos(e);
    const x = Math.min(startX,pos.x);
    const y = Math.min(startY,pos.y);
    const width = Math.abs(pos.x - startX);
    const height = Math.abs(pos.y - startY);

    existingShapes.push({
      type:"react",
      x:startX,
      y:startY,
      width,
      height
    });
    
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!clicked) return;

    const pos = getPos(e);
    const width = pos.x - startX;
    const height = pos.y - startY;
    clearCanvas(existingShapes,ctx,canvas);
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

function clearCanvas(existingShapes:Shape[],ctx:CanvasRenderingContext2D,canvas:HTMLCanvasElement){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        existingShapes.map((shape)=>{
            if(shape.type==="react"){
              ctx.strokeStyle = "white";
              ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
        })
}
