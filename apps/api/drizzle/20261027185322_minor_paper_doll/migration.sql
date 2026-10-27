CREATE TABLE `background_details` (
	`background_id` integer PRIMARY KEY,
	`ability_scores` text NOT NULL,
	`feat` text NOT NULL,
	`skill_proficiencies` text NOT NULL,
	`tool_proficiency` text NOT NULL,
	`equipment` text NOT NULL,
	CONSTRAINT `fk_background_details_background_id_backgrounds_id_fk` FOREIGN KEY (`background_id`) REFERENCES `backgrounds`(`id`)
);
