CREATE TABLE `character_background_choices` (
	`character_id` integer PRIMARY KEY,
	`ability_mode` text NOT NULL,
	`plus_two` text,
	`plus_one` text,
	`equipment_option` text NOT NULL,
	`gold_granted` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_character_background_choices_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`)
);
--> statement-breakpoint
CREATE TABLE `character_feats` (
	`character_id` integer NOT NULL,
	`feat` text NOT NULL,
	CONSTRAINT `character_feats_pk` PRIMARY KEY(`character_id`, `feat`),
	CONSTRAINT `fk_character_feats_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`)
);
--> statement-breakpoint
CREATE TABLE `character_skill_proficiencies` (
	`character_id` integer NOT NULL,
	`skill` text NOT NULL,
	CONSTRAINT `character_skill_proficiencies_pk` PRIMARY KEY(`character_id`, `skill`),
	CONSTRAINT `fk_character_skill_proficiencies_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`)
);
--> statement-breakpoint
CREATE TABLE `character_tool_proficiencies` (
	`character_id` integer NOT NULL,
	`tool` text NOT NULL,
	CONSTRAINT `character_tool_proficiencies_pk` PRIMARY KEY(`character_id`, `tool`),
	CONSTRAINT `fk_character_tool_proficiencies_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`)
);
--> statement-breakpoint
ALTER TABLE `character_items` ADD `source` text;--> statement-breakpoint
ALTER TABLE `characters` ADD `gold` integer DEFAULT 0 NOT NULL;