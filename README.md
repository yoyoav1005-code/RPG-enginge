# RPG Engine Extension for SillyTavern

A bare-bones RPG extension that uses the Game Master (GM) character card as the central engine, with lorebooks for game state management and macros for dynamic content injection.

## Features

- **Game State Macros**: `{{gamestate}}`, `{{activequest}}`, `{{userinventory}}`, `{{location}}`, `{{gametime}}`, `{{activenpcs}}`
- **Slash Commands**: `/quest`, `/setquest`, `/item`, `/location`, `/time`
- **Event-Driven**: Automatically updates from chat
- **Settings UI**: Configure quests, inventory, location, time, and game state via `extension_settings`

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

- `/quest` - View current quest
- `/setquest [quest]` - Set active quest
- `/item add [item]` - Add item to inventory
- `/item view` - View inventory
- `/item remove [item]` - Remove item from inventory
- `/location` - View current location
- `/location [place]` - Set location
- `/time` - View current game time
- `/time [time]` - Set game time

### Settings UI

Access the settings UI in SillyTavern's extensions panel:

1. **Enable RPG Engine** - Toggle extension on/off
2. **Auto-update game state** - Automatically parse chat for game state updates
3. **Active Quest** - Textarea for current quest objective
4. **Current Location** - Input for current location
5. **Game Time** - Input for current game time (e.g., "Day 1, 12:00")
6. **Game State Notes** - Additional game state information
7. **User Inventory** - Textarea with one item per line

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

- [ ] Extension loads without errors
- [ ] Settings UI appears in extensions panel
- [ ] Macros resolve correctly (`/macros` command)
- [ ] Slash commands work (`/quest`, `/item`, `/location`, `/time`)
- [ ] Settings persist across sessions
- [ ] Settings changes auto-save
- [ ] Lorebooks trigger appropriately
- [ ] GM character prompt works with macros

## License

MIT