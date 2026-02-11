import { WebSocketServer,WebSocket } from "ws"
import jwt from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/config";
import { prismaClient } from "@repo/database";
import dotenv from "dotenv";
dotenv.config();

const wss=new WebSocketServer({port:8080});

//make ugly logic of one user is a part of multiple room at a time storing info in array.
interface User {
    ws:WebSocket,
    rooms:string[],
    userId:string
};
const users:User[] = [];

function checkUser(token:string): string | null{
    try{
    const decoded=jwt.verify(token,JWT_SECRET);

    if(typeof decoded==="string"){
        return null;
    }
    
    if(!decoded || !decoded.userId){
        return null;
    }
    return decoded.userId;
    }catch(err){
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

wss.on('connection',function connection(ws,request){
    const url=request.url;      
    if(!url){
        return;
    }
    const queryParams=new URLSearchParams(url.split('?')[1]);
    const token=queryParams.get('token') ?? "";
    const userId=checkUser(token);
    if(!userId){
        ws.close();
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
