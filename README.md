# RPG Engine Extension for SillyTavern

A bare-bones RPG extension that uses the Game Master (GM) character card as the central engine, with lorebooks for game state management and macros for dynamic content injection.

## Features

- **Game State Macros**: `{{gamestate}}`, `{{activequest}}`, `{{userinventory}}`
- **Slash Commands**: `/quest`, `/setquest`, `/item`, `/inventory`
- **Event-Driven**: Automatically updates from chat
- **Settings UI**: Configure quests, inventory, and game state

## Installation

1. Copy the `SillyTavern-RPG-Engine` folder to your SillyTavern `extensions/` directory
2. Enable the extension in SillyTavern settings
3. Reload SillyTavern

## Usage

### Macros

Use these macros in your GM character card prompt:

```
{{gamestate}} - Current game state (location, time, active NPCs)
{{activequest}} - Currently active quest
{{userinventory}} - User inventory items
```

### Slash Commands

- `/quest` - View current quest
- `/setquest [quest]` - Set active quest
- `/item add [item]` - Add item to inventory
- `/item view` - View inventory

### GM Character Card Prompt Template

```
You are the Game Master of an RPG. You control the world, describe scenes, and manage game state.

Game State Macros Available:
- {{gamestate}} - Current game state
- {{activequest}} - Active quest
- {{userinventory}} - User inventory

Slash Commands:
- /setquest [quest] - Set active quest
- /quest - View current quest
- /item add [item] - Add item to inventory
- /item view - View inventory

Response Format:
[STATE]
Location: {location}
Time: {time}
Active NPCs: {npc_list}
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

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Macros resolve correctly (`/macros` command)
- [ ] Slash commands work (`/quest`, `/item`)
- [ ] Settings persist across sessions
- [ ] Lorebooks trigger appropriately
- [ ] GM character prompt works with macros

## License

MIT