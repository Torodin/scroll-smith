INSERT INTO `background_details` (
	`background_id`,
	`ability_scores`,
	`feat`,
	`skill_proficiencies`,
	`tool_proficiency`,
	`equipment`
)
SELECT
	`id`,
	'["Intelligence","Wisdom","Charisma"]',
	'Magic Initiate (Cleric)',
	'["Insight","Religion"]',
	'{"type":"specific","name":"Calligrapher''s Supplies"}',
	'{"package":{"items":[{"item":"Calligrapher''s Supplies","quantity":1},{"item":"Book (prayers)","quantity":1},{"item":"Holy Symbol","quantity":1},{"item":"Parchment","quantity":10},{"item":"Robe","quantity":1}],"gold":8},"alternative":{"amount":50,"currency":"GP"}}'
FROM `backgrounds`
WHERE `name` = 'Acolyte';--> statement-breakpoint
INSERT INTO `background_details` (
	`background_id`,
	`ability_scores`,
	`feat`,
	`skill_proficiencies`,
	`tool_proficiency`,
	`equipment`
)
SELECT
	`id`,
	'["Dexterity","Constitution","Intelligence"]',
	'Alert',
	'["Sleight of Hand","Stealth"]',
	'{"type":"specific","name":"Thieves'' Tools"}',
	'{"package":{"items":[{"item":"Dagger","quantity":2},{"item":"Thieves'' Tools","quantity":1},{"item":"Crowbar","quantity":1},{"item":"Pouch","quantity":2},{"item":"Traveler''s Clothes","quantity":1}],"gold":16},"alternative":{"amount":50,"currency":"GP"}}'
FROM `backgrounds`
WHERE `name` = 'Criminal';--> statement-breakpoint
INSERT INTO `background_details` (
	`background_id`,
	`ability_scores`,
	`feat`,
	`skill_proficiencies`,
	`tool_proficiency`,
	`equipment`
)
SELECT
	`id`,
	'["Constitution","Intelligence","Wisdom"]',
	'Magic Initiate (Wizard)',
	'["Arcana","History"]',
	'{"type":"specific","name":"Calligrapher''s Supplies"}',
	'{"package":{"items":[{"item":"Quarterstaff","quantity":1},{"item":"Calligrapher''s Supplies","quantity":1},{"item":"Book (history)","quantity":1},{"item":"Parchment","quantity":8},{"item":"Robe","quantity":1}],"gold":8},"alternative":{"amount":50,"currency":"GP"}}'
FROM `backgrounds`
WHERE `name` = 'Sage';--> statement-breakpoint
INSERT INTO `background_details` (
	`background_id`,
	`ability_scores`,
	`feat`,
	`skill_proficiencies`,
	`tool_proficiency`,
	`equipment`
)
SELECT
	`id`,
	'["Strength","Dexterity","Constitution"]',
	'Savage Attacker',
	'["Athletics","Intimidation"]',
	'{"type":"choice","category":"Gaming Set"}',
	'{"package":{"items":[{"item":"Spear","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Arrow","quantity":20},{"item":"Gaming Set (same as tool proficiency choice)","quantity":1},{"item":"Healer''s Kit","quantity":1},{"item":"Quiver","quantity":1},{"item":"Traveler''s Clothes","quantity":1}],"gold":14},"alternative":{"amount":50,"currency":"GP"}}'
FROM `backgrounds`
WHERE `name` = 'Soldier';