"use client";

import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";


type CanvasProps = {
  roomId: string;
};

export default function RoomCanvas({roomId}:CanvasProps) {
  const [socket, setSocket]=useState<WebSocket | null>(null);

  useEffect(()=>{
    document.body.style.overflow = "hidden";
    const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMzE0YjY0Mi00MzU5LTQ1ZTAtOGExZC1mNjZhZTY5ZDE3ZmIiLCJpYXQiOjE3Njk3NzgzMzMsImV4cCI6MTc3MDM4MzEzM30.1F7s1NPM-p5DTv_Uclp1xElsIskDlLaxQ0_jiW-7RVo`);
    ws.onopen = () =>{
        setSocket(ws);
        ws.send(JSON.stringify({type: "join_room",roomId:Number(roomId)}))
    }
  },[]);


  if(!socket){
    return <div>
        Connecting to server...
    </div>
  }
  return (
    <>
      
      <Canvas roomId={roomId} socket={socket}/>
     
    </>
      
  )
}


