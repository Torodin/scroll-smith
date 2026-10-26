PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_characters` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`level` integer DEFAULT 1,
	`species_id` integer NOT NULL,
	`background_id` integer NOT NULL,
	`class_id` integer NOT NULL,
	`str` integer DEFAULT 10 NOT NULL,
	`dex` integer DEFAULT 10 NOT NULL,
	`con` integer DEFAULT 10 NOT NULL,
	`int` integer DEFAULT 10 NOT NULL,
	`wis` integer DEFAULT 10 NOT NULL,
	`cha` integer DEFAULT 10 NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	CONSTRAINT `fk_characters_species_id_species_id_fk` FOREIGN KEY (`species_id`) REFERENCES `species`(`id`),
	CONSTRAINT `fk_characters_background_id_backgrounds_id_fk` FOREIGN KEY (`background_id`) REFERENCES `backgrounds`(`id`),
	CONSTRAINT `fk_characters_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_characters`(`id`, `name`, `level`, `species_id`, `background_id`, `class_id`, `str`, `dex`, `con`, `int`, `wis`, `cha`, `created_at`) SELECT `id`, `name`, `level`, `species_id`, `background_id`, `class_id`, `str`, `dex`, `con`, `int`, `wis`, `cha`, `created_at` FROM `characters`;--> statement-breakpoint
DROP TABLE `characters`;--> statement-breakpoint
ALTER TABLE `__new_characters` RENAME TO `characters`;--> statement-breakpoint
PRAGMA foreign_keys=ON;