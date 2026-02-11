import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string){
    const res = await axios.get(`${HTTP_BACKEND}/shapes/${roomId}`);
    const shapes = res.data.shapes ?? [];
    if (shapes.length === 0) {
      console.log("No existing shapes (new room)");
      return [];
    }
    return shapes;
}
