CREATE TABLE `backgrounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `character_items` (
	`character_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	CONSTRAINT `character_items_pk` PRIMARY KEY(`character_id`, `item_id`),
	CONSTRAINT `fk_character_items_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`),
	CONSTRAINT `fk_character_items_item_id_items_id_fk` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`)
);
--> statement-breakpoint
CREATE TABLE `character_spells` (
	`character_id` integer NOT NULL,
	`spell_id` integer NOT NULL,
	`prepared` integer DEFAULT false NOT NULL,
	CONSTRAINT `character_spells_pk` PRIMARY KEY(`character_id`, `spell_id`),
	CONSTRAINT `fk_character_spells_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`),
	CONSTRAINT `fk_character_spells_spell_id_spells_id_fk` FOREIGN KEY (`spell_id`) REFERENCES `spells`(`id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`hit_point_die` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `features` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`action_cost` integer,
	`uses` integer
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`weight` real
);
--> statement-breakpoint
CREATE TABLE `species` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `species_to_features` (
	`specie_id` integer NOT NULL,
	`feature_id` integer NOT NULL,
	CONSTRAINT `species_to_features_pk` PRIMARY KEY(`specie_id`, `feature_id`),
	CONSTRAINT `fk_species_to_features_specie_id_species_id_fk` FOREIGN KEY (`specie_id`) REFERENCES `species`(`id`),
	CONSTRAINT `fk_species_to_features_feature_id_features_id_fk` FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`)
);
--> statement-breakpoint
CREATE TABLE `spells` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`level` integer NOT NULL,
	`school` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `characters` ADD `level` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `characters` ADD `species_id` integer REFERENCES species(id);--> statement-breakpoint
ALTER TABLE `characters` ADD `background_id` integer REFERENCES backgrounds(id);--> statement-breakpoint
ALTER TABLE `characters` ADD `class_id` integer REFERENCES classes(id);--> statement-breakpoint
ALTER TABLE `characters` ADD `str` integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `characters` ADD `dex` integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `characters` ADD `con` integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `characters` ADD `int` integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `characters` ADD `wis` integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `characters` ADD `cha` integer DEFAULT 10 NOT NULL;