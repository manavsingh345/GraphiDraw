import RoomCanvas from "@/components/RoomCanvas";

export default async function RoomPage({
  params,
}: {
  params: { roomPublicId: string };
}) {
  const roomPublicId = (await params).roomPublicId;

  return <RoomCanvas roomPublicId={roomPublicId} />;
}
