CREATE TABLE `counters` (
	`name` text PRIMARY KEY NOT NULL,
	`value` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `posts` ADD `post_no` integer;--> statement-breakpoint
-- Backfill existing posts in insertion order (rowid) so older posts get lower numbers.
UPDATE `posts` SET `post_no` = (SELECT COUNT(*) FROM `posts` p2 WHERE p2.rowid <= `posts`.rowid) WHERE `post_no` IS NULL;--> statement-breakpoint
-- Seed the allocator so the next post continues after the highest backfilled number.
INSERT INTO `counters` (`name`, `value`) VALUES ('post_no', (SELECT COALESCE(MAX(`post_no`), 0) FROM `posts`));--> statement-breakpoint
CREATE UNIQUE INDEX `posts_post_no_unique` ON `posts` (`post_no`);