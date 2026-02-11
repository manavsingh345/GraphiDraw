-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "shapeId" TEXT;

-- CreateIndex
CREATE INDEX "Chat_roomId_shapeId_idx" ON "Chat"("roomId", "shapeId");
