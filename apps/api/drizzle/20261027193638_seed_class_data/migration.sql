INSERT INTO `items` (`name`, `description`, `category`)
SELECT v.name, v.description, v.category FROM (
	SELECT 'Greataxe' AS name, 'Starting equipment: Greataxe.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Handaxe' AS name, 'Starting equipment: Handaxe.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Explorer''s Pack' AS name, 'Starting equipment: Explorer''s Pack.' AS description, 'gear' AS category
	UNION ALL SELECT 'Leather Armor' AS name, 'Starting equipment: Leather Armor.' AS description, 'armor' AS category
	UNION ALL SELECT 'Dagger' AS name, 'Starting equipment: Dagger.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Musical Instrument' AS name, 'Starting equipment: Musical Instrument.' AS description, 'tool' AS category
	UNION ALL SELECT 'Entertainer''s Pack' AS name, 'Starting equipment: Entertainer''s Pack.' AS description, 'gear' AS category
	UNION ALL SELECT 'Chain Shirt' AS name, 'Starting equipment: Chain Shirt.' AS description, 'armor' AS category
	UNION ALL SELECT 'Shield' AS name, 'Starting equipment: Shield.' AS description, 'armor' AS category
	UNION ALL SELECT 'Mace' AS name, 'Starting equipment: Mace.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Holy Symbol' AS name, 'Starting equipment: Holy Symbol.' AS description, 'gear' AS category
	UNION ALL SELECT 'Priest''s Pack' AS name, 'Starting equipment: Priest''s Pack.' AS description, 'gear' AS category
	UNION ALL SELECT 'Sickle' AS name, 'Starting equipment: Sickle.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Druidic Focus' AS name, 'Starting equipment: Druidic Focus.' AS description, 'gear' AS category
	UNION ALL SELECT 'Herbalism Kit' AS name, 'Starting equipment: Herbalism Kit.' AS description, 'tool' AS category
	UNION ALL SELECT 'Chain Mail' AS name, 'Starting equipment: Chain Mail.' AS description, 'armor' AS category
	UNION ALL SELECT 'Greatsword' AS name, 'Starting equipment: Greatsword.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Flail' AS name, 'Starting equipment: Flail.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Javelin' AS name, 'Starting equipment: Javelin.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Dungeoneer''s Pack' AS name, 'Starting equipment: Dungeoneer''s Pack.' AS description, 'gear' AS category
	UNION ALL SELECT 'Studded Leather Armor' AS name, 'Starting equipment: Studded Leather Armor.' AS description, 'armor' AS category
	UNION ALL SELECT 'Scimitar' AS name, 'Starting equipment: Scimitar.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Shortsword' AS name, 'Starting equipment: Shortsword.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Longbow' AS name, 'Starting equipment: Longbow.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Arrow' AS name, 'Starting equipment: Arrow.' AS description, 'ammunition' AS category
	UNION ALL SELECT 'Quiver' AS name, 'Starting equipment: Quiver.' AS description, 'gear' AS category
	UNION ALL SELECT 'Spear' AS name, 'Starting equipment: Spear.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Artisan''s Tools' AS name, 'Starting equipment: Artisan''s Tools.' AS description, 'tool' AS category
	UNION ALL SELECT 'Longsword' AS name, 'Starting equipment: Longsword.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Shortbow' AS name, 'Starting equipment: Shortbow.' AS description, 'weapon' AS category
	UNION ALL SELECT 'Thieves'' Tools' AS name, 'Starting equipment: Thieves'' Tools.' AS description, 'tool' AS category
	UNION ALL SELECT 'Burglar''s Pack' AS name, 'Starting equipment: Burglar''s Pack.' AS description, 'gear' AS category
	UNION ALL SELECT 'Arcane Focus' AS name, 'Starting equipment: Arcane Focus.' AS description, 'gear' AS category
	UNION ALL SELECT 'Book (occult lore)' AS name, 'Starting equipment: Book (occult lore).' AS description, 'gear' AS category
	UNION ALL SELECT 'Scholar''s Pack' AS name, 'Starting equipment: Scholar''s Pack.' AS description, 'gear' AS category
	UNION ALL SELECT 'Robe' AS name, 'Starting equipment: Robe.' AS description, 'gear' AS category
	UNION ALL SELECT 'Spellbook' AS name, 'Starting equipment: Spellbook.' AS description, 'gear' AS category
) v
WHERE NOT EXISTS (SELECT 1 FROM `items` i WHERE i.name = v.name);
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Strength', `saving_throws` = '["Strength","Constitution"]', `armor_training` = '["Light armor","Medium armor","Shields"]', `weapon_proficiencies` = '["Simple weapons","Martial weapons"]', `tool_proficiencies` = '[]', `tool_choice` = NULL, `skill_choice_count` = 2, `skill_choice_options` = '["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"]', `expertise_count` = 0, `weapon_mastery_count` = 2, `spellcasting_ability` = NULL, `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Greataxe","quantity":1},{"item":"Handaxe","quantity":4},{"item":"Explorer''s Pack","quantity":1}],"gold":15}},"goldAlternative":75}' WHERE `name` = 'Barbarian';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Barbarian'), 1, 2, '{"Rages":2,"Rage Damage":2,"Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 2, 2, '{"Rages":2,"Rage Damage":2,"Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 3, 2, '{"Rages":3,"Rage Damage":2,"Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 4, 2, '{"Rages":3,"Rage Damage":2,"Weapon Mastery":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 5, 3, '{"Rages":3,"Rage Damage":2,"Weapon Mastery":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 6, 3, '{"Rages":4,"Rage Damage":2,"Weapon Mastery":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 7, 3, '{"Rages":4,"Rage Damage":2,"Weapon Mastery":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 8, 3, '{"Rages":4,"Rage Damage":2,"Weapon Mastery":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 9, 4, '{"Rages":4,"Rage Damage":3,"Weapon Mastery":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 10, 4, '{"Rages":4,"Rage Damage":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 11, 4, '{"Rages":4,"Rage Damage":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 12, 4, '{"Rages":5,"Rage Damage":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 13, 5, '{"Rages":5,"Rage Damage":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 14, 5, '{"Rages":5,"Rage Damage":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 15, 5, '{"Rages":5,"Rage Damage":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 16, 5, '{"Rages":5,"Rage Damage":4,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 17, 6, '{"Rages":6,"Rage Damage":4,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 18, 6, '{"Rages":6,"Rage Damage":4,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 19, 6, '{"Rages":6,"Rage Damage":4,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Barbarian'), 20, 6, '{"Rages":"Unlimited","Rage Damage":4,"Weapon Mastery":4}', NULL);
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 1, 'Rage', 'Bonus action: gain damage resistance to bludgeoning, piercing and slashing, bonus melee damage and Strength advantage.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 1, 'Unarmored Defense', 'Without armor your AC is 10 plus Dexterity and Constitution modifiers.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 1, 'Weapon Mastery', 'Use the mastery properties of two kinds of weapons.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 2, 'Danger Sense', 'Advantage on Dexterity saves against effects you can see.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 2, 'Reckless Attack', 'Gain advantage on Strength attacks but give advantage to attackers.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 3, 'Barbarian Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 3, 'Primal Knowledge', 'Gain another Barbarian skill proficiency; channel Rage into Strength skill checks.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 5, 'Extra Attack', 'Attack twice when you take the Attack action.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 5, 'Fast Movement', 'Speed increases by 10 feet while not in Heavy armor.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 7, 'Feral Instinct', 'Advantage on initiative rolls.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 7, 'Instinctive Pounce', 'Move half your speed when you activate Rage.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 9, 'Brutal Strike', 'Forgo Reckless Attack advantage to deal extra damage and a strike effect.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 11, 'Relentless Rage', 'Drop to a better hit point total instead of 0 while raging with a Constitution save.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 13, 'Improved Brutal Strike', 'Gain more Brutal Strike effects.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 15, 'Persistent Rage', 'Rage lasts longer and you regain Rage uses on initiative.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 17, 'Improved Brutal Strike', 'Brutal Strike deals more damage and applies two effects.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 18, 'Indomitable Might', 'Use your Strength score if it is higher than a Strength check or save total.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), NULL, 20, 'Primal Champion', 'Strength and Constitution scores each increase by 4, to a maximum of 25.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Barbarian'), 'Path of the Berserker', 'A barbarian who channels Rage into violent fury.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Barbarian'), (SELECT id FROM subclasses WHERE name = 'Path of the Berserker'), 3, 'Frenzy', 'Deal extra damage with your first Reckless Attack target each turn while raging.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), (SELECT id FROM subclasses WHERE name = 'Path of the Berserker'), 6, 'Mindless Rage', 'You can''t be charmed or frightened while raging.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), (SELECT id FROM subclasses WHERE name = 'Path of the Berserker'), 10, 'Retaliation', 'Reaction: make a melee attack against a creature that damages you.'),
	((SELECT id FROM classes WHERE name = 'Barbarian'), (SELECT id FROM subclasses WHERE name = 'Path of the Berserker'), 14, 'Intimidating Presence', 'Frighten creatures near you as a bonus action.');
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Charisma', `saving_throws` = '["Dexterity","Charisma"]', `armor_training` = '["Light armor"]', `weapon_proficiencies` = '["Simple weapons"]', `tool_proficiencies` = '["Musical instrument"]', `tool_choice` = '{"count":3,"category":"Musical Instrument"}', `skill_choice_count` = 3, `skill_choice_options` = '["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"]', `expertise_count` = 0, `weapon_mastery_count` = 0, `spellcasting_ability` = 'Charisma', `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Leather Armor","quantity":1},{"item":"Dagger","quantity":2},{"item":"Musical Instrument","quantity":1},{"item":"Entertainer''s Pack","quantity":1}],"gold":19}},"goldAlternative":90}' WHERE `name` = 'Bard';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Bard'), 1, 2, '{"Bardic Die":"d6","Cantrips":2,"Prepared Spells":4}', '[2]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 2, 2, '{"Bardic Die":"d6","Cantrips":2,"Prepared Spells":5}', '[3]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 3, 2, '{"Bardic Die":"d6","Cantrips":2,"Prepared Spells":6}', '[4,2]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 4, 2, '{"Bardic Die":"d6","Cantrips":3,"Prepared Spells":7}', '[4,3]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 5, 3, '{"Bardic Die":"d8","Cantrips":3,"Prepared Spells":9}', '[4,3,2]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 6, 3, '{"Bardic Die":"d8","Cantrips":3,"Prepared Spells":10}', '[4,3,3]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 7, 3, '{"Bardic Die":"d8","Cantrips":3,"Prepared Spells":11}', '[4,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 8, 3, '{"Bardic Die":"d8","Cantrips":3,"Prepared Spells":12}', '[4,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 9, 4, '{"Bardic Die":"d8","Cantrips":3,"Prepared Spells":14}', '[4,3,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 10, 4, '{"Bardic Die":"d10","Cantrips":4,"Prepared Spells":15}', '[4,3,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 11, 4, '{"Bardic Die":"d10","Cantrips":4,"Prepared Spells":16}', '[4,3,3,3,2,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 12, 4, '{"Bardic Die":"d10","Cantrips":4,"Prepared Spells":16}', '[4,3,3,3,2,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 13, 5, '{"Bardic Die":"d10","Cantrips":4,"Prepared Spells":17}', '[4,3,3,3,2,1,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 14, 5, '{"Bardic Die":"d10","Cantrips":4,"Prepared Spells":17}', '[4,3,3,3,2,1,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 15, 5, '{"Bardic Die":"d12","Cantrips":4,"Prepared Spells":18}', '[4,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 16, 5, '{"Bardic Die":"d12","Cantrips":4,"Prepared Spells":18}', '[4,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 17, 6, '{"Bardic Die":"d12","Cantrips":4,"Prepared Spells":19}', '[4,3,3,3,2,1,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 18, 6, '{"Bardic Die":"d12","Cantrips":4,"Prepared Spells":20}', '[4,3,3,3,3,1,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 19, 6, '{"Bardic Die":"d12","Cantrips":4,"Prepared Spells":21}', '[4,3,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Bard'), 20, 6, '{"Bardic Die":"d12","Cantrips":4,"Prepared Spells":22}', '[4,3,3,3,3,2,2,1,1]');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 1, 'Bardic Inspiration', 'Bonus action: give an ally a die to add to a d20 Test.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 1, 'Spellcasting', 'Cast bard spells using Charisma.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 2, 'Expertise', 'Gain Expertise in two skills.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 2, 'Jack of All Trades', 'Add half your proficiency bonus to checks you aren''t proficient in.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 3, 'Bard Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 5, 'Font of Inspiration', 'Regain Bardic Inspiration on short or long rests.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 7, 'Countercharm', 'Reaction: grant allies advantage against being charmed or frightened.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 9, 'Expertise', 'Gain Expertise in two more skills.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 10, 'Magical Secrets', 'Prepare spells from the Bard, Cleric, Druid and Wizard lists.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 18, 'Superior Inspiration', 'Regain Bardic Inspiration when you roll initiative.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Bard'), NULL, 20, 'Words of Creation', 'Always have Power Word Heal and Power Word Kill prepared.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Bard'), 'College of Lore', 'A bard who collects knowledge and cutting wit.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Bard'), (SELECT id FROM subclasses WHERE name = 'College of Lore'), 3, 'Bonus Proficiencies', 'Gain proficiency in three skills of your choice.'),
	((SELECT id FROM classes WHERE name = 'Bard'), (SELECT id FROM subclasses WHERE name = 'College of Lore'), 3, 'Cutting Words', 'Reaction: spend Bardic Inspiration to reduce an enemy''s roll.'),
	((SELECT id FROM classes WHERE name = 'Bard'), (SELECT id FROM subclasses WHERE name = 'College of Lore'), 6, 'Magical Discoveries', 'Learn two spells from any class list.'),
	((SELECT id FROM classes WHERE name = 'Bard'), (SELECT id FROM subclasses WHERE name = 'College of Lore'), 14, 'Peerless Skill', 'Spend Bardic Inspiration to improve your own ability checks.');
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Wisdom', `saving_throws` = '["Wisdom","Charisma"]', `armor_training` = '["Light armor","Medium armor","Shields"]', `weapon_proficiencies` = '["Simple weapons"]', `tool_proficiencies` = '[]', `tool_choice` = NULL, `skill_choice_count` = 2, `skill_choice_options` = '["History","Insight","Medicine","Persuasion","Religion"]', `expertise_count` = 0, `weapon_mastery_count` = 0, `spellcasting_ability` = 'Wisdom', `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Chain Shirt","quantity":1},{"item":"Shield","quantity":1},{"item":"Mace","quantity":1},{"item":"Holy Symbol","quantity":1},{"item":"Priest''s Pack","quantity":1}],"gold":7}},"goldAlternative":110}' WHERE `name` = 'Cleric';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Cleric'), 1, 2, '{"Channel Divinity":"-","Cantrips":3,"Prepared Spells":4}', '[2]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 2, 2, '{"Channel Divinity":2,"Cantrips":3,"Prepared Spells":5}', '[3]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 3, 2, '{"Channel Divinity":2,"Cantrips":3,"Prepared Spells":6}', '[4,2]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 4, 2, '{"Channel Divinity":2,"Cantrips":4,"Prepared Spells":7}', '[4,3]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 5, 3, '{"Channel Divinity":2,"Cantrips":4,"Prepared Spells":9}', '[4,3,2]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 6, 3, '{"Channel Divinity":3,"Cantrips":4,"Prepared Spells":10}', '[4,3,3]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 7, 3, '{"Channel Divinity":3,"Cantrips":4,"Prepared Spells":11}', '[4,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 8, 3, '{"Channel Divinity":3,"Cantrips":4,"Prepared Spells":12}', '[4,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 9, 4, '{"Channel Divinity":3,"Cantrips":4,"Prepared Spells":14}', '[4,3,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 10, 4, '{"Channel Divinity":3,"Cantrips":5,"Prepared Spells":15}', '[4,3,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 11, 4, '{"Channel Divinity":3,"Cantrips":5,"Prepared Spells":16}', '[4,3,3,3,2,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 12, 4, '{"Channel Divinity":3,"Cantrips":5,"Prepared Spells":16}', '[4,3,3,3,2,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 13, 5, '{"Channel Divinity":3,"Cantrips":5,"Prepared Spells":17}', '[4,3,3,3,2,1,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 14, 5, '{"Channel Divinity":3,"Cantrips":5,"Prepared Spells":17}', '[4,3,3,3,2,1,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 15, 5, '{"Channel Divinity":3,"Cantrips":5,"Prepared Spells":18}', '[4,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 16, 5, '{"Channel Divinity":3,"Cantrips":5,"Prepared Spells":18}', '[4,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 17, 6, '{"Channel Divinity":3,"Cantrips":5,"Prepared Spells":19}', '[4,3,3,3,2,1,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 18, 6, '{"Channel Divinity":4,"Cantrips":5,"Prepared Spells":20}', '[4,3,3,3,3,1,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 19, 6, '{"Channel Divinity":4,"Cantrips":5,"Prepared Spells":21}', '[4,3,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Cleric'), 20, 6, '{"Channel Divinity":4,"Cantrips":5,"Prepared Spells":22}', '[4,3,3,3,3,2,2,1,1]');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 1, 'Spellcasting', 'Cast cleric spells using Wisdom.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 1, 'Divine Order', 'Choose Protector or Thaumaturge.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 2, 'Channel Divinity', 'Use Divine Spark or Turn Undead.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 3, 'Cleric Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 5, 'Sear Undead', 'Turn Undead also deals radiant damage.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 7, 'Blessed Strikes', 'Deal extra radiant or necrotic damage with cantrips or weapons.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 10, 'Divine Intervention', 'Cast a cleric spell of level 5 or lower without a slot.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), NULL, 20, 'Greater Divine Intervention', 'Cast Wish through Divine Intervention.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Cleric'), 'Life Domain', 'A cleric devoted to healing and vitality.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Cleric'), (SELECT id FROM subclasses WHERE name = 'Life Domain'), 3, 'Disciple of Life', 'Healing spells restore extra hit points.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), (SELECT id FROM subclasses WHERE name = 'Life Domain'), 3, 'Life Domain Spells', 'Always have certain healing spells prepared.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), (SELECT id FROM subclasses WHERE name = 'Life Domain'), 3, 'Preserve Life', 'Channel Divinity: restore hit points to creatures near you.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), (SELECT id FROM subclasses WHERE name = 'Life Domain'), 6, 'Blessed Healer', 'You regain hit points when you heal others.'),
	((SELECT id FROM classes WHERE name = 'Cleric'), (SELECT id FROM subclasses WHERE name = 'Life Domain'), 17, 'Supreme Healing', 'Maximize healing dice rolls.');
--> statement-breakpoint
INSERT INTO `class_choice_groups` (`class_id`, `level`, `name`, `description`, `choice_count`) VALUES ((SELECT id FROM classes WHERE name = 'Cleric'), 1, 'Divine Order', 'Choose your sacred role.', 1);
--> statement-breakpoint
INSERT INTO `class_choice_options` (`choice_group_id`, `name`, `description`, `extra_cantrips`) VALUES
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Cleric') AND name = 'Divine Order'), 'Protector', 'Trained for battle: Martial weapons and Heavy armor training.', 0),
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Cleric') AND name = 'Divine Order'), 'Thaumaturge', 'Learn one extra cantrip and add Wisdom to Arcana and Religion checks.', 1);
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Wisdom', `saving_throws` = '["Intelligence","Wisdom"]', `armor_training` = '["Light armor","Shields"]', `weapon_proficiencies` = '["Simple weapons"]', `tool_proficiencies` = '["Herbalism Kit"]', `tool_choice` = NULL, `skill_choice_count` = 2, `skill_choice_options` = '["Arcana","Animal Handling","Insight","Medicine","Nature","Perception","Religion","Survival"]', `expertise_count` = 0, `weapon_mastery_count` = 0, `spellcasting_ability` = 'Wisdom', `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Leather Armor","quantity":1},{"item":"Shield","quantity":1},{"item":"Sickle","quantity":1},{"item":"Druidic Focus","quantity":1},{"item":"Explorer''s Pack","quantity":1},{"item":"Herbalism Kit","quantity":1}],"gold":9}},"goldAlternative":50}' WHERE `name` = 'Druid';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Druid'), 1, 2, '{"Wild Shape":"-","Known Forms":"-","Cantrips":2,"Prepared Spells":4}', '[2]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 2, 2, '{"Wild Shape":2,"Known Forms":4,"Cantrips":2,"Prepared Spells":5}', '[3]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 3, 2, '{"Wild Shape":2,"Known Forms":4,"Cantrips":2,"Prepared Spells":6}', '[4,2]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 4, 2, '{"Wild Shape":2,"Known Forms":6,"Cantrips":3,"Prepared Spells":7}', '[4,3]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 5, 3, '{"Wild Shape":2,"Known Forms":6,"Cantrips":3,"Prepared Spells":9}', '[4,3,2]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 6, 3, '{"Wild Shape":3,"Known Forms":6,"Cantrips":3,"Prepared Spells":10}', '[4,3,3]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 7, 3, '{"Wild Shape":3,"Known Forms":6,"Cantrips":3,"Prepared Spells":11}', '[4,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 8, 3, '{"Wild Shape":3,"Known Forms":8,"Cantrips":3,"Prepared Spells":12}', '[4,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 9, 4, '{"Wild Shape":3,"Known Forms":8,"Cantrips":3,"Prepared Spells":14}', '[4,3,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 10, 4, '{"Wild Shape":3,"Known Forms":8,"Cantrips":4,"Prepared Spells":15}', '[4,3,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 11, 4, '{"Wild Shape":3,"Known Forms":8,"Cantrips":4,"Prepared Spells":16}', '[4,3,3,3,2,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 12, 4, '{"Wild Shape":3,"Known Forms":8,"Cantrips":4,"Prepared Spells":16}', '[4,3,3,3,2,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 13, 5, '{"Wild Shape":3,"Known Forms":8,"Cantrips":4,"Prepared Spells":17}', '[4,3,3,3,2,1,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 14, 5, '{"Wild Shape":3,"Known Forms":8,"Cantrips":4,"Prepared Spells":17}', '[4,3,3,3,2,1,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 15, 5, '{"Wild Shape":3,"Known Forms":8,"Cantrips":4,"Prepared Spells":18}', '[4,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 16, 5, '{"Wild Shape":3,"Known Forms":8,"Cantrips":4,"Prepared Spells":18}', '[4,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 17, 6, '{"Wild Shape":4,"Known Forms":8,"Cantrips":4,"Prepared Spells":19}', '[4,3,3,3,2,1,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 18, 6, '{"Wild Shape":4,"Known Forms":8,"Cantrips":4,"Prepared Spells":20}', '[4,3,3,3,3,1,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 19, 6, '{"Wild Shape":4,"Known Forms":8,"Cantrips":4,"Prepared Spells":21}', '[4,3,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Druid'), 20, 6, '{"Wild Shape":4,"Known Forms":8,"Cantrips":4,"Prepared Spells":22}', '[4,3,3,3,3,2,2,1,1]');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 1, 'Spellcasting', 'Cast druid spells using Wisdom.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 1, 'Druidic', 'Know the secret Druidic language and always have Speak with Animals prepared.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 1, 'Primal Order', 'Choose Magician or Warden.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 2, 'Wild Shape', 'Bonus action: magically assume the form of a beast.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 2, 'Wild Companion', 'Spend Wild Shape to cast Find Familiar.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 3, 'Druid Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 5, 'Wild Resurgence', 'Trade spell slots and Wild Shape uses for each other.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 7, 'Elemental Fury', 'Add extra elemental damage to cantrips or weapon attacks.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 15, 'Improved Elemental Fury', 'Elemental Fury grows stronger with range and damage.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 18, 'Beast Spells', 'Cast spells while in Wild Shape.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Druid'), NULL, 20, 'Archdruid', 'Regain Wild Shape uses on initiative and never run out of uses.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Druid'), 'Circle of the Land', 'A druid whose power is tied to a type of land.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Druid'), (SELECT id FROM subclasses WHERE name = 'Circle of the Land'), 3, 'Circle of the Land Spells', 'Always have spells prepared based on your chosen land.'),
	((SELECT id FROM classes WHERE name = 'Druid'), (SELECT id FROM subclasses WHERE name = 'Circle of the Land'), 3, 'Land''s Aid', 'Spend Wild Shape to damage foes and heal an ally.'),
	((SELECT id FROM classes WHERE name = 'Druid'), (SELECT id FROM subclasses WHERE name = 'Circle of the Land'), 6, 'Natural Recovery', 'Cast a circle spell for free and recover spell slots on a short rest.'),
	((SELECT id FROM classes WHERE name = 'Druid'), (SELECT id FROM subclasses WHERE name = 'Circle of the Land'), 10, 'Nature''s Ward', 'Immune to poison and resist a damage type tied to your land.'),
	((SELECT id FROM classes WHERE name = 'Druid'), (SELECT id FROM subclasses WHERE name = 'Circle of the Land'), 14, 'Nature''s Sanctuary', 'Surround yourself with a protective sanctuary of nature.');
--> statement-breakpoint
INSERT INTO `class_choice_groups` (`class_id`, `level`, `name`, `description`, `choice_count`) VALUES ((SELECT id FROM classes WHERE name = 'Druid'), 1, 'Primal Order', 'Choose your primal role.', 1);
--> statement-breakpoint
INSERT INTO `class_choice_options` (`choice_group_id`, `name`, `description`, `extra_cantrips`) VALUES
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Druid') AND name = 'Primal Order'), 'Magician', 'Learn one extra cantrip and add Wisdom to Arcana and Nature checks.', 1),
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Druid') AND name = 'Primal Order'), 'Warden', 'Gain Martial weapon proficiency and Medium armor training.', 0);
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Strength or Dexterity', `saving_throws` = '["Strength","Constitution"]', `armor_training` = '["Light armor","Medium armor","Heavy armor","Shields"]', `weapon_proficiencies` = '["Simple weapons","Martial weapons"]', `tool_proficiencies` = '[]', `tool_choice` = NULL, `skill_choice_count` = 2, `skill_choice_options` = '["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Persuasion","Perception","Survival"]', `expertise_count` = 0, `weapon_mastery_count` = 3, `spellcasting_ability` = NULL, `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Chain Mail","quantity":1},{"item":"Greatsword","quantity":1},{"item":"Flail","quantity":1},{"item":"Javelin","quantity":8},{"item":"Dungeoneer''s Pack","quantity":1}],"gold":4},"B":{"items":[{"item":"Studded Leather Armor","quantity":1},{"item":"Scimitar","quantity":1},{"item":"Shortsword","quantity":1},{"item":"Longbow","quantity":1},{"item":"Arrow","quantity":20},{"item":"Quiver","quantity":1},{"item":"Dungeoneer''s Pack","quantity":1}],"gold":11}},"goldAlternative":155}' WHERE `name` = 'Fighter';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Fighter'), 1, 2, '{"Second Wind":2,"Weapon Mastery":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 2, 2, '{"Second Wind":2,"Weapon Mastery":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 3, 2, '{"Second Wind":2,"Weapon Mastery":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 4, 2, '{"Second Wind":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 5, 3, '{"Second Wind":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 6, 3, '{"Second Wind":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 7, 3, '{"Second Wind":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 8, 3, '{"Second Wind":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 9, 4, '{"Second Wind":3,"Weapon Mastery":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 10, 4, '{"Second Wind":4,"Weapon Mastery":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 11, 4, '{"Second Wind":4,"Weapon Mastery":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 12, 4, '{"Second Wind":4,"Weapon Mastery":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 13, 5, '{"Second Wind":4,"Weapon Mastery":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 14, 5, '{"Second Wind":4,"Weapon Mastery":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 15, 5, '{"Second Wind":4,"Weapon Mastery":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 16, 5, '{"Second Wind":4,"Weapon Mastery":6}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 17, 6, '{"Second Wind":4,"Weapon Mastery":6}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 18, 6, '{"Second Wind":4,"Weapon Mastery":6}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 19, 6, '{"Second Wind":4,"Weapon Mastery":6}', NULL),
	((SELECT id FROM classes WHERE name = 'Fighter'), 20, 6, '{"Second Wind":4,"Weapon Mastery":6}', NULL);
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 1, 'Fighting Style', 'Gain a Fighting Style feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 1, 'Second Wind', 'Bonus action: regain hit points.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 1, 'Weapon Mastery', 'Use the mastery properties of three kinds of weapons.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 2, 'Action Surge', 'Take one additional action on your turn.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 2, 'Tactical Mind', 'Spend Second Wind to add to a failed ability check.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 3, 'Fighter Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 5, 'Extra Attack', 'Attack twice when you take the Attack action.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 5, 'Tactical Shift', 'Move without opportunity attacks when you use Second Wind.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 6, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 9, 'Indomitable', 'Reroll a failed saving throw.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 9, 'Tactical Master', 'Replace a weapon''s mastery property with Push, Sap or Slow.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 11, 'Two Extra Attacks', 'Attack three times when you take the Attack action.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 13, 'Studied Attacks', 'Gain advantage against a foe you missed.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 14, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), NULL, 20, 'Three Extra Attacks', 'Attack four times when you take the Attack action.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Fighter'), 'Champion', 'A fighter focused on raw physical excellence.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Fighter'), (SELECT id FROM subclasses WHERE name = 'Champion'), 3, 'Improved Critical', 'Weapon attacks score a critical hit on a 19 or 20.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), (SELECT id FROM subclasses WHERE name = 'Champion'), 3, 'Remarkable Athlete', 'Advantage on initiative and Athletics checks; extra movement after critical hits.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), (SELECT id FROM subclasses WHERE name = 'Champion'), 7, 'Additional Fighting Style', 'Gain a second Fighting Style feat.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), (SELECT id FROM subclasses WHERE name = 'Champion'), 10, 'Heroic Warrior', 'Gain Heroic Inspiration at the start of your turns.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), (SELECT id FROM subclasses WHERE name = 'Champion'), 15, 'Superior Critical', 'Weapon attacks score a critical hit on an 18-20.'),
	((SELECT id FROM classes WHERE name = 'Fighter'), (SELECT id FROM subclasses WHERE name = 'Champion'), 18, 'Survivor', 'Gain advantage on death saves and regenerate hit points.');
--> statement-breakpoint
INSERT INTO `class_choice_groups` (`class_id`, `level`, `name`, `description`, `choice_count`) VALUES ((SELECT id FROM classes WHERE name = 'Fighter'), 1, 'Fighting Style', 'Choose a Fighting Style feat.', 1);
--> statement-breakpoint
INSERT INTO `class_choice_options` (`choice_group_id`, `name`, `description`, `extra_cantrips`) VALUES
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Fighter') AND name = 'Fighting Style'), 'Archery', '+2 bonus to attack rolls with ranged weapons.', 0),
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Fighter') AND name = 'Fighting Style'), 'Defense', '+1 bonus to AC while wearing armor.', 0),
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Fighter') AND name = 'Fighting Style'), 'Great Weapon Fighting', 'Treat 1s and 2s as 3s on damage dice with two-handed weapons.', 0),
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Fighter') AND name = 'Fighting Style'), 'Two-Weapon Fighting', 'Add your ability modifier to the damage of the extra attack.', 0);
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Dexterity and Wisdom', `saving_throws` = '["Strength","Dexterity"]', `armor_training` = '[]', `weapon_proficiencies` = '["Simple weapons","Martial weapons with the Light property"]', `tool_proficiencies` = '[]', `tool_choice` = NULL, `skill_choice_count` = 2, `skill_choice_options` = '["Acrobatics","Athletics","History","Insight","Religion","Stealth"]', `expertise_count` = 0, `weapon_mastery_count` = 0, `spellcasting_ability` = NULL, `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Spear","quantity":1},{"item":"Dagger","quantity":5},{"item":"Artisan''s Tools","quantity":1},{"item":"Explorer''s Pack","quantity":1}],"gold":11}},"goldAlternative":50}' WHERE `name` = 'Monk';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Monk'), 1, 2, '{"Martial Arts":"d6","Focus Points":"-","Unarmored Movement":"-"}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 2, 2, '{"Martial Arts":"d6","Focus Points":2,"Unarmored Movement":"+10 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 3, 2, '{"Martial Arts":"d6","Focus Points":3,"Unarmored Movement":"+10 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 4, 2, '{"Martial Arts":"d6","Focus Points":4,"Unarmored Movement":"+10 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 5, 3, '{"Martial Arts":"d8","Focus Points":5,"Unarmored Movement":"+10 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 6, 3, '{"Martial Arts":"d8","Focus Points":6,"Unarmored Movement":"+15 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 7, 3, '{"Martial Arts":"d8","Focus Points":7,"Unarmored Movement":"+15 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 8, 3, '{"Martial Arts":"d8","Focus Points":8,"Unarmored Movement":"+15 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 9, 4, '{"Martial Arts":"d8","Focus Points":9,"Unarmored Movement":"+15 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 10, 4, '{"Martial Arts":"d8","Focus Points":10,"Unarmored Movement":"+20 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 11, 4, '{"Martial Arts":"d10","Focus Points":11,"Unarmored Movement":"+20 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 12, 4, '{"Martial Arts":"d10","Focus Points":12,"Unarmored Movement":"+20 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 13, 5, '{"Martial Arts":"d10","Focus Points":13,"Unarmored Movement":"+20 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 14, 5, '{"Martial Arts":"d10","Focus Points":14,"Unarmored Movement":"+25 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 15, 5, '{"Martial Arts":"d10","Focus Points":15,"Unarmored Movement":"+25 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 16, 5, '{"Martial Arts":"d10","Focus Points":16,"Unarmored Movement":"+25 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 17, 6, '{"Martial Arts":"d12","Focus Points":17,"Unarmored Movement":"+25 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 18, 6, '{"Martial Arts":"d12","Focus Points":18,"Unarmored Movement":"+30 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 19, 6, '{"Martial Arts":"d12","Focus Points":19,"Unarmored Movement":"+30 ft."}', NULL),
	((SELECT id FROM classes WHERE name = 'Monk'), 20, 6, '{"Martial Arts":"d12","Focus Points":20,"Unarmored Movement":"+30 ft."}', NULL);
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 1, 'Martial Arts', 'Use Dexterity for unarmed strikes and monk weapons, with a Bonus Unarmed Strike.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 1, 'Unarmored Defense', 'Without armor your AC is 10 plus Dexterity and Wisdom modifiers.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 2, 'Monk''s Focus', 'Spend Focus Points on Flurry of Blows, Patient Defense and Step of the Wind.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 2, 'Unarmored Movement', 'Speed increases while unarmored.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 2, 'Uncanny Metabolism', 'Regain Focus Points and hit points when you roll initiative.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 3, 'Deflect Attacks', 'Reaction: reduce damage from an attack.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 3, 'Monk Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 4, 'Slow Fall', 'Reaction: reduce falling damage.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 5, 'Extra Attack', 'Attack twice when you take the Attack action.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 5, 'Stunning Strike', 'Spend a Focus Point to stun a creature you hit.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 6, 'Empowered Strikes', 'Unarmed strikes can deal Force damage.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 7, 'Evasion', 'Take no damage on a successful Dexterity save against area effects.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 9, 'Acrobatic Movement', 'Move along vertical surfaces and liquids.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 10, 'Heightened Focus', 'Flurry of Blows, Patient Defense and Step of the Wind improve.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 10, 'Self-Restoration', 'End charmed, frightened or poisoned conditions on yourself.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 13, 'Deflect Energy', 'Deflect Attacks works on any damage type.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 14, 'Disciplined Survivor', 'Proficiency in all saving throws and reroll with Focus Points.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 15, 'Perfect Focus', 'Regain Focus Points on initiative when low.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 18, 'Superior Defense', 'Spend Focus Points to resist all damage except Force.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Monk'), NULL, 20, 'Body and Mind', 'Dexterity and Wisdom scores each increase by 4, to a maximum of 25.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Monk'), 'Warrior of the Hand', 'A monk who masters unarmed combat.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Monk'), (SELECT id FROM subclasses WHERE name = 'Warrior of the Hand'), 3, 'Open Hand Technique', 'Flurry of Blows can add Addle, Push or Topple effects.'),
	((SELECT id FROM classes WHERE name = 'Monk'), (SELECT id FROM subclasses WHERE name = 'Warrior of the Hand'), 6, 'Wholeness of Body', 'Bonus action: regain hit points.'),
	((SELECT id FROM classes WHERE name = 'Monk'), (SELECT id FROM subclasses WHERE name = 'Warrior of the Hand'), 11, 'Fleet Step', 'Take Step of the Wind when you use Flurry of Blows.'),
	((SELECT id FROM classes WHERE name = 'Monk'), (SELECT id FROM subclasses WHERE name = 'Warrior of the Hand'), 17, 'Quivering Palm', 'Set up lethal vibrations in a creature you hit.');
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Strength and Charisma', `saving_throws` = '["Wisdom","Charisma"]', `armor_training` = '["Light armor","Medium armor","Heavy armor","Shields"]', `weapon_proficiencies` = '["Simple weapons","Martial weapons"]', `tool_proficiencies` = '[]', `tool_choice` = NULL, `skill_choice_count` = 2, `skill_choice_options` = '["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"]', `expertise_count` = 0, `weapon_mastery_count` = 2, `spellcasting_ability` = 'Charisma', `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Chain Mail","quantity":1},{"item":"Shield","quantity":1},{"item":"Longsword","quantity":1},{"item":"Javelin","quantity":6},{"item":"Holy Symbol","quantity":1},{"item":"Priest''s Pack","quantity":1}],"gold":9}},"goldAlternative":150}' WHERE `name` = 'Paladin';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Paladin'), 1, 2, '{"Channel Divinity":"-","Prepared Spells":2}', '[2]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 2, 2, '{"Channel Divinity":"-","Prepared Spells":3}', '[2]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 3, 2, '{"Channel Divinity":2,"Prepared Spells":4}', '[3]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 4, 2, '{"Channel Divinity":2,"Prepared Spells":5}', '[3]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 5, 3, '{"Channel Divinity":2,"Prepared Spells":6}', '[4,2]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 6, 3, '{"Channel Divinity":2,"Prepared Spells":6}', '[4,2]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 7, 3, '{"Channel Divinity":2,"Prepared Spells":7}', '[4,3]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 8, 3, '{"Channel Divinity":2,"Prepared Spells":7}', '[4,3]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 9, 4, '{"Channel Divinity":2,"Prepared Spells":9}', '[4,3,2]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 10, 4, '{"Channel Divinity":2,"Prepared Spells":9}', '[4,3,2]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 11, 4, '{"Channel Divinity":3,"Prepared Spells":10}', '[4,3,3]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 12, 4, '{"Channel Divinity":3,"Prepared Spells":10}', '[4,3,3]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 13, 5, '{"Channel Divinity":3,"Prepared Spells":11}', '[4,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 14, 5, '{"Channel Divinity":3,"Prepared Spells":11}', '[4,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 15, 5, '{"Channel Divinity":3,"Prepared Spells":12}', '[4,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 16, 5, '{"Channel Divinity":3,"Prepared Spells":12}', '[4,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 17, 6, '{"Channel Divinity":3,"Prepared Spells":14}', '[4,3,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 18, 6, '{"Channel Divinity":3,"Prepared Spells":14}', '[4,3,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 19, 6, '{"Channel Divinity":3,"Prepared Spells":15}', '[4,3,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Paladin'), 20, 6, '{"Channel Divinity":3,"Prepared Spells":15}', '[4,3,3,3,2]');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 1, 'Lay On Hands', 'Bonus action: heal from a pool of hit points.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 1, 'Spellcasting', 'Cast paladin spells using Charisma.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 1, 'Weapon Mastery', 'Use the mastery properties of two kinds of weapons.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 2, 'Fighting Style', 'Gain a Fighting Style feat.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 2, 'Paladin''s Smite', 'Cast Divine Smite once per long rest without a slot.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 3, 'Channel Divinity', 'Use Divine Sense.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 3, 'Paladin Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 5, 'Extra Attack', 'Attack twice when you take the Attack action.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 5, 'Faithful Steed', 'Cast Find Steed once per long rest.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 6, 'Aura of Protection', 'Add your Charisma modifier to saves for you and nearby allies.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 9, 'Abjure Foes', 'Channel Divinity: frighten nearby creatures.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 10, 'Aura of Courage', 'You and nearby allies can''t be frightened.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 11, 'Radiant Strikes', 'Melee attacks deal extra radiant damage.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 14, 'Restoring Touch', 'Remove conditions when using Lay On Hands.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 18, 'Aura Expansion', 'Your auras reach 30 feet.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Paladin'), 'Oath of Devotion', 'A paladin sworn to honesty, courage and justice.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Paladin'), (SELECT id FROM subclasses WHERE name = 'Oath of Devotion'), 3, 'Oath of Devotion Spells', 'Always have oath spells prepared.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), (SELECT id FROM subclasses WHERE name = 'Oath of Devotion'), 3, 'Sacred Weapon', 'Channel Divinity: imbue a weapon with radiant light.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), (SELECT id FROM subclasses WHERE name = 'Oath of Devotion'), 7, 'Aura of Devotion', 'You and nearby allies can''t be charmed.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), (SELECT id FROM subclasses WHERE name = 'Oath of Devotion'), 15, 'Smite of Protection', 'Divine Smite also grants half cover to allies.'),
	((SELECT id FROM classes WHERE name = 'Paladin'), (SELECT id FROM subclasses WHERE name = 'Oath of Devotion'), 20, 'Holy Nimbus', 'Radiate sunlight and gain advantage against fiends and undead.');
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Dexterity and Wisdom', `saving_throws` = '["Strength","Dexterity"]', `armor_training` = '["Light armor","Medium armor","Shields"]', `weapon_proficiencies` = '["Simple weapons","Martial weapons"]', `tool_proficiencies` = '[]', `tool_choice` = NULL, `skill_choice_count` = 3, `skill_choice_options` = '["Animal Handling","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"]', `expertise_count` = 0, `weapon_mastery_count` = 2, `spellcasting_ability` = 'Wisdom', `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Studded Leather Armor","quantity":1},{"item":"Scimitar","quantity":1},{"item":"Shortsword","quantity":1},{"item":"Longbow","quantity":1},{"item":"Arrow","quantity":20},{"item":"Quiver","quantity":1},{"item":"Druidic Focus","quantity":1},{"item":"Explorer''s Pack","quantity":1}],"gold":7}},"goldAlternative":150}' WHERE `name` = 'Ranger';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Ranger'), 1, 2, '{"Favored Enemy":2,"Prepared Spells":2}', '[2]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 2, 2, '{"Favored Enemy":2,"Prepared Spells":3}', '[2]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 3, 2, '{"Favored Enemy":2,"Prepared Spells":4}', '[3]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 4, 2, '{"Favored Enemy":2,"Prepared Spells":5}', '[3]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 5, 3, '{"Favored Enemy":3,"Prepared Spells":6}', '[4,2]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 6, 3, '{"Favored Enemy":3,"Prepared Spells":6}', '[4,2]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 7, 3, '{"Favored Enemy":3,"Prepared Spells":7}', '[4,3]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 8, 3, '{"Favored Enemy":3,"Prepared Spells":7}', '[4,3]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 9, 4, '{"Favored Enemy":4,"Prepared Spells":9}', '[4,3,2]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 10, 4, '{"Favored Enemy":4,"Prepared Spells":9}', '[4,3,2]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 11, 4, '{"Favored Enemy":4,"Prepared Spells":10}', '[4,3,3]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 12, 4, '{"Favored Enemy":4,"Prepared Spells":10}', '[4,3,3]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 13, 5, '{"Favored Enemy":5,"Prepared Spells":11}', '[4,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 14, 5, '{"Favored Enemy":5,"Prepared Spells":11}', '[4,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 15, 5, '{"Favored Enemy":5,"Prepared Spells":12}', '[4,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 16, 5, '{"Favored Enemy":5,"Prepared Spells":12}', '[4,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 17, 6, '{"Favored Enemy":6,"Prepared Spells":14}', '[4,3,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 18, 6, '{"Favored Enemy":6,"Prepared Spells":14}', '[4,3,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 19, 6, '{"Favored Enemy":6,"Prepared Spells":15}', '[4,3,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Ranger'), 20, 6, '{"Favored Enemy":6,"Prepared Spells":15}', '[4,3,3,3,2]');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 1, 'Spellcasting', 'Cast ranger spells using Wisdom.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 1, 'Favored Enemy', 'Always have Hunter''s Mark prepared and cast it without a slot.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 1, 'Weapon Mastery', 'Use the mastery properties of two kinds of weapons.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 2, 'Deft Explorer', 'Gain Expertise in one skill and learn two languages.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 2, 'Fighting Style', 'Gain a Fighting Style feat.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 3, 'Ranger Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 5, 'Extra Attack', 'Attack twice when you take the Attack action.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 6, 'Roving', 'Gain extra speed plus Climb and Swim speeds.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 9, 'Expertise', 'Gain Expertise in two more skills.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 10, 'Tireless', 'Gain temporary hit points and reduce exhaustion.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 13, 'Relentless Hunter', 'Damage cannot break your concentration on Hunter''s Mark.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 14, 'Nature''s Veil', 'Become Invisible briefly.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 17, 'Precise Hunter', 'Advantage on attacks against your Hunter''s Mark target.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 18, 'Feral Senses', 'Gain Blindsight.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), NULL, 20, 'Foe Slayer', 'Hunter''s Mark deals a larger damage die.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Ranger'), 'Hunter', 'A ranger who masters techniques for slaying foes.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Ranger'), (SELECT id FROM subclasses WHERE name = 'Hunter'), 3, 'Hunter''s Lore', 'See immunities, resistances and vulnerabilities of your Hunter''s Mark target.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), (SELECT id FROM subclasses WHERE name = 'Hunter'), 3, 'Hunter''s Prey', 'Choose Colossus Slayer or Horde Breaker.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), (SELECT id FROM subclasses WHERE name = 'Hunter'), 7, 'Defensive Tactics', 'Choose Escape the Horde or Multiattack Defense.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), (SELECT id FROM subclasses WHERE name = 'Hunter'), 11, 'Superior Hunter''s Prey', 'Hunter''s Mark spreads damage to another creature.'),
	((SELECT id FROM classes WHERE name = 'Ranger'), (SELECT id FROM subclasses WHERE name = 'Hunter'), 15, 'Superior Hunter''s Defense', 'Reaction: gain resistance to damage.');
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Dexterity', `saving_throws` = '["Dexterity","Intelligence"]', `armor_training` = '["Light armor"]', `weapon_proficiencies` = '["Simple weapons","Martial weapons with the Finesse or Light property"]', `tool_proficiencies` = '["Thieves'' Tools"]', `tool_choice` = NULL, `skill_choice_count` = 4, `skill_choice_options` = '["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Persuasion","Sleight of Hand","Stealth"]', `expertise_count` = 2, `weapon_mastery_count` = 2, `spellcasting_ability` = NULL, `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Leather Armor","quantity":1},{"item":"Dagger","quantity":2},{"item":"Shortsword","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Arrow","quantity":20},{"item":"Quiver","quantity":1},{"item":"Thieves'' Tools","quantity":1},{"item":"Burglar''s Pack","quantity":1}],"gold":8}},"goldAlternative":100}' WHERE `name` = 'Rogue';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Rogue'), 1, 2, '{"Sneak Attack":"1d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 2, 2, '{"Sneak Attack":"1d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 3, 2, '{"Sneak Attack":"2d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 4, 2, '{"Sneak Attack":"2d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 5, 3, '{"Sneak Attack":"3d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 6, 3, '{"Sneak Attack":"3d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 7, 3, '{"Sneak Attack":"4d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 8, 3, '{"Sneak Attack":"4d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 9, 4, '{"Sneak Attack":"5d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 10, 4, '{"Sneak Attack":"5d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 11, 4, '{"Sneak Attack":"6d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 12, 4, '{"Sneak Attack":"6d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 13, 5, '{"Sneak Attack":"7d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 14, 5, '{"Sneak Attack":"7d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 15, 5, '{"Sneak Attack":"8d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 16, 5, '{"Sneak Attack":"8d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 17, 6, '{"Sneak Attack":"9d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 18, 6, '{"Sneak Attack":"9d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 19, 6, '{"Sneak Attack":"10d6","Weapon Mastery":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Rogue'), 20, 6, '{"Sneak Attack":"10d6","Weapon Mastery":2}', NULL);
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 1, 'Expertise', 'Gain Expertise in two skills.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 1, 'Sneak Attack', 'Deal extra damage once per turn with advantage or an adjacent ally.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 1, 'Thieves'' Cant', 'Know the secret language of rogues.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 1, 'Weapon Mastery', 'Use the mastery properties of two kinds of weapons.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 2, 'Cunning Action', 'Bonus action: Dash, Disengage or Hide.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 3, 'Rogue Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 3, 'Steady Aim', 'Bonus action: gain advantage on your next attack.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 5, 'Cunning Strike', 'Trade Sneak Attack dice for special effects.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 5, 'Uncanny Dodge', 'Reaction: halve damage from an attack.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 6, 'Expertise', 'Gain Expertise in two more skills.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 7, 'Evasion', 'Take no damage on a successful Dexterity save against area effects.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 7, 'Reliable Talent', 'Treat a d20 roll of 9 or lower as a 10 on proficient checks.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 10, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 11, 'Improved Cunning Strike', 'Apply two Cunning Strike effects.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 14, 'Devious Strikes', 'Gain new Cunning Strike options.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 15, 'Slippery Mind', 'Proficiency in Wisdom and Charisma saves.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 18, 'Elusive', 'No attack roll has advantage against you.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), NULL, 20, 'Stroke of Luck', 'Turn a failed d20 Test into a 20.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Rogue'), 'Thief', 'A rogue who specializes in burglary and agility.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Rogue'), (SELECT id FROM subclasses WHERE name = 'Thief'), 3, 'Fast Hands', 'Use Cunning Action to make Sleight of Hand checks, use thieves'' tools or an object.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), (SELECT id FROM subclasses WHERE name = 'Thief'), 3, 'Second-Story Work', 'Gain Climb speed and add Dexterity to Athletics-based jumps.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), (SELECT id FROM subclasses WHERE name = 'Thief'), 9, 'Supreme Sneak', 'Gain Cunning Strike option Stealth Attack.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), (SELECT id FROM subclasses WHERE name = 'Thief'), 13, 'Use Magic Device', 'Gain better use of magic items.'),
	((SELECT id FROM classes WHERE name = 'Rogue'), (SELECT id FROM subclasses WHERE name = 'Thief'), 17, 'Thief''s Reflexes', 'Take two turns during the first round of combat.');
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Charisma', `saving_throws` = '["Constitution","Charisma"]', `armor_training` = '[]', `weapon_proficiencies` = '["Simple weapons"]', `tool_proficiencies` = '[]', `tool_choice` = NULL, `skill_choice_count` = 2, `skill_choice_options` = '["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"]', `expertise_count` = 0, `weapon_mastery_count` = 0, `spellcasting_ability` = 'Charisma', `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Spear","quantity":1},{"item":"Dagger","quantity":2},{"item":"Arcane Focus","quantity":1},{"item":"Dungeoneer''s Pack","quantity":1}],"gold":28}},"goldAlternative":50}' WHERE `name` = 'Sorcerer';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 1, 2, '{"Sorcery Points":"-","Cantrips":4,"Prepared Spells":2}', '[2]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 2, 2, '{"Sorcery Points":2,"Cantrips":4,"Prepared Spells":4}', '[3]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 3, 2, '{"Sorcery Points":3,"Cantrips":4,"Prepared Spells":6}', '[4,2]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 4, 2, '{"Sorcery Points":4,"Cantrips":5,"Prepared Spells":7}', '[4,3]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 5, 3, '{"Sorcery Points":5,"Cantrips":5,"Prepared Spells":9}', '[4,3,2]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 6, 3, '{"Sorcery Points":6,"Cantrips":5,"Prepared Spells":10}', '[4,3,3]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 7, 3, '{"Sorcery Points":7,"Cantrips":5,"Prepared Spells":11}', '[4,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 8, 3, '{"Sorcery Points":8,"Cantrips":5,"Prepared Spells":12}', '[4,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 9, 4, '{"Sorcery Points":9,"Cantrips":5,"Prepared Spells":14}', '[4,3,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 10, 4, '{"Sorcery Points":10,"Cantrips":6,"Prepared Spells":15}', '[4,3,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 11, 4, '{"Sorcery Points":11,"Cantrips":6,"Prepared Spells":16}', '[4,3,3,3,2,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 12, 4, '{"Sorcery Points":12,"Cantrips":6,"Prepared Spells":16}', '[4,3,3,3,2,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 13, 5, '{"Sorcery Points":13,"Cantrips":6,"Prepared Spells":17}', '[4,3,3,3,2,1,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 14, 5, '{"Sorcery Points":14,"Cantrips":6,"Prepared Spells":17}', '[4,3,3,3,2,1,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 15, 5, '{"Sorcery Points":15,"Cantrips":6,"Prepared Spells":18}', '[4,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 16, 5, '{"Sorcery Points":16,"Cantrips":6,"Prepared Spells":18}', '[4,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 17, 6, '{"Sorcery Points":17,"Cantrips":6,"Prepared Spells":19}', '[4,3,3,3,2,1,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 18, 6, '{"Sorcery Points":18,"Cantrips":6,"Prepared Spells":20}', '[4,3,3,3,3,1,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 19, 6, '{"Sorcery Points":19,"Cantrips":6,"Prepared Spells":21}', '[4,3,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), 20, 6, '{"Sorcery Points":20,"Cantrips":6,"Prepared Spells":22}', '[4,3,3,3,3,2,2,1,1]');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 1, 'Spellcasting', 'Cast sorcerer spells using Charisma.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 1, 'Innate Sorcery', 'Bonus action: briefly empower your spells.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 2, 'Font of Magic', 'Convert between Sorcery Points and spell slots.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 2, 'Metamagic', 'Gain two Metamagic options.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 3, 'Sorcerer Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 5, 'Sorcerous Restoration', 'Regain Sorcery Points on a short rest.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 7, 'Sorcery Incarnate', 'Use Metamagic more flexibly while Innate Sorcery is active.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 10, 'Metamagic', 'Gain two more Metamagic options.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 17, 'Metamagic', 'Gain two more Metamagic options.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), NULL, 20, 'Arcane Apotheosis', 'Use Metamagic freely while Innate Sorcery is active.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Sorcerer'), 'Draconic Sorcery', 'A sorcerer whose magic comes from draconic blood.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Sorcerer'), (SELECT id FROM subclasses WHERE name = 'Draconic Sorcery'), 3, 'Draconic Resilience', 'Gain extra hit points and natural armor.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), (SELECT id FROM subclasses WHERE name = 'Draconic Sorcery'), 3, 'Draconic Spells', 'Always have draconic spells prepared.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), (SELECT id FROM subclasses WHERE name = 'Draconic Sorcery'), 6, 'Elemental Affinity', 'Gain resistance and add Charisma to damage of a chosen type.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), (SELECT id FROM subclasses WHERE name = 'Draconic Sorcery'), 14, 'Dragon Wings', 'Manifest dragon wings to fly.'),
	((SELECT id FROM classes WHERE name = 'Sorcerer'), (SELECT id FROM subclasses WHERE name = 'Draconic Sorcery'), 18, 'Dragon Companion', 'Cast Summon Dragon once without a slot.');
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Charisma', `saving_throws` = '["Wisdom","Charisma"]', `armor_training` = '["Light armor"]', `weapon_proficiencies` = '["Simple weapons"]', `tool_proficiencies` = '[]', `tool_choice` = NULL, `skill_choice_count` = 2, `skill_choice_options` = '["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"]', `expertise_count` = 0, `weapon_mastery_count` = 0, `spellcasting_ability` = 'Charisma', `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Leather Armor","quantity":1},{"item":"Sickle","quantity":1},{"item":"Dagger","quantity":2},{"item":"Arcane Focus","quantity":1},{"item":"Book (occult lore)","quantity":1},{"item":"Scholar''s Pack","quantity":1}],"gold":15}},"goldAlternative":100}' WHERE `name` = 'Warlock';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Warlock'), 1, 2, '{"Eldritch Invocations":1,"Cantrips":2,"Prepared Spells":2,"Spell Slots":1,"Slot Level":1}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 2, 2, '{"Eldritch Invocations":3,"Cantrips":2,"Prepared Spells":3,"Spell Slots":2,"Slot Level":1}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 3, 2, '{"Eldritch Invocations":3,"Cantrips":2,"Prepared Spells":4,"Spell Slots":2,"Slot Level":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 4, 2, '{"Eldritch Invocations":3,"Cantrips":3,"Prepared Spells":5,"Spell Slots":2,"Slot Level":2}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 5, 3, '{"Eldritch Invocations":5,"Cantrips":3,"Prepared Spells":6,"Spell Slots":2,"Slot Level":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 6, 3, '{"Eldritch Invocations":5,"Cantrips":3,"Prepared Spells":7,"Spell Slots":2,"Slot Level":3}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 7, 3, '{"Eldritch Invocations":6,"Cantrips":3,"Prepared Spells":8,"Spell Slots":2,"Slot Level":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 8, 3, '{"Eldritch Invocations":6,"Cantrips":3,"Prepared Spells":9,"Spell Slots":2,"Slot Level":4}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 9, 4, '{"Eldritch Invocations":7,"Cantrips":3,"Prepared Spells":10,"Spell Slots":2,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 10, 4, '{"Eldritch Invocations":7,"Cantrips":4,"Prepared Spells":10,"Spell Slots":2,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 11, 4, '{"Eldritch Invocations":7,"Cantrips":4,"Prepared Spells":11,"Spell Slots":3,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 12, 4, '{"Eldritch Invocations":8,"Cantrips":4,"Prepared Spells":11,"Spell Slots":3,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 13, 5, '{"Eldritch Invocations":8,"Cantrips":4,"Prepared Spells":12,"Spell Slots":3,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 14, 5, '{"Eldritch Invocations":8,"Cantrips":4,"Prepared Spells":12,"Spell Slots":3,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 15, 5, '{"Eldritch Invocations":9,"Cantrips":4,"Prepared Spells":13,"Spell Slots":3,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 16, 5, '{"Eldritch Invocations":9,"Cantrips":4,"Prepared Spells":13,"Spell Slots":3,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 17, 6, '{"Eldritch Invocations":9,"Cantrips":4,"Prepared Spells":14,"Spell Slots":4,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 18, 6, '{"Eldritch Invocations":10,"Cantrips":4,"Prepared Spells":14,"Spell Slots":4,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 19, 6, '{"Eldritch Invocations":10,"Cantrips":4,"Prepared Spells":15,"Spell Slots":4,"Slot Level":5}', NULL),
	((SELECT id FROM classes WHERE name = 'Warlock'), 20, 6, '{"Eldritch Invocations":10,"Cantrips":4,"Prepared Spells":15,"Spell Slots":4,"Slot Level":5}', NULL);
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 1, 'Eldritch Invocations', 'Gain Eldritch Invocations that grant magical benefits.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 1, 'Pact Magic', 'Cast warlock spells using Charisma; slots recharge on a short rest.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 2, 'Magical Cunning', 'Regain half your Pact Magic slots once per long rest.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 3, 'Warlock Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 9, 'Contact Patron', 'Cast Contact Other Plane once per long rest without a slot.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 11, 'Mystic Arcanum (level 6 spell)', 'Cast a 6th-level spell once per long rest.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 13, 'Mystic Arcanum (level 7 spell)', 'Cast a 7th-level spell once per long rest.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 15, 'Mystic Arcanum (level 8 spell)', 'Cast an 8th-level spell once per long rest.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 17, 'Mystic Arcanum (level 9 spell)', 'Cast a 9th-level spell once per long rest.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), NULL, 20, 'Eldritch Master', 'Spend a minute to regain all Pact Magic slots.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Warlock'), 'Fiend Patron', 'A warlock bound to a fiend of the lower planes.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Warlock'), (SELECT id FROM subclasses WHERE name = 'Fiend Patron'), 3, 'Dark One''s Blessing', 'Gain temporary hit points when you reduce a creature to 0 hit points.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), (SELECT id FROM subclasses WHERE name = 'Fiend Patron'), 3, 'Fiend Spells', 'Always have fiend spells prepared.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), (SELECT id FROM subclasses WHERE name = 'Fiend Patron'), 6, 'Dark One''s Own Luck', 'Add a d10 to an ability check or saving throw.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), (SELECT id FROM subclasses WHERE name = 'Fiend Patron'), 10, 'Fiendish Resilience', 'Choose a damage type to resist.'),
	((SELECT id FROM classes WHERE name = 'Warlock'), (SELECT id FROM subclasses WHERE name = 'Fiend Patron'), 14, 'Hurl Through Hell', 'Banish a creature to the lower planes for a turn.');
--> statement-breakpoint
INSERT INTO `class_choice_groups` (`class_id`, `level`, `name`, `description`, `choice_count`) VALUES ((SELECT id FROM classes WHERE name = 'Warlock'), 1, 'Eldritch Invocation', 'Choose your level 1 Eldritch Invocation.', 1);
--> statement-breakpoint
INSERT INTO `class_choice_options` (`choice_group_id`, `name`, `description`, `extra_cantrips`) VALUES
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Warlock') AND name = 'Eldritch Invocation'), 'Armor of Shadows', 'Cast Mage Armor on yourself at will.', 0),
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Warlock') AND name = 'Eldritch Invocation'), 'Eldritch Mind', 'Advantage on Constitution saves to maintain concentration.', 0),
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Warlock') AND name = 'Eldritch Invocation'), 'Pact of the Blade', 'Conjure a pact weapon.', 0),
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Warlock') AND name = 'Eldritch Invocation'), 'Pact of the Chain', 'Learn Find Familiar with special forms.', 0),
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Warlock') AND name = 'Eldritch Invocation'), 'Pact of the Tome', 'Gain a Book of Shadows with extra cantrips.', 0),
	((SELECT id FROM class_choice_groups WHERE class_id = (SELECT id FROM classes WHERE name = 'Warlock') AND name = 'Eldritch Invocation'), 'Lessons of the First Ones', 'Gain an Origin feat of your choice.', 0);
--> statement-breakpoint
UPDATE `classes` SET `primary_ability` = 'Intelligence', `saving_throws` = '["Intelligence","Wisdom"]', `armor_training` = '[]', `weapon_proficiencies` = '["Simple weapons"]', `tool_proficiencies` = '[]', `tool_choice` = NULL, `skill_choice_count` = 2, `skill_choice_options` = '["Arcana","History","Insight","Investigation","Medicine","Nature","Religion"]', `expertise_count` = 0, `weapon_mastery_count` = 0, `spellcasting_ability` = 'Intelligence', `starting_equipment` = '{"packages":{"A":{"items":[{"item":"Dagger","quantity":2},{"item":"Arcane Focus","quantity":1},{"item":"Robe","quantity":1},{"item":"Spellbook","quantity":1},{"item":"Scholar''s Pack","quantity":1}],"gold":5}},"goldAlternative":55}' WHERE `name` = 'Wizard';
--> statement-breakpoint
INSERT INTO `class_levels` (`class_id`, `level`, `proficiency_bonus`, `columns`, `spell_slots`) VALUES
	((SELECT id FROM classes WHERE name = 'Wizard'), 1, 2, '{"Cantrips":3,"Prepared Spells":4}', '[2]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 2, 2, '{"Cantrips":3,"Prepared Spells":5}', '[3]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 3, 2, '{"Cantrips":3,"Prepared Spells":6}', '[4,2]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 4, 2, '{"Cantrips":4,"Prepared Spells":7}', '[4,3]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 5, 3, '{"Cantrips":4,"Prepared Spells":9}', '[4,3,2]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 6, 3, '{"Cantrips":4,"Prepared Spells":10}', '[4,3,3]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 7, 3, '{"Cantrips":4,"Prepared Spells":11}', '[4,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 8, 3, '{"Cantrips":4,"Prepared Spells":12}', '[4,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 9, 4, '{"Cantrips":4,"Prepared Spells":14}', '[4,3,3,3,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 10, 4, '{"Cantrips":5,"Prepared Spells":15}', '[4,3,3,3,2]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 11, 4, '{"Cantrips":5,"Prepared Spells":16}', '[4,3,3,3,2,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 12, 4, '{"Cantrips":5,"Prepared Spells":16}', '[4,3,3,3,2,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 13, 5, '{"Cantrips":5,"Prepared Spells":17}', '[4,3,3,3,2,1,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 14, 5, '{"Cantrips":5,"Prepared Spells":18}', '[4,3,3,3,2,1,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 15, 5, '{"Cantrips":5,"Prepared Spells":19}', '[4,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 16, 5, '{"Cantrips":5,"Prepared Spells":21}', '[4,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 17, 6, '{"Cantrips":5,"Prepared Spells":22}', '[4,3,3,3,2,1,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 18, 6, '{"Cantrips":5,"Prepared Spells":23}', '[4,3,3,3,3,1,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 19, 6, '{"Cantrips":5,"Prepared Spells":24}', '[4,3,3,3,3,2,1,1,1]'),
	((SELECT id FROM classes WHERE name = 'Wizard'), 20, 6, '{"Cantrips":5,"Prepared Spells":25}', '[4,3,3,3,3,2,2,1,1]');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 1, 'Spellcasting', 'Cast wizard spells using Intelligence from a spellbook.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 1, 'Ritual Adept', 'Cast wizard spells with the Ritual tag from your spellbook.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 1, 'Arcane Recovery', 'Recover spell slots on a short rest.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 2, 'Scholar', 'Gain Expertise in an Intelligence-based skill.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 3, 'Wizard Subclass', 'Gain a subclass of your choice and its level 3 features.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 4, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 5, 'Memorize Spell', 'Swap a prepared spell on a short rest.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 8, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 12, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 16, 'Ability Score Improvement', 'Increase one ability score by 2, or two by 1, or take a feat.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 18, 'Spell Mastery', 'Cast a 1st and 2nd-level spell at will.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 19, 'Epic Boon', 'Gain an Epic Boon feat or another feat of your choice.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), NULL, 20, 'Signature Spells', 'Always have two 3rd-level spells prepared and cast each once free.');
--> statement-breakpoint
INSERT INTO `subclasses` (`class_id`, `name`, `description`) VALUES ((SELECT id FROM classes WHERE name = 'Wizard'), 'Evoker', 'A wizard who shapes destructive magic.');
--> statement-breakpoint
INSERT INTO `class_features` (`class_id`, `subclass_id`, `level`, `name`, `description`) VALUES
	((SELECT id FROM classes WHERE name = 'Wizard'), (SELECT id FROM subclasses WHERE name = 'Evoker'), 3, 'Evocation Savant', 'Copy evocation spells into your spellbook more cheaply.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), (SELECT id FROM subclasses WHERE name = 'Evoker'), 3, 'Potent Cantrip', 'Damaging cantrips deal half damage on a successful save.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), (SELECT id FROM subclasses WHERE name = 'Evoker'), 6, 'Sculpt Spells', 'Protect allies from your evocation spells.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), (SELECT id FROM subclasses WHERE name = 'Evoker'), 10, 'Empowered Evocation', 'Add Intelligence modifier to evocation spell damage.'),
	((SELECT id FROM classes WHERE name = 'Wizard'), (SELECT id FROM subclasses WHERE name = 'Evoker'), 14, 'Overchannel', 'Maximize damage of a spell of level 5 or lower.');
