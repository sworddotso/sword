CREATE TABLE "message_recipient" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"encrypted_content" text NOT NULL,
	"encrypted_key" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "public_key" text;--> statement-breakpoint
ALTER TABLE "message_recipient" ADD CONSTRAINT "message_recipient_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_recipient" ADD CONSTRAINT "message_recipient_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "message" DROP COLUMN "encrypted_content";