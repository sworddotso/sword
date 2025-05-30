-- First, preserve existing message data before dropping columns
-- Migrate existing message.content to message_recipient if any exists
INSERT INTO "message_recipient" ("id", "message_id", "recipient_id", "encrypted_content", "encrypted_key")
SELECT 
    "message"."id" || '_' || "conversation_participant"."user_id" as "id",
    "message"."id" as "message_id",
    "conversation_participant"."user_id" as "recipient_id",
    COALESCE("message"."encrypted_content", "message"."content", '') as "encrypted_content",
    '' as "encrypted_key"  -- Will need to be populated separately for E2EE
FROM "message"
JOIN "conversation_participant" ON "message"."conversation_id" = "conversation_participant"."conversation_id"
WHERE "conversation_participant"."left_at" IS NULL
  AND ("message"."content" IS NOT NULL OR "message"."encrypted_content" IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Add missing indexes and constraints
CREATE UNIQUE INDEX IF NOT EXISTS "message_recipient_message_recipient_unique" ON "message_recipient" ("message_id", "recipient_id");
CREATE INDEX IF NOT EXISTS "message_recipient_message_id_idx" ON "message_recipient" ("message_id");
CREATE INDEX IF NOT EXISTS "message_recipient_recipient_id_idx" ON "message_recipient" ("recipient_id");

-- Add unique constraint to conversation_participant
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_user_unique" UNIQUE ("conversation_id", "user_id");

-- Make message.content nullable (if it exists and is NOT NULL)
-- Check if column exists and modify accordingly
DO $$ 
BEGIN
    -- Check if content column exists and is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'message' AND column_name = 'content' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE "message" ALTER COLUMN "content" DROP NOT NULL;
    END IF;
END $$;