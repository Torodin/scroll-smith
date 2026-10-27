INSERT INTO `items` (`name`, `description`, `category`)
SELECT v.name, v.description, v.category FROM (
	SELECT 'Arrow' AS name, 'Ammunition for a bow.' AS description, 'ammunition' AS category
	UNION ALL SELECT 'Book (history)', 'A book of historical lore.', 'gear'
	UNION ALL SELECT 'Book (prayers)', 'A book of prayers and rites.', 'gear'
	UNION ALL SELECT 'Calligrapher''s Supplies', 'Artisan''s tools for fine writing.', 'tool'
	UNION ALL SELECT 'Crowbar', 'A lever for prying things open.', 'gear'
	UNION ALL SELECT 'Dagger', 'A simple melee weapon.', 'weapon'
	UNION ALL SELECT 'Dice Set', 'A gaming set.', 'tool'
	UNION ALL SELECT 'Dragonchess Set', 'A gaming set.', 'tool'
	UNION ALL SELECT 'Healer''s Kit', 'Supplies for stabilizing the wounded.', 'gear'
	UNION ALL SELECT 'Holy Symbol', 'A symbol of a god or pantheon.', 'gear'
	UNION ALL SELECT 'Parchment', 'A sheet of writing material.', 'gear'
	UNION ALL SELECT 'Playing Card Set', 'A gaming set.', 'tool'
	UNION ALL SELECT 'Pouch', 'A small belt pouch.', 'gear'
	UNION ALL SELECT 'Quarterstaff', 'A simple melee weapon.', 'weapon'
	UNION ALL SELECT 'Quiver', 'Holds arrows.', 'gear'
	UNION ALL SELECT 'Robe', 'A traditional robe.', 'gear'
	UNION ALL SELECT 'Shortbow', 'A simple ranged weapon.', 'weapon'
	UNION ALL SELECT 'Spear', 'A simple melee weapon.', 'weapon'
	UNION ALL SELECT 'Thieves'' Tools', 'Tools for picking locks and disarming traps.', 'tool'
	UNION ALL SELECT 'Three-Dragon Ante Set', 'A gaming set.', 'tool'
	UNION ALL SELECT 'Traveler''s Clothes', 'Clothing suited to the road.', 'gear'
) v
WHERE NOT EXISTS (SELECT 1 FROM `items` i WHERE i.`name` = v.name);