# RPG Engine Extension for SillyTavern

A comprehensive RPG extension that uses the Game Master (GM) character card as the central engine, with lorebooks for game state management and macros for dynamic content injection. Now includes a powerful Template Lorebook Builder feature!

## Features

- **Game State Macros**: `{{gamestate}}`, `{{activequest}}`, `{{userinventory}}`, `{{location}}`, `{{gametime}}`, `{{activenpcs}}`
- **Slash Commands**: `/quest`, `/setquest`, `/item`, `/location`, `/time`, `/buildtemplate`, `/exporttemplate`, `/importtemplate`
- **Event-Driven**: Automatically updates from chat
- **Settings UI**: Configure quests, inventory, location, time, and game state via `extension_settings`
- **Template Lorebook Builder**: Automatically generate structured template lorebooks for organizing game data

### Template Lorebook Builder Features

- **Automatic Template Generation**: Create complete lorebook templates with one command
- **Modular Structure**: Organized into categories (questData, gameState, inventory, userState)
- **Export/Import**: Share templates with others or backup your configurations
- **47 Pre-Built Entries**: Includes quest data, locations, NPCs, items, weapons, armor, stats, and more

## Installation

1. Copy the `SillyTavern-RPG-Engine` folder to your SillyTavern `extensions/` directory
2. Enable the extension in SillyTavern settings
3. Reload SillyTavern

## Configuration

The extension uses SillyTavern's built-in `extension_settings` mechanism for persistent storage. Settings are automatically saved when you change values in the settings UI.

### Settings Structure

```javascript
extension_settings.rpg_engine = {
    enabled: true,              // Enable/disable extension
    autoUpdateGameState: true,  // Auto-update from chat
    quest: '',                  // Current quest objective
    gameState: '',              // Additional game notes
    inventory: [],              // Array of inventory items
    location: '',               // Current location
    time: '',                   // Current game time
    activeNPCs: []              // Active NPCs in scene
}
```

## Usage

### Macros

Use these macros in your GM character card prompt:

```
{{gamestate}}  - Full game state (location, time, NPCs, notes)
{{activequest}} - Currently active quest
{{userinventory}} - User inventory items
{{location}} - Current location
{{gametime}} - Current game time
{{activenpcs}} - Active NPCs in scene
```

### Slash Commands

#### RPG Engine Commands
- `/quest` - View current quest
- `/setquest [quest]` - Set active quest
- `/item add [item]` - Add item to inventory
- `/item view` - View inventory
- `/item remove [item]` - Remove item from inventory
- `/location` - View current location
- `/location [place]` - Set location
- `/time` - View current game time
- `/time [time]` - Set game time

#### Template Builder Commands
- `/buildtemplate [name]` - Build a new template lorebook (defaults to "RPG_Template")
- `/exporttemplate [filename]` - Export template to JSON file (defaults to "rpg_template.json")
- `/importtemplate` - Import template from JSON file (opens file dialog)

### Settings UI

Access the settings UI in SillyTavern's extensions panel:

1. **Enable RPG Engine** - Toggle extension on/off
2. **Auto-update game state** - Automatically parse chat for game state updates
3. **Enable Debug Logging** - Enable detailed debug logs (check browser console)
4. **Active Quest** - Textarea for current quest objective
5. **Current Location** - Input for current location
6. **Game Time** - Input for current game time (e.g., "Day 1, 12:00")
7. **Game State Notes** - Additional game state information
8. **User Inventory** - Textarea with one item per line

#### Template Lorebook Builder Section

- **Build Template Lorebook** - Create a new template with the name specified
- **Export Template** - Export the current template to a JSON file
- **Import Template** - Import a template from a JSON file
- **Template Name** - Configure the name for templates (default: "RPG_Template")

All settings are automatically saved via `saveSettingsDebounced()` when changed.

### GM Character Card Prompt Template

```
You are the Game Master of an RPG. You control the world, describe scenes, and manage game state.

Game State Macros Available:
- {{gamestate}} - Full game state
- {{activequest}} - Active quest
- {{userinventory}} - User inventory
- {{location}} - Current location
- {{gametime}} - Current time
- {{activenpcs}} - Active NPCs

Slash Commands:
- /quest - View current quest
- /setquest [quest] - Set active quest
- /item add [item] - Add item to inventory
- /item view - View inventory
- /location - View/set location
- /time - View/set game time

Response Format:
[STATE]
Location: {{location}}
Time: {{gametime}}
Active NPCs: {{activenpcs}}
Quest: {{activequest}}
Inventory: {{userinventory}}
[/STATE]

{Scene description and game events}
```

### Template Lorebook Builder

The Template Lorebook Builder automatically generates structured template lorebooks. Each template includes 47 entries organized into four main categories:

#### Quest Data (3 entries)
- **mainQuestData**: Tracks primary objectives and current quest status
- **sideQuests**: Tracks optional missions and secondary objectives
- **questItems**: Tracks key items and quest rewards

#### Game State (17 entries)
- **locations**: tavern, cave, town
- **majorNPCs**: hero, villain, ally, mentor
- **NPCs**: merchant, guard
- **time**: day, night, hour
- **worldState**: kingdom, empire, war

#### Inventory (12 entries)
- **weapons**: sword, bow, dagger
- **armor**: shield, helmet, plate
- **items**: potion, key, scroll
- **currency**: gold, silver

#### User State (15 entries)
- **outfit**: head, neck, torso, legs, hands, accessories
- **skills**: combat, magic, stealth
- **stats**: strength, intelligence, health
- **statusEffects**: poisoned, buffed, weakened

#### Usage

```bash
/buildtemplate MyAdventure
```

This creates a "MyAdventure" template with all default entries and automatically saves it as "MyAdventure.json".

For detailed information about the Template Lorebook Builder, see [TEMPLATE_LOREBOOK_BUILDER.md](TEMPLATE_LOREBOOK_BUILDER.md).

### Lorebook Structure

Create lorebooks for:

**questData/**
```json
[
  {
    "name": "MainQuest",
    "keywords": ["quest", "mission", "objective"],
    "content": "Current objective: Defeat the dragon in the eastern cave.",
    "selective": true,
    "useSelectives": ["all"]
  }
]
```

**gameState/**
```json
[
  {
    "name": "CurrentLocation",
    "keywords": ["location", "where"],
    "content": "The party is in the tavern, surrounded by wandering adventurers.",
    "selective": false,
    "useSelectives": ["all"]
  }
]
```

## Settings Persistence

The extension uses SillyTavern's `extension_settings` mechanism:

- Settings are stored in `extension_settings.rpg_engine`
- Changes are automatically saved via `saveSettingsDebounced()`
- Settings persist across SillyTavern sessions
- No manual save required

## Testing Checklist

### RPG Engine Features
- [ ] Extension loads without errors
- [ ] Settings UI appears in extensions panel
- [ ] Macros resolve correctly (`/macros` command)
- [ ] Slash commands work (`/quest`, `/item`, `/location`, `/time`)
- [ ] Settings persist across sessions
- [ ] Settings changes auto-save
- [ ] Lorebooks trigger appropriately
- [ ] GM character prompt works with macros

### Template Builder Features
- [ ] `/buildtemplate` creates template with 47 entries
- [ ] `/exporttemplate` saves JSON file
- [ ] `/importtemplate` opens file dialog
- [ ] Settings UI buttons functional
- [ ] Template structure matches documentation
- [ ] Debug logging works when enabled
- [ ] Error handling provides user feedback

## Additional Documentation

- [Template Lorebook Builder Guide](TEMPLATE_LOREBOOK_BUILDER.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

## License

MIT
