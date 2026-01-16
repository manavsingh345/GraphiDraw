import { WebSocketServer,WebSocket } from "ws"
import jwt, { JwtPayload } from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/config";
import {prismaClient} from "@repo/database/client"
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
            const user = users.find(x => x.ws ===ws);
            user?.rooms.push(parsedData.roomId);
        }
        if(parsedData.type === "leave_room"){
            const user = users.find(x => x.ws ===ws);
            if(!user){
                return;
            }
            user.rooms =  user?.rooms.filter(x => x !== parsedData.roomId);
        }
        if(parsedData.type === "chat"){
            const roomId=parsedData.roomId;
            const message = parsedData.message;

            //db store the chat which is very slow now because after this we broadcasting the msg.
            await prismaClient.chat.create({
                data:{
                    roomId,
                    message,
                    userId
                }
            });

            //broadcast the message
            users.forEach(user =>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message:message,
                        roomId
                    }))
                }
            }); 
            
        }

    });   
}) 