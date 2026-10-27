CREATE TABLE `character_class_choices` (
	`character_id` integer NOT NULL,
	`choice_group_id` integer NOT NULL,
	`choice_option_id` integer NOT NULL,
	CONSTRAINT `character_class_choices_pk` PRIMARY KEY(`character_id`, `choice_group_id`, `choice_option_id`),
	CONSTRAINT `fk_character_class_choices_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`),
	CONSTRAINT `fk_character_class_choices_choice_group_id_class_choice_groups_id_fk` FOREIGN KEY (`choice_group_id`) REFERENCES `class_choice_groups`(`id`),
	CONSTRAINT `fk_character_class_choices_choice_group_id_choice_option_id_class_choice_options_choice_group_id_id_fk` FOREIGN KEY (`choice_group_id`,`choice_option_id`) REFERENCES `class_choice_options`(`choice_group_id`,`id`)
);
--> statement-breakpoint
CREATE TABLE `character_class_selections` (
	`character_id` integer PRIMARY KEY,
	`equipment_option` text NOT NULL,
	`gold_granted` integer DEFAULT 0 NOT NULL,
	`skills` text NOT NULL,
	`tools` text NOT NULL,
	`expertise` text NOT NULL,
	`weapon_masteries` text NOT NULL,
	`cantrips` text NOT NULL,
	`prepared_spells` text NOT NULL,
	CONSTRAINT `fk_character_class_selections_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_choice_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`class_id` integer NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`choice_count` integer DEFAULT 1 NOT NULL,
	CONSTRAINT `fk_class_choice_groups_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
	CONSTRAINT "class_choice_groups_choice_count_positive" CHECK("choice_count" > 0)
);
--> statement-breakpoint
CREATE TABLE `class_choice_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`choice_group_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`extra_cantrips` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_class_choice_options_choice_group_id_class_choice_groups_id_fk` FOREIGN KEY (`choice_group_id`) REFERENCES `class_choice_groups`(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_features` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`class_id` integer NOT NULL,
	`subclass_id` integer,
	`level` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `fk_class_features_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
	CONSTRAINT `fk_class_features_subclass_id_subclasses_id_fk` FOREIGN KEY (`subclass_id`) REFERENCES `subclasses`(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_levels` (
	`class_id` integer NOT NULL,
	`level` integer NOT NULL,
	`proficiency_bonus` integer NOT NULL,
	`columns` text NOT NULL,
	`spell_slots` text,
	CONSTRAINT `class_levels_pk` PRIMARY KEY(`class_id`, `level`),
	CONSTRAINT `fk_class_levels_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
	CONSTRAINT "class_levels_level_range" CHECK("level" between 1 and 20)
);
--> statement-breakpoint
CREATE TABLE `subclasses` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`class_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `fk_subclasses_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`)
);
--> statement-breakpoint
ALTER TABLE `classes` ADD `primary_ability` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `classes` ADD `saving_throws` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `classes` ADD `armor_training` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `classes` ADD `weapon_proficiencies` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `classes` ADD `tool_proficiencies` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `classes` ADD `tool_choice` text;--> statement-breakpoint
ALTER TABLE `classes` ADD `skill_choice_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `classes` ADD `skill_choice_options` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `classes` ADD `expertise_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `classes` ADD `weapon_mastery_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `classes` ADD `spellcasting_ability` text;--> statement-breakpoint
ALTER TABLE `classes` ADD `starting_equipment` text DEFAULT '{"packages":{},"goldAlternative":0}' NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_character_items` (
	`character_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	CONSTRAINT `character_items_pk` PRIMARY KEY(`character_id`, `item_id`, `source`),
	CONSTRAINT `fk_character_items_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`),
	CONSTRAINT `fk_character_items_item_id_items_id_fk` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_character_items`(`character_id`, `item_id`, `quantity`, `source`) SELECT `character_id`, `item_id`, `quantity`, `source` FROM `character_items`;--> statement-breakpoint
DROP TABLE `character_items`;--> statement-breakpoint
ALTER TABLE `__new_character_items` RENAME TO `character_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `class_choice_options_group_id_id` ON `class_choice_options` (`choice_group_id`,`id`);