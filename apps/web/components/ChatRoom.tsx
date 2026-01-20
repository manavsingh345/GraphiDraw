import axios from "axios"
import { ChatRoomClient } from "./ChatRoomClient";

async function getChats(roomId:string){
    const response=await axios.get(`http://localhost:3001/chats/${roomId}`);
    return response.data.message;
}

export default async  function ChatRoom({id}:{
    id:string
}){
    const messages=await getChats(id);
    return <ChatRoomClient id={id} messages={messages}/>
}