// RPG Engine Extension - Bare Bones Implementation

import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";
import { debugLog, debugWarn } from "./scripts/debug.js";

const MODULE_NAME = 'rpg_engine';

async function initializeRPGExtension() {
    console.log('[RPG Engine] Starting initialization...');
    
    try {
        const context = SillyTavern.getContext();
        
        // Initialize settings first
        initSettings();
        
        // Register macros for game state
        registerGameMacros();
        
        // Register slash commands
        registerSlashCommands();
        
        // Listen to chat events
        setupChatListeners();
        
        // Create settings UI
        createSettingsUI();
        
        debugLog('Extension loaded successfully', 'RPG Engine');
    } catch (error) {
        console.error('[RPG Engine] Initialization failed:', error);
    }
}

function initSettings() {
    if (!extension_settings[MODULE_NAME]) {
        extension_settings[MODULE_NAME] = {
            enabled: true,
            autoUpdateGameState: true,
            debugMode: false,
            quest: '',
            gameState: '',
            inventory: [],
            location: '',
            time: '',
            activeNPCs: []
        };
    }
    debugLog('Settings initialized', 'RPG Engine');
}

function registerGameMacros() {
    const { registerMacro } = SillyTavern.getContext();
    
    // Game state macros - register as simple string macros
    registerMacro('gamestate', getGameState);
    registerMacro('activequest', getActiveQuest);
    registerMacro('userinventory', getUserInventory);
    registerMacro('location', getLocation);
    registerMacro('gametime', getTime);
    registerMacro('activenpcs', getActiveNPCs);
    
    debugLog('Macros registered', 'RPG Engine');
}

function registerSlashCommands() {
    const { registerSlashCommand } = SillyTavern.getContext();
    
    // /quest - View current quest
    registerSlashCommand('quest', () => {
        const quest = getActiveQuest();
        toastr.info(`Current quest: ${quest}`, 'RPG Engine');
    }, [], 'View current quest', true, true);
    
    // /setquest - Set active quest
    registerSlashCommand('setquest', (...args) => {
        const quest = args.join(' ');
        setQuest(quest);
        toastr.info(`Quest set: ${quest}`, 'RPG Engine');
    }, [], 'Set active quest', true, true);
    
    // /item - Manage inventory
    registerSlashCommand('item', (...args) => {
        const [action, ...items] = args;
        if (action === 'add') {
            addInventoryItem(items.join(' '));
            toastr.info('Item added', 'RPG Engine');
        } else if (action === 'view') {
            const inventory = getUserInventory();
            toastr.info(`Inventory: ${inventory}`, 'RPG Engine');
        } else if (action === 'remove') {
            removeInventoryItem(items.join(' '));
            toastr.info('Item removed', 'RPG Engine');
        }
    }, [], 'Manage inventory (add/view/remove)', true, true);
    
    // /location - View/set location
    registerSlashCommand('location', (...args) => {
        if (args.length > 0) {
            setLocation(args.join(' '));
            toastr.info(`Location set`, 'RPG Engine');
        } else {
            const location = getLocation();
            toastr.info(`Current location: ${location}`, 'RPG Engine');
        }
    }, [], 'View or set location', true, true);
    
    // /time - View/set game time
    registerSlashCommand('time', (...args) => {
        if (args.length > 0) {
            setTime(args.join(' '));
            toastr.info(`Time set`, 'RPG Engine');
        } else {
            const time = getTime();
            toastr.info(`Current time: ${time}`, 'RPG Engine');
        }
    }, [], 'View or set game time', true, true);
    
    debugLog('Slash commands registered', 'RPG Engine');
}

function setupChatListeners() {
    const context = SillyTavern.getContext();
    const { eventSource, event_types } = context;
    
    // Listen for chat messages to update game state
    eventSource.on(event_types.CHAT_CHANGED, () => {
        if (extension_settings[MODULE_NAME]?.autoUpdateGameState) {
            updateGameStateFromChat();
        }
    });
    
    debugLog('Chat listeners setup', 'RPG Engine');
}

