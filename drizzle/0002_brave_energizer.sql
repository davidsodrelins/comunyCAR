CREATE TABLE `message_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message_id` int NOT NULL,
	`user_id` int NOT NULL,
	`reaction_type` enum('seen','thank_you','urgent','resolved','vehicle','later') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message_id` int NOT NULL,
	`recipient_id` int NOT NULL,
	`read_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sender_id` int NOT NULL,
	`vehicle_id` int NOT NULL,
	`message_type` enum('fixed','personalized') NOT NULL,
	`fixed_alert_id` int,
	`message_content` text,
	`status` enum('sent','delivered','read','failed') NOT NULL DEFAULT 'sent',
	`read_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
