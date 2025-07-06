CREATE TABLE "async_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"user_id" uuid NOT NULL,
	"detection_id" uuid,
	"input_data" jsonb,
	"result" jsonb,
	"error" text,
	"progress" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "upload_tasks" CASCADE;--> statement-breakpoint
ALTER TABLE "async_tasks" ADD CONSTRAINT "async_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "async_tasks" ADD CONSTRAINT "async_tasks_detection_id_food_detections_id_fk" FOREIGN KEY ("detection_id") REFERENCES "public"."food_detections"("id") ON DELETE no action ON UPDATE no action;