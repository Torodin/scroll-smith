CREATE TABLE `character_species_choices` (
	`character_id` integer NOT NULL,
	`choice_group_id` integer NOT NULL,
	`choice_option_id` integer NOT NULL,
	CONSTRAINT `character_species_choices_pk` PRIMARY KEY(`character_id`, `choice_group_id`, `choice_option_id`),
	CONSTRAINT `fk_character_species_choices_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`),
	CONSTRAINT `fk_character_species_choices_choice_group_id_species_choice_groups_id_fk` FOREIGN KEY (`choice_group_id`) REFERENCES `species_choice_groups`(`id`),
	CONSTRAINT `fk_character_species_choices_choice_group_id_choice_option_id_species_choice_options_choice_group_id_id_fk` FOREIGN KEY (`choice_group_id`,`choice_option_id`) REFERENCES `species_choice_options`(`choice_group_id`,`id`)
);
--> statement-breakpoint
CREATE TABLE `species_choice_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`species_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`choice_count` integer DEFAULT 1 NOT NULL,
	CONSTRAINT `fk_species_choice_groups_species_id_species_id_fk` FOREIGN KEY (`species_id`) REFERENCES `species`(`id`),
	CONSTRAINT "species_choice_groups_choice_count_positive" CHECK("choice_count" > 0)
);
--> statement-breakpoint
CREATE TABLE `species_choice_option_to_features` (
	`choice_group_id` integer NOT NULL,
	`choice_option_id` integer NOT NULL,
	`feature_id` integer NOT NULL,
	CONSTRAINT `species_choice_option_to_features_pk` PRIMARY KEY(`choice_group_id`, `choice_option_id`, `feature_id`),
	CONSTRAINT `fk_species_choice_option_to_features_feature_id_features_id_fk` FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`),
	CONSTRAINT `fk_species_choice_option_to_features_choice_group_id_choice_option_id_species_choice_options_choice_group_id_id_fk` FOREIGN KEY (`choice_group_id`,`choice_option_id`) REFERENCES `species_choice_options`(`choice_group_id`,`id`)
);
--> statement-breakpoint
CREATE TABLE `species_choice_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`choice_group_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `fk_species_choice_options_choice_group_id_species_choice_groups_id_fk` FOREIGN KEY (`choice_group_id`) REFERENCES `species_choice_groups`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `species_choice_options_group_id_id` ON `species_choice_options` (`choice_group_id`,`id`);