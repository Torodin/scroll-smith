INSERT INTO `features` (`name`, `description`) VALUES
	('Breath Weapon', 'As an action, exhale destructive energy in a short area. Creatures in the area make a Dexterity saving throw, taking damage on a failure and half as much on a success.'),
	('Darkvision', 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.'),
	('Draconic Flight', 'Beginning at 5th level, manifest spectral wings to gain a flying speed for a short time.'),
	('Dwarven Resilience', 'You have resistance to Poison damage and advantage on saving throws to avoid or end the Poisoned condition.'),
	('Dwarven Toughness', 'Your Hit Point maximum increases by 1, and increases by 1 again whenever you gain a level.'),
	('Stonecunning', 'As a Bonus Action, gain Tremorsense while standing on a stone surface; uses are limited by your Proficiency Bonus.'),
	('Fey Ancestry', 'You have advantage on saving throws to avoid or end the Charmed condition.'),
	('Keen Senses', 'You have proficiency in the Perception skill.'),
	('Trance', 'You do not need to sleep and can finish a Long Rest in a meditative trance.'),
	('Gnomish Cunning', 'You have advantage on Intelligence, Wisdom, and Charisma saving throws.'),
	('Large Form', 'As a Bonus Action, become Large for a short time if there is room; uses are limited by your Proficiency Bonus.'),
	('Powerful Build', 'You have advantage on ability checks to end the Grappled condition, and count as one size larger for carrying capacity.'),
	('Brave', 'You have advantage on saving throws to avoid or end the Frightened condition.'),
	('Halfling Nimbleness', 'You can move through the space of a creature larger than you.'),
	('Luck', 'When you roll a 1 on a d20 Test, you can reroll the die and must use the new roll.'),
	('Resourceful', 'When you finish a Long Rest, gain Heroic Inspiration.'),
	('Skillful', 'You gain proficiency in one skill of your choice.'),
	('Versatile', 'You gain an Origin feat of your choice.'),
	('Adrenaline Rush', 'As a Bonus Action, move up to your Speed and gain Temporary Hit Points; uses are limited by your Proficiency Bonus.'),
	('Relentless Endurance', 'When reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead; recharge on a Long Rest.'),
	('Otherworldly Presence', 'You know the Thaumaturgy cantrip.'),
	('Draconic Ancestry: Black', 'Your Breath Weapon and damage resistance use Acid damage.'),
	('Draconic Ancestry: Blue', 'Your Breath Weapon and damage resistance use Lightning damage.'),
	('Draconic Ancestry: Brass', 'Your Breath Weapon and damage resistance use Fire damage.'),
	('Draconic Ancestry: Bronze', 'Your Breath Weapon and damage resistance use Lightning damage.'),
	('Draconic Ancestry: Copper', 'Your Breath Weapon and damage resistance use Acid damage.'),
	('Draconic Ancestry: Gold', 'Your Breath Weapon and damage resistance use Fire damage.'),
	('Draconic Ancestry: Green', 'Your Breath Weapon and damage resistance use Poison damage.'),
	('Draconic Ancestry: Red', 'Your Breath Weapon and damage resistance use Fire damage.'),
	('Draconic Ancestry: Silver', 'Your Breath Weapon and damage resistance use Cold damage.'),
	('Draconic Ancestry: White', 'Your Breath Weapon and damage resistance use Cold damage.'),
	('Drow Lineage Magic', 'You know the Dancing Lights cantrip. At character level 3, you can cast Faerie Fire; at level 5, Darkness.'),
	('High Elf Lineage Magic', 'You know the Prestidigitation cantrip. At character level 3, you can cast Detect Magic; at level 5, Misty Step.'),
	('Wood Elf Lineage Magic', 'You know the Druidcraft cantrip. At character level 3, you can cast Longstrider; at level 5, Pass without Trace.'),
	('Forest Gnome Magic', 'You know the Minor Illusion cantrip and can communicate simple ideas with small animals.'),
	('Rock Gnome Magic', 'You know the Mending and Prestidigitation cantrips and can create tiny clockwork devices.'),
	('Cloud Giant Ancestry', 'You can teleport a short distance as a reaction when a creature ends its turn nearby.'),
	('Fire Giant Ancestry', 'Once on each of your turns when you hit with an attack, deal extra Fire damage.'),
	('Frost Giant Ancestry', 'Once on each of your turns when you hit with an attack, deal extra Cold damage and reduce the target’s Speed.'),
	('Hill Giant Ancestry', 'Once on each of your turns when you hit a Large or smaller creature, it can fall Prone.'),
	('Stone Giant Ancestry', 'When a nearby creature hits you, use your reaction to reduce the damage and possibly deal Force damage back.'),
	('Storm Giant Ancestry', 'When a nearby creature damages you, use your reaction to deal Lightning damage to it.'),
	('Abyssal Legacy Magic', 'You know the Poison Spray cantrip. At character level 3, you can cast Ray of Sickness; at level 5, Hold Person.'),
	('Chthonic Legacy Magic', 'You know the Chill Touch cantrip. At character level 3, you can cast False Life; at level 5, Ray of Enfeeblement.'),
	('Infernal Legacy Magic', 'You know the Fire Bolt cantrip. At character level 3, you can cast Hellish Rebuke; at level 5, Darkness.');
--> statement-breakpoint
INSERT INTO `species_to_features` (`specie_id`, `feature_id`)
SELECT s.id, f.id FROM species s
JOIN (
	SELECT 'Dragonborn' AS species_name, 'Breath Weapon' AS feature_name
	UNION ALL SELECT 'Dragonborn', 'Darkvision'
	UNION ALL SELECT 'Dragonborn', 'Draconic Flight'
	UNION ALL SELECT 'Dwarf', 'Darkvision'
	UNION ALL SELECT 'Dwarf', 'Dwarven Resilience'
	UNION ALL SELECT 'Dwarf', 'Dwarven Toughness'
	UNION ALL SELECT 'Dwarf', 'Stonecunning'
	UNION ALL SELECT 'Elf', 'Darkvision'
	UNION ALL SELECT 'Elf', 'Fey Ancestry'
	UNION ALL SELECT 'Elf', 'Keen Senses'
	UNION ALL SELECT 'Elf', 'Trance'
	UNION ALL SELECT 'Gnome', 'Darkvision'
	UNION ALL SELECT 'Gnome', 'Gnomish Cunning'
	UNION ALL SELECT 'Goliath', 'Large Form'
	UNION ALL SELECT 'Goliath', 'Powerful Build'
	UNION ALL SELECT 'Halfling', 'Brave'
	UNION ALL SELECT 'Halfling', 'Halfling Nimbleness'
	UNION ALL SELECT 'Halfling', 'Luck'
	UNION ALL SELECT 'Human', 'Resourceful'
	UNION ALL SELECT 'Human', 'Skillful'
	UNION ALL SELECT 'Human', 'Versatile'
	UNION ALL SELECT 'Orc', 'Adrenaline Rush'
	UNION ALL SELECT 'Orc', 'Darkvision'
	UNION ALL SELECT 'Orc', 'Relentless Endurance'
	UNION ALL SELECT 'Tiefling', 'Darkvision'
	UNION ALL SELECT 'Tiefling', 'Otherworldly Presence'
) grants ON grants.species_name = s.name
JOIN features f ON f.name = grants.feature_name;
--> statement-breakpoint
INSERT INTO `species_choice_groups` (`species_id`, `name`, `description`, `choice_count`)
SELECT s.id, groups.name, groups.description, groups.choice_count
FROM species s
JOIN (
	SELECT 'Dragonborn' AS species_name, 'Draconic Ancestry' AS name, 'Choose the draconic ancestry that determines your damage type and resistance.' AS description, 1 AS choice_count
	UNION ALL SELECT 'Elf', 'Elven Lineage', 'Choose a lineage that grants its associated magic.', 1
	UNION ALL SELECT 'Gnome', 'Gnomish Lineage', 'Choose a lineage and its associated magic.', 1
	UNION ALL SELECT 'Goliath', 'Giant Ancestry', 'Choose a giant ancestry that grants a special ability.', 1
	UNION ALL SELECT 'Tiefling', 'Fiendish Legacy', 'Choose an otherworldly legacy that grants its associated magic.', 1
) groups ON groups.species_name = s.name;
--> statement-breakpoint
INSERT INTO `species_choice_options` (`choice_group_id`, `name`, `description`)
SELECT g.id, options.name, options.description
FROM species_choice_groups g
JOIN species s ON s.id = g.species_id
JOIN (
	SELECT 'Dragonborn' AS species_name, 'Draconic Ancestry' AS group_name, 'Black' AS name, 'Acid damage.' AS description
	UNION ALL SELECT 'Dragonborn', 'Draconic Ancestry', 'Blue', 'Lightning damage.'
	UNION ALL SELECT 'Dragonborn', 'Draconic Ancestry', 'Brass', 'Fire damage.'
	UNION ALL SELECT 'Dragonborn', 'Draconic Ancestry', 'Bronze', 'Lightning damage.'
	UNION ALL SELECT 'Dragonborn', 'Draconic Ancestry', 'Copper', 'Acid damage.'
	UNION ALL SELECT 'Dragonborn', 'Draconic Ancestry', 'Gold', 'Fire damage.'
	UNION ALL SELECT 'Dragonborn', 'Draconic Ancestry', 'Green', 'Poison damage.'
	UNION ALL SELECT 'Dragonborn', 'Draconic Ancestry', 'Red', 'Fire damage.'
	UNION ALL SELECT 'Dragonborn', 'Draconic Ancestry', 'Silver', 'Cold damage.'
	UNION ALL SELECT 'Dragonborn', 'Draconic Ancestry', 'White', 'Cold damage.'
	UNION ALL SELECT 'Elf', 'Elven Lineage', 'Drow', 'Drow lineage magic.'
	UNION ALL SELECT 'Elf', 'Elven Lineage', 'High Elf', 'High Elf lineage magic.'
	UNION ALL SELECT 'Elf', 'Elven Lineage', 'Wood Elf', 'Wood Elf lineage magic.'
	UNION ALL SELECT 'Gnome', 'Gnomish Lineage', 'Forest Gnome', 'Forest Gnome magic.'
	UNION ALL SELECT 'Gnome', 'Gnomish Lineage', 'Rock Gnome', 'Rock Gnome magic.'
	UNION ALL SELECT 'Goliath', 'Giant Ancestry', 'Cloud Giant', 'Cloud Giant ancestry.'
	UNION ALL SELECT 'Goliath', 'Giant Ancestry', 'Fire Giant', 'Fire Giant ancestry.'
	UNION ALL SELECT 'Goliath', 'Giant Ancestry', 'Frost Giant', 'Frost Giant ancestry.'
	UNION ALL SELECT 'Goliath', 'Giant Ancestry', 'Hill Giant', 'Hill Giant ancestry.'
	UNION ALL SELECT 'Goliath', 'Giant Ancestry', 'Stone Giant', 'Stone Giant ancestry.'
	UNION ALL SELECT 'Goliath', 'Giant Ancestry', 'Storm Giant', 'Storm Giant ancestry.'
	UNION ALL SELECT 'Tiefling', 'Fiendish Legacy', 'Abyssal', 'Abyssal legacy magic.'
	UNION ALL SELECT 'Tiefling', 'Fiendish Legacy', 'Chthonic', 'Chthonic legacy magic.'
	UNION ALL SELECT 'Tiefling', 'Fiendish Legacy', 'Infernal', 'Infernal legacy magic.'
) options ON options.species_name = s.name AND options.group_name = g.name;
--> statement-breakpoint
INSERT INTO `species_choice_option_to_features` (`choice_group_id`, `choice_option_id`, `feature_id`)
SELECT g.id, o.id, f.id
FROM species_choice_groups g
JOIN species s ON s.id = g.species_id
JOIN species_choice_options o ON o.choice_group_id = g.id
JOIN features f ON f.name = CASE
	WHEN g.name = 'Draconic Ancestry' THEN 'Draconic Ancestry: ' || o.name
	WHEN g.name = 'Elven Lineage' THEN o.name || ' Lineage Magic'
	WHEN g.name = 'Gnomish Lineage' THEN o.name || ' Magic'
	WHEN g.name = 'Giant Ancestry' THEN o.name || ' Ancestry'
	WHEN g.name = 'Fiendish Legacy' THEN o.name || ' Legacy Magic'
END;