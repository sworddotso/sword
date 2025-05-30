ALTER TABLE "user" ADD COLUMN "server_private_key" text;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "content" text;--> statement-breakpoint
CREATE INDEX "message_recipient_message_id_index" ON "message_recipient" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_recipient_recipient_id_index" ON "message_recipient" USING btree ("recipient_id");--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_id_user_id_unique" UNIQUE("conversation_id","user_id");--> statement-breakpoint
ALTER TABLE "message_recipient" ADD CONSTRAINT "message_recipient_message_id_recipient_id_unique" UNIQUE("message_id","recipient_id");