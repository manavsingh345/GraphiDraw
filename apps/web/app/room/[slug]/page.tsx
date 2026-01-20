import axios from "axios";
import ChatRoom from "../../../components/ChatRoom";

async function  getRoom(slug:string) {
    const response=await axios.get(`http://localhost:3001/room/${slug}`);
    return response.data.room.id;
};
export default async function ChatRoom1({params}:{
    params:{slug:string}
}){
    const parsedParam=(await params);
    const slug=parsedParam.slug;
    // const slug="Manav Room";
    const roomId=await getRoom(slug);
    return <ChatRoom id={roomId}></ChatRoom>
}