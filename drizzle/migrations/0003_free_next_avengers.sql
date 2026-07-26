ALTER TABLE `posts` ADD `ai_generated` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `posts_status_ai_created_idx` ON `posts` (`status`,`ai_generated`,`created_at`);--> statement-breakpoint
-- Backfill: every existing HTML-attached post was produced by the AI writer.
UPDATE `posts` SET `ai_generated` = 1 WHERE `content_type` = 'html';
