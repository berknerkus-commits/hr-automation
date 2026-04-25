CREATE TABLE `candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobPostingId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`resumeUrl` text,
	`stage` enum('yeni','mulakat','teklif','kabul','red') NOT NULL DEFAULT 'yeni',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_postings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`department` varchar(128),
	`location` varchar(128),
	`description` text,
	`status` enum('active','closed','draft') NOT NULL DEFAULT 'active',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_postings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`year` int NOT NULL,
	`totalDays` int NOT NULL DEFAULT 20,
	`usedDays` int NOT NULL DEFAULT 0,
	`pendingDays` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_balances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`leaveType` enum('yillik','hastalik','mazeret','ucretsiz') NOT NULL DEFAULT 'yillik',
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`days` int NOT NULL,
	`reason` text,
	`status` enum('beklemede','onaylandi','reddedildi') NOT NULL DEFAULT 'beklemede',
	`reviewedBy` int,
	`reviewNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`type` enum('izin','onboarding','ats','sistem') NOT NULL DEFAULT 'sistem',
	`read` boolean NOT NULL DEFAULT false,
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(256) NOT NULL,
	`email` varchar(320),
	`department` varchar(128),
	`position` varchar(128),
	`startDate` date,
	`status` enum('beklemede','devam_ediyor','tamamlandi') NOT NULL DEFAULT 'beklemede',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboarding_employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`completed` boolean NOT NULL DEFAULT false,
	`dueDate` date,
	`assignedTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboarding_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `position` varchar(128);