CREATE TABLE `character_subclasses` (
	`character_id` integer PRIMARY KEY,
	`subclass_id` integer NOT NULL,
	CONSTRAINT `fk_character_subclasses_character_id_characters_id_fk` FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`),
	CONSTRAINT `fk_character_subclasses_subclass_id_subclasses_id_fk` FOREIGN KEY (`subclass_id`) REFERENCES `subclasses`(`id`)
);