function createSettingsUI() {
    debugLog('Creating settings UI...', 'RPG Engine');
    
    const settingsHtml = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>RPG Engine Settings</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="flex-container">
                    <label for="rpg-debug-mode">Enable Debug Logging</label>
                    <input type="checkbox" id="rpg-debug-mode" ${extension_settings[MODULE_NAME]?.debugMode ? 'checked' : ''}>
                </div>
                <div class="flex-container">
                    <label for="rpg-enabled">Enable RPG Engine</label>
                    <input type="checkbox" id="rpg-enabled" ${extension_settings[MODULE_NAME]?.enabled ? 'checked' : ''}>
                </div>
                <div class="flex-container">
                    <label for="rpg-auto-update">Auto-update game state from chat</label>
                    <input type="checkbox" id="rpg-auto-update" ${extension_settings[MODULE_NAME]?.autoUpdateGameState ? 'checked' : ''}>
                </div>
                <div class="flex-container">
                    <label for="rpg-quest">Active Quest</label>
                    <textarea id="rpg-quest" rows="3" placeholder="Enter the current quest objective...">${extension_settings[MODULE_NAME]?.quest || ''}</textarea>
                </div>
                <div class="flex-container">
                    <label for="rpg-location">Current Location</label>
                    <input type="text" id="rpg-location" placeholder="Enter current location" value="${extension_settings[MODULE_NAME]?.location || ''}">
                </div>
                <div class="flex-container">
                    <label for="rpg-time">Game Time</label>
                    <input type="text" id="rpg-time" placeholder="Enter game time (e.g., Day 1, 12:00)" value="${extension_settings[MODULE_NAME]?.time || ''}">
                </div>
                <div class="flex-container">
                    <label for="rpg-gamestate">Game State Notes</label>
                    <textarea id="rpg-gamestate" rows="4" placeholder="Additional game state information...">${extension_settings[MODULE_NAME]?.gameState || ''}</textarea>
                </div>
                <div class="flex-container">
                    <label for="rpg-inventory">User Inventory (one item per line)</label>
                    <textarea id="rpg-inventory" rows="5" placeholder="Enter inventory items, one per line...">${(extension_settings[MODULE_NAME]?.inventory || []).join('\n')}</textarea>
                </div>
            </div>
        </div>
    `;
    
    $("#extensions_settings").append(settingsHtml);
    
    debugLog('Settings HTML appended to page', 'RPG Engine');
    
    // Event listeners for settings
    $("#rpg-debug-mode").on("change", function() {
        extension_settings[MODULE_NAME].debugMode = $(this).prop('checked');
        saveSettingsDebounced();
        debugLog('Debug mode setting changed to ' + $(this).prop('checked'), 'RPG Engine');
    });
    
    $("#rpg-enabled").on("change", function() {
        extension_settings[MODULE_NAME].enabled = $(this).prop('checked');
        saveSettingsDebounced();
        debugLog('Enabled setting changed', 'RPG Engine');
    });
    
    $("#rpg-auto-update").on("change", function() {
        extension_settings[MODULE_NAME].autoUpdateGameState = $(this).prop('checked');
        saveSettingsDebounced();
        debugLog('Auto-update setting changed', 'RPG Engine');
    });
    
    $("#rpg-quest").on("change", function() {
        extension_settings[MODULE_NAME].quest = $(this).val();
        saveSettingsDebounced();
        debugLog('Quest setting changed', 'RPG Engine');
    });
    
    $("#rpg-location").on("change", function() {
        extension_settings[MODULE_NAME].location = $(this).val();
        saveSettingsDebounced();
        debugLog('Location setting changed', 'RPG Engine');
    });
    
    $("#rpg-time").on("change", function() {
        extension_settings[MODULE_NAME].time = $(this).val();
        saveSettingsDebounced();
        debugLog('Time setting changed', 'RPG Engine');
    });
    
    $("#rpg-gamestate").on("change", function() {
        extension_settings[MODULE_NAME].gameState = $(this).val();
        saveSettingsDebounced();
        debugLog('Game state setting changed', 'RPG Engine');
    });
    
    $("#rpg-inventory").on("change", function() {
        extension_settings[MODULE_NAME].inventory = $(this).val().split('\n').filter(line => line.trim());
        saveSettingsDebounced();
        debugLog('Inventory setting changed', 'RPG Engine');
    });
    
    debugLog('Settings UI created successfully', 'RPG Engine');
}

// Game State Management Functions
function getGameState() {
    const settings = extension_settings[MODULE_NAME] || {};
    return `Location: ${settings.location || 'Unknown'}\nTime: ${settings.time || 'Unknown'}\nActive NPCs: ${(settings.activeNPCs || []).join(', ')}\nNotes: ${settings.gameState || ''}`;
}

function setGameState(state) {
    extension_settings[MODULE_NAME].gameState = state;
    saveSettingsDebounced();
}

function getActiveQuest() {
    return extension_settings[MODULE_NAME]?.quest || 'No active quest';
}

function setQuest(quest) {
    extension_settings[MODULE_NAME].quest = quest;
    saveSettingsDebounced();
}

function getUserInventory() {
    return (extension_settings[MODULE_NAME]?.inventory || []).join(', ') || 'Empty';
}

function addInventoryItem(item) {
    if (!extension_settings[MODULE_NAME].inventory) {
        extension_settings[MODULE_NAME].inventory = [];
    }
    extension_settings[MODULE_NAME].inventory.push(item);
    saveSettingsDebounced();
}

function removeInventoryItem(item) {
    if (extension_settings[MODULE_NAME].inventory) {
        extension_settings[MODULE_NAME].inventory = extension_settings[MODULE_NAME].inventory.filter(i => i !== item);
        saveSettingsDebounced();
    }
}

function getLocation() {
    return extension_settings[MODULE_NAME]?.location || 'Unknown location';
}

function setLocation(location) {
    extension_settings[MODULE_NAME].location = location;
    saveSettingsDebounced();
}

function getTime() {
    return extension_settings[MODULE_NAME]?.time || 'Unknown time';
}

function setTime(time) {
    extension_settings[MODULE_NAME].time = time;
    saveSettingsDebounced();
}

function getActiveNPCs() {
    return (extension_settings[MODULE_NAME]?.activeNPCs || []).join(', ') || 'No active NPCs';
}

function updateGameStateFromChat() {
    // Parse chat to update game state
    // This is where you'd implement logic to track location, NPCs, etc.
}

// Initialize with async wrapper
$(async () => {
    await initializeRPGExtension();
});