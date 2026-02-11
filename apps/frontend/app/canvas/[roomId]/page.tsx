import RoomCanvas from "@/components/RoomCanvas";


export default async function CanvasPage({params}:{params:{roomId:string}}) {
  
  const roomPublicId = (await params).roomId;
  
  return (
    <RoomCanvas roomPublicId={roomPublicId}/>
  )
}
