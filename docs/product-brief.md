# Scroll Smith product brief

## Product

Scroll Smith is a self-hosted web app for managing D&D 5.5e (2024) characters and preparing printable cards for game mechanics such as spells, items, and features. Its core purpose is to make character creation and improvement straightforward and to make useful printables easy to prepare.

## Intended users

The primary audience is Dungeon Masters (DMs), with players as an additional audience. Initially, the app is intended for a local user. Supporting multiple users on a locally hosted instance is a possible later expansion.

## Initial product focus

Prioritize a simple, accessible web experience that guides users through:

- Creating a character.
- Improving a character, including leveling up.
- Exporting basic printables for character mechanics.

Keep the initial experience focused on serving the web app. Exact printable formats and whether an external API is part of the initial release are not yet decided.

## Product principles

- Guide users through character creation and improvement rather than requiring them to know every step in advance.
- Keep character management and printable export simple and accessible.
- Make the common character and preparation workflows easy to complete.

## Longer-term direction

Potential future capabilities include:

- Organizing characters into campaign groups.
- Editing or customizing rules.
- Exporting data to Obsidian and Foundry.
- An API and MCP tooling to support external integrations.
- Multi-user support for a locally hosted instance.

These are future directions, not commitments for the initial release.

## Technical direction

- Frontend: React, Vite, TypeScript, and Tailwind.
- Backend: Hono, Zod, and SQLite.

These are the preferred technologies for project work; this brief does not assert that every part is already implemented.

## Open product questions

- Which printable formats and layouts should be supported first?
- What character data sources and rules-content boundaries should the app use?
- When should an external API be introduced, and which operations should it expose?
- What deployment and backup expectations should local users have?
- What should campaign grouping and the rules editor allow?
- Which Obsidian, Foundry, and MCP workflows are most valuable?
