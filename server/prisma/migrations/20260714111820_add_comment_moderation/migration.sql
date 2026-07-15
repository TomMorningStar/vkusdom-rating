-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- Existing comments predate moderation and were already publicly visible; keep them that way.
UPDATE "Comment" SET "isApproved" = true;
