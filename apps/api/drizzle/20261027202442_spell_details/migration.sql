CREATE TABLE `spell_classes` (
	`spell_id` integer NOT NULL,
	`class_id` integer NOT NULL,
	CONSTRAINT `spell_classes_pk` PRIMARY KEY(`spell_id`, `class_id`),
	CONSTRAINT `fk_spell_classes_spell_id_spells_id_fk` FOREIGN KEY (`spell_id`) REFERENCES `spells`(`id`),
	CONSTRAINT `fk_spell_classes_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`)
);
--> statement-breakpoint
ALTER TABLE `classes` ADD `spellbook_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `spells` ADD `casting_time` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `spells` ADD `range` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `spells` ADD `components` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `spells` ADD `material` text;--> statement-breakpoint
ALTER TABLE `spells` ADD `duration` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `spells` ADD `concentration` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `spells` ADD `ritual` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `spells` ADD `higher_level` text;--> statement-breakpoint
ALTER TABLE `character_class_selections` DROP COLUMN `cantrips`;--> statement-breakpoint
ALTER TABLE `character_class_selections` DROP COLUMN `prepared_spells`;