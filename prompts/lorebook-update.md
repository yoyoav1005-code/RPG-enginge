# Lorebook Update Prompt

## Purpose
This prompt instructs the AI to generate lorebook updates based on detected game state changes in chat messages.

## Command Format
Output commands as plain text, NOT as JSON. Use this format:

```
lorebook-update_category_name|content|keywords
```

## Available Categories
- `inventory` - Items in player inventory
- `gameState` - Game state information (locations, time, etc.)
- `quest` - Quest information
- `npcs` - Non-player characters
- `items` - Individual item entries
- `locations` - Places and locations
- `equipment` - Equipment and gear

## Rules
1. Only generate updates for NEW or CHANGED information
2. Content should be descriptive and contextual (2-3 sentences)
3. Keywords should be comma-separated and relevant for search
4. Do NOT output JSON arrays or any other format
5. Output `[none]` if no changes detected

## Examples

### Inventory Item
```
lorebook-update_inventory_items_Rusty Sword|A rusty sword found in the dark cave. The blade is chipped but still sharp. It feels heavy in your hand.|rusty sword, sword, weapon, item, inventory, cave find
```

### Location
```
lorebook-update_gameState_locations_Dark Cave|A dark and damp cave entrance. Water drips from the ceiling and the air is cold. The path ahead is unclear.|dark cave, cave, location, entrance, dark, damp, water
```

### NPC
```
lorebook-update_gameState_npcs_Blacksmith|A skilled blacksmith who makes weapons and armor. He has a strong build and calloused hands from years of work. His forge is always hot.|blacksmith, npc, character, smith, weapons, armor, forge
```

### Equipment
```
lorebook-update_equipment_gear_Leather Boots|Worn leather boots that provide basic protection. They're comfortable but show signs of age.|leather boots, boots, footwear, equipment, gear, worn
```

## Full Prompt Template
```
Analyze the recent messages and detect any changes to the game state. Generate lorebook updates for detected changes.

IMPORTANT: Output commands as plain text, NOT as JSON. Use this format:
lorebook-update_category_name|content|keywords

Available categories: inventory, gameState, quest, npcs, items, locations, equipment

Rules:
1. Only generate updates for NEW or CHANGED information
2. Content should be descriptive and contextual
3. Keywords should be comma-separated and relevant
4. Do NOT output JSON arrays or any other format

Examples:
- lorebook-update_inventory_items_Rusty Sword|A rusty sword found in the dark cave. The blade is chipped but still sharp.|rusty sword, sword, weapon, item, inventory
- lorebook-update_gameState_locations_Dark Cave|A dark and damp cave entrance. Water drips from the ceiling and the air is cold.|dark cave, cave, location, entrance, dark
- lorebook-update_gameState_npcs_Blacksmith|A skilled blacksmith who makes weapons and armor. He has a strong build and calloused hands.|blacksmith, npc, character, smith, weapons

Current game state will be provided below. Only update entries that have changed or are new.

Output [none] if no changes detected.
```

## Integration Notes
- This prompt is used by AutoLorebookDetectionSystem for AI-powered lorebook updates
- The system injects current game state before the prompt
- Recent chat messages are appended after the prompt
- AI output is parsed using regex pattern: `/lorebook-update_(\w+)_([^|]+)\|([^|]+)\|(.+)/g`