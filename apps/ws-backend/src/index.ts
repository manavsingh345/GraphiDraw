import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer,WebSocket } from "ws"
import { prismaClient } from "@repo/database/client";
import { resolveClerkUser } from "@repo/backend-common/auth";

const port = Number(process.env.PORT ?? 8080);
const wss=new WebSocketServer({ port });

//make ugly logic of one user is a part of multiple room at a time storing info in array.
interface User {
    ws:WebSocket,
    rooms:string[],
    userId:string
};
const users:User[] = [];

import { verifyToken } from '@clerk/backend';

async function checkUser(token:string): Promise<string | null>{
    try{
        const decoded = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
            clockSkewInMs: 15000
        });
        const user = await resolveClerkUser(decoded?.sub, decoded as Record<string, unknown> | null | undefined);
        if(!user) return null;
        await prismaClient.user.upsert({
            where: { id: user.id },
            update: {
                email: user.email,
                name: user.name,
                photo: user.photo
            },
            create: {
                id: user.id,
                email: user.email,
                password: "",
                name: user.name,
                photo: user.photo
            }
        });
        return user.id;
    }catch(err){ 
        console.error("WS verifyToken error:", err, "Token received:", token ? token.substring(0, 20) + "..." : "empty");
        return null; 
    }
}


async function getRoomIdByPublicId(publicId: string): Promise<number | null> {
    const room = await prismaClient.room.findUnique({
        where: {
            publicId
        },
        select: {
            id: true
        }
    });
    return room?.id ?? null;
}

wss.on('connection',async function connection(ws,request){
    const url=request.url;      
    if(!url){
        return;
    }
    const queryParams=new URLSearchParams(url.split('?')[1]);
    const token=queryParams.get('token') ?? "";
    const userId=await checkUser(token);
    if(!userId){
        ws.close(4001, "Unauthorized");
        return null;
    }
    
    users.push({
        userId,
        rooms:[],
        ws
    })
       

    ws.on('message',async function message(data){
        const parsedData=JSON.parse(data as unknown as string);
        if(parsedData.type === "join_room"){
            const roomPublicId = parsedData.roomPublicId;
            if (typeof roomPublicId !== "string" || roomPublicId.length === 0) {
                return;
            }
            const user = users.find(x => x.ws ===ws);
            if (user && !user.rooms.includes(roomPublicId)) {
                user.rooms.push(roomPublicId);
            }
        }
        if(parsedData.type === "leave_room"){
            const roomPublicId = parsedData.roomPublicId;
            if (typeof roomPublicId !== "string" || roomPublicId.length === 0) {
                return;
            }
            const user = users.find(x => x.ws ===ws);
            if(!user){
                return;
            }
            user.rooms =  user.rooms.filter(x => x !== roomPublicId);
        }
        if(parsedData.type === "chat"){
            const roomPublicId = parsedData.roomPublicId;
            if (typeof roomPublicId !== "string" || roomPublicId.length === 0) {
                return;
            }
            const roomId = await getRoomIdByPublicId(roomPublicId);
            if (!roomId) {
                return;
            }
            const message = parsedData.message;
            let shapeId: string | null = null;
            let shape: any | null = null;
            try {
                const parsedMessage = JSON.parse(message);
                shape = parsedMessage?.shape ?? null;
                shapeId = shape?.id ?? null;
            } catch (e) {
                shapeId = null;
                shape = null;
            }

            if (shape && shapeId) {
                await prismaClient.shape.upsert({
                    where: {
                        id: shapeId
                    },
                    update: {
                        roomId,
                        userId,
                        type: shape.type,
                        x: shape.type === "rect" || shape.type === "text" ? shape.x : null,
                        y: shape.type === "rect" || shape.type === "text" ? shape.y : null,
                        width: shape.type === "rect" ? shape.width : null,
                        height: shape.type === "rect" ? shape.height : null,
                        centerX: shape.type === "circle" ? shape.centerX : null,
                        centerY: shape.type === "circle" ? shape.centerY : null,
                        radius: shape.type === "circle" ? shape.radius : null,
                        points: shape.type === "pencil" ? shape.points : null,
                        text: shape.type === "text" ? shape.text : null,
                        fontSize: shape.type === "text" ? shape.fontSize : null,
                        fontFamily: shape.type === "text" ? shape.fontFamily : null,
                        fontWeight: shape.type === "text" ? shape.fontWeight : null,
                        strokeColor: shape.strokeColor ?? null,
                        fillColor: shape.fillColor ?? null,
                        strokeWidth: shape.strokeWidth ?? null
                    },
                    create: {
                        id: shapeId,
                        roomId,
                        userId,
                        type: shape.type,
                        x: shape.type === "rect" || shape.type === "text" ? shape.x : null,
                        y: shape.type === "rect" || shape.type === "text" ? shape.y : null,
                        width: shape.type === "rect" ? shape.width : null,
                        height: shape.type === "rect" ? shape.height : null,
                        centerX: shape.type === "circle" ? shape.centerX : null,
                        centerY: shape.type === "circle" ? shape.centerY : null,
                        radius: shape.type === "circle" ? shape.radius : null,
                        points: shape.type === "pencil" ? shape.points : null,
                        text: shape.type === "text" ? shape.text : null,
                        fontSize: shape.type === "text" ? shape.fontSize : null,
                        fontFamily: shape.type === "text" ? shape.fontFamily : null,
                        fontWeight: shape.type === "text" ? shape.fontWeight : null,
                        strokeColor: shape.strokeColor ?? null,
                        fillColor: shape.fillColor ?? null,
                        strokeWidth: shape.strokeWidth ?? null
                    }
                });
            }

            //broadcast the message
            users.forEach(user =>{
                if(user.rooms.includes(roomPublicId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message:message,
                        roomPublicId
                    }))
                }
            }); 
            
        }

        if (parsedData.type === "reset") {
            const roomPublicId = parsedData.roomPublicId;
            if (typeof roomPublicId !== "string" || roomPublicId.length === 0) {
                return;
            }

            // broadcast reset to all users in this room
            users.forEach((user) => {
                if (user.rooms.includes(roomPublicId)) {
                user.ws.send(
                    JSON.stringify({
                    type: "reset",
                    roomPublicId,
                    })
                );
                }
            });
             return;
            }

        if (parsedData.type === "erase") {
            const roomPublicId = parsedData.roomPublicId;
            const shapeId = parsedData.shapeId;
            if (typeof roomPublicId !== "string" || roomPublicId.length === 0) {
                return;
            }
            const roomId = await getRoomIdByPublicId(roomPublicId);
            if (!roomId) {
                return;
            }

            if (shapeId) {
                await prismaClient.shape.deleteMany({
                    where: {
                        roomId,
                        id: shapeId
                    }
                });
            }

            // broadcast erase to all users in this room
            users.forEach((user) => {
                if (user.rooms.includes(roomPublicId)) {
                user.ws.send(
                    JSON.stringify({
                    type: "erase",
                    roomPublicId,
                    shapeId
                    })
                );
                }
            });
             return;
        }
    });   
})

console.log(`WebSocket server listening on port ${port}`);
