-- Add stable public room IDs for shareable URLs.
ALTER TABLE "Room" ADD COLUMN "publicId" TEXT;

UPDATE "Room"
SET "publicId" = md5(random()::text || clock_timestamp()::text)
WHERE "publicId" IS NULL;

ALTER TABLE "Room" ALTER COLUMN "publicId" SET NOT NULL;

CREATE UNIQUE INDEX "Room_publicId_key" ON "Room"("publicId");
