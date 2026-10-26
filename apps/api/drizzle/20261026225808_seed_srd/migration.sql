INSERT INTO `species` (`name`) VALUES
	('Dragonborn'), ('Dwarf'), ('Elf'), ('Gnome'), ('Goliath'),
	('Halfling'), ('Human'), ('Orc'), ('Tiefling');--> statement-breakpoint
INSERT INTO `backgrounds` (`name`, `description`) VALUES
	('Acolyte', 'You devoted yourself to service in a temple.'),
	('Criminal', 'You earned a living outside the law.'),
	('Sage', 'You spent years learning the lore of the multiverse.'),
	('Soldier', 'You trained and fought as a member of an organized military force.');--> statement-breakpoint
INSERT INTO `classes` (`name`, `description`, `hit_point_die`) VALUES
	('Barbarian', 'A fierce warrior driven by primal rage.', 12),
	('Bard', 'An inspiring performer who weaves magic through art.', 8),
	('Cleric', 'A priestly champion who wields divine magic.', 8),
	('Druid', 'A guardian of nature who wields primal magic.', 8),
	('Fighter', 'A master of weapons and armor tactics.', 10),
	('Monk', 'A martial artist who harnesses inner discipline.', 8),
	('Paladin', 'A holy warrior bound by a sacred oath.', 10),
	('Ranger', 'A wilderness warrior and hunter.', 10),
	('Rogue', 'A stealthy expert in precision and cunning.', 8),
	('Sorcerer', 'A spellcaster whose magic is innate.', 6),
	('Warlock', 'A wielder of magic granted by an otherworldly patron.', 8),
	('Wizard', 'A scholarly student of arcane magic.', 6);