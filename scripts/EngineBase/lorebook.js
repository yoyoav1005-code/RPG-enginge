/**
 * @file RPG Engine - Lorebook Template Builder Module
 * Provides functions to create, manage, and export/import template lorebooks
 */

import { debugLog, debugWarn, debugError, isDebugModeEnabled } from './debug.js';
import { extension_settings } from './RPGEngineExports.js';

const MODULE_NAME = 'rpg_engine';

/**
 * Creates a new template lorebook with the RPG structure
 * @param {string} name - Name of the lorebook to create
 * @returns {Promise<Object>} The created lorebook structure
 */
export async function createTemplateLorebook(name) {
    debugLog(`Creating template lorebook: ${name}`, 'Lorebook Builder');
    
    try {
        const lorebook = {
            name: name,
            entries: []
        };

        // Build all template sections
        lorebook.entries.push(...buildQuestDataTemplate());
        lorebook.entries.push(...buildGameStateTemplate());
        lorebook.entries.push(...buildInventoryTemplate());
        lorebook.entries.push(...buildUserStateTemplate());

        debugLog(`Template created with ${lorebook.entries.length} entries`, 'Lorebook Builder');
        return lorebook;
    } catch (error) {
        debugError(`Failed to create template lorebook: ${error.message}`, 'Lorebook Builder');
        throw error;
    }
}

/**
 * Builds quest-related lorebook entries
 * @returns {Array} Array of quest data entries
 */
export function buildQuestDataTemplate() {
    debugLog('Building quest data template', 'Lorebook Builder');
    
    const entries = [];

    // Main Quest Data
    entries.push(generateEntryStructure(
        'questData/mainQuestData',
        ['main quest', 'primary objective', 'current quest', 'mission'],
        'Main quest data entry. This tracks the primary objective and current quest status.'
    ));

    // Side Quests
    entries.push(generateEntryStructure(
        'questData/sideQuests',
        ['side quest', 'optional mission', 'secondary objective', 'bonus quest'],
        'Side quest data entry. Tracks optional missions and secondary objectives.'
    ));

    // Quest Items
    entries.push(generateEntryStructure(
        'questData/questItems',
        ['key item', 'quest reward', 'important item', 'quest item'],
        'Quest items entry. Tracks key items and quest rewards.'
    ));

    debugLog(`Built ${entries.length} quest data entries`, 'Lorebook Builder');
    return entries;
}

/**
 * Builds game state lorebook entries (locations, NPCs, time, world state)
 * @returns {Array} Array of game state entries
 */
export function buildGameStateTemplate() {
    debugLog('Building game state template', 'Lorebook Builder');
    
    const entries = [];

    // Locations
    entries.push(generateEntryStructure(
        'gameState/locations/tavern',
        ['tavern', 'inn', 'pub', 'bar'],
        'Tavern location entry. A common gathering place for adventurers.'
    ));
    
    entries.push(generateEntryStructure(
        'gameState/locations/cave',
        ['cave', 'dungeon', 'underground', 'tunnel'],
        'Cave location entry. Dark and mysterious underground passages.'
    ));
    
    entries.push(generateEntryStructure(
        'gameState/locations/town',
        ['town', 'city', 'village', 'settlement'],
        'Town location entry. A bustling center of commerce and culture.'
    ));

    // Major NPCs
    entries.push(generateEntryStructure(
        'gameState/majorNPCs/hero',
        ['hero', 'protagonist', 'chosen one', 'hero'],
        'Hero NPC entry. The main protagonist of the story.'
    ));
    
    entries.push(generateEntryStructure(
        'gameState/majorNPCs/villain',
        ['villain', 'antagonist', 'evil', 'dark lord'],
        'Villain NPC entry. The main antagonist opposing the hero.'
    ));
    
    entries.push(generateEntryStructure(
        'gameState/majorNPCs/ally',
        ['ally', 'friend', 'companion', 'support'],
        'Ally NPC entry. A helpful companion aiding the hero.'
    ));
    
    entries.push(generateEntryStructure(
        'gameState/majorNPCs/mentor',
        ['mentor', 'teacher', 'guide', 'wise old man'],
        'Mentor NPC entry. A wise figure providing guidance and training.'
    ));

    // General NPCs
    entries.push(generateEntryStructure(
        'gameState/NPCs/merchant',
        ['merchant', 'shopkeeper', 'vendor', 'seller'],
        'Merchant NPC entry. Sells various goods and items.'
    ));
    
    entries.push(generateEntryStructure(
        'gameState/NPCs/guard',
        ['guard', 'soldier', 'patrol', 'security'],
        'Guard NPC entry. Provides security and protection.'
    ));

    // Time
    entries.push(generateEntryStructure(
        'gameState/time/day',
        ['day', 'morning', 'afternoon', 'noon'],
        'Day time entry. The bright hours of daylight.'
    ));
    
    entries.push(generateEntryStructure(
        'gameState/time/night',
        ['night', 'evening', 'dark', 'moonlight'],
        'Night time entry. The dark hours under the moon.'
    ));
    
    entries.push(generateEntryStructure(
        'gameState/time/hour',
        ['hour', 'time', 'moment', 'instant'],
        'Hour time entry. Specific time tracking.'
    ));

    // World State
    entries.push(generateEntryStructure(
        'gameState/worldState/kingdom',
        ['kingdom', 'realm', 'nation', 'country'],
        'Kingdom world state entry. The current state of the kingdom.'
    ));
    
    entries.push(generateEntryStructure(
        'gameState/worldState/empire',
        ['empire', 'imperial', 'dynasty', 'throne'],
        'Empire world state entry. The current state of the empire.'
    ));
    
    entries.push(generateEntryStructure(
        'gameState/worldState/war',
        ['war', 'conflict', 'battle', 'fighting'],
        'War world state entry. Current conflicts and battles.'
    ));

    debugLog(`Built ${entries.length} game state entries`, 'Lorebook Builder');
    return entries;
}

/**
 * Builds inventory lorebook entries (weapons, armor, items, currency)
 * @returns {Array} Array of inventory entries
 */
export function buildInventoryTemplate() {
    debugLog('Building inventory template', 'Lorebook Builder');
    
    const entries = [];

    // Weapons
    entries.push(generateEntryStructure(
        'inventory/weapons/sword',
        ['sword', 'blade', 'steel', 'weapon'],
        'Sword weapon entry. A versatile melee weapon.'
    ));
    
    entries.push(generateEntryStructure(
        'inventory/weapons/bow',
        ['bow', 'arrow', 'ranged', 'quiver'],
        'Bow weapon entry. A ranged weapon for distance attacks.'
    ));
    
    entries.push(generateEntryStructure(
        'inventory/weapons/dagger',
        ['dagger', 'knife', 'blade', 'stabbing'],
        'Dagger weapon entry. A small, quick weapon.'
    ));

    // Armor
    entries.push(generateEntryStructure(
        'inventory/armor/shield',
        ['shield', 'defense', 'block', 'protection'],
        'Shield armor entry. Provides defensive protection.'
    ));
    
    entries.push(generateEntryStructure(
        'inventory/armor/helmet',
        ['helmet', 'head', 'cap', 'helm'],
        'Helmet armor entry. Protects the head.'
    ));
    
    entries.push(generateEntryStructure(
        'inventory/armor/plate',
        ['plate', 'armor', 'mail', 'protection'],
        'Plate armor entry. Heavy protective armor.'
    ));

    // Items
    entries.push(generateEntryStructure(
        'inventory/items/potion',
        ['potion', 'drink', 'healing', 'elixir'],
        'Potion item entry. A consumable magical item.'
    ));
    
    entries.push(generateEntryStructure(
        'inventory/items/key',
        ['key', 'lock', 'unlock', 'open'],
        'Key item entry. Used to unlock doors and containers.'
    ));
    
    entries.push(generateEntryStructure(
        'inventory/items/scroll',
        ['scroll', 'paper', 'spell', 'document'],
        'Scroll item entry. Contains magical or written information.'
    ));

    // Currency
    entries.push(generateEntryStructure(
        'inventory/currency/gold',
        ['gold', 'coin', 'money', 'wealth'],
        'Gold currency entry. The primary form of currency.'
    ));
    
    entries.push(generateEntryStructure(
        'inventory/currency/silver',
        ['silver', 'shilling', 'change', 'small money'],
        'Silver currency entry. Smaller denomination currency.'
    ));

    debugLog(`Built ${entries.length} inventory entries`, 'Lorebook Builder');
    return entries;
}

/**
 * Builds user state lorebook entries (outfit, skills, stats, status effects)
 * @returns {Array} Array of user state entries
 */
export function buildUserStateTemplate() {
    debugLog('Building user state template', 'Lorebook Builder');
    
    const entries = [];

    // Outfit
    entries.push(generateEntryStructure(
        'userState/outfit/head',
        ['hat', 'helmet', 'crown', 'headgear'],
        'Head outfit entry. Items worn on the head.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/outfit/neck',
        ['necklace', 'amulet', 'choker', 'collar'],
        'Neck outfit entry. Items worn around the neck.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/outfit/torso',
        ['shirt', 'armor', 'robe', 'chest'],
        'Torso outfit entry. Items worn on the torso.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/outfit/legs',
        ['pants', 'boots', 'greaves', 'legwear'],
        'Legs outfit entry. Items worn on the legs.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/outfit/hands',
        ['gloves', 'bracers', 'wristbands', 'handwear'],
        'Hands outfit entry. Items worn on the hands.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/outfit/accessories',
        ['ring', 'bracelet', 'jewelry', 'ornament'],
        'Accessories outfit entry. Additional decorative items.'
    ));

    // Skills
    entries.push(generateEntryStructure(
        'userState/skills/combat',
        ['combat', 'fight', 'battle', 'warfare'],
        'Combat skill entry. Abilities related to fighting.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/skills/magic',
        ['magic', 'spell', 'sorcery', 'mana'],
        'Magic skill entry. Abilities related to spellcasting.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/skills/stealth',
        ['stealth', 'sneak', 'hide', 'stealth'],
        'Stealth skill entry. Abilities related to avoiding detection.'
    ));

    // Stats
    entries.push(generateEntryStructure(
        'userState/stats/strength',
        ['strength', 'power', 'muscle', 'force'],
        'Strength stat entry. Physical power and might.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/stats/intelligence',
        ['intelligence', 'wisdom', 'mind', 'brain'],
        'Intelligence stat entry. Mental acuity and knowledge.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/stats/health',
        ['health', 'hp', 'vitality', 'life'],
        'Health stat entry. Life force and vitality.'
    ));

    // Status Effects
    entries.push(generateEntryStructure(
        'userState/statusEffects/poisoned',
        ['poisoned', 'venom', 'toxin', 'corrupted'],
        'Poisoned status effect. Affected by poison.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/statusEffects/buffed',
        ['buffed', 'enhanced', 'boosted', 'strengthened'],
        'Buffed status effect. Temporarily enhanced abilities.'
    ));
    
    entries.push(generateEntryStructure(
        'userState/statusEffects/weakened',
        ['weakened', 'debuffed', 'diminished', 'reduced'],
        'Weakened status effect. Temporarily reduced abilities.'
    ));

    debugLog(`Built ${entries.length} user state entries`, 'Lorebook Builder');
    return entries;
}

/**
 * Generates a single lorebook entry structure
 * @param {string} name - Entry name
 * @param {Array} keywords - Keywords that trigger this entry
 * @param {string} content - The lore content
 * @returns {Object} The entry object
 */
export function generateEntryStructure(name, keywords, content) {
    return {
        name: name,
        keywords: keywords,
        content: content,
        selective: true,
        useSelectives: ['all']
    };
}

/**
 * Exports the template to JSON format
 * @param {Object} template - The template to export
 * @returns {string} JSON string
 */
export function exportTemplateToJSON(template) {
    debugLog('Exporting template to JSON', 'Lorebook Builder');
    try {
        return JSON.stringify(template, null, 2);
    } catch (error) {
        debugError(`Failed to export template: ${error.message}`, 'Lorebook Builder');
        throw error;
    }
}

/**
 * Imports a template from JSON format
 * @param {string} jsonString - JSON string to import
 * @returns {Object} The imported template
 */
export function importTemplateFromJSON(jsonString) {
    debugLog('Importing template from JSON', 'Lorebook Builder');
    try {
        const template = JSON.parse(jsonString);
        if (!template.name || !template.entries) {
            throw new Error('Invalid template structure');
        }
        return template;
    } catch (error) {
        debugError(`Failed to import template: ${error.message}`, 'Lorebook Builder');
        throw error;
    }
}

/**
 * Saves the lorebook template to file system
 * @param {Object} template - The template to save
 * @param {string} filename - The filename to save as
 */
export async function saveTemplateToFile(template, filename) {
    debugLog(`Saving template to file: ${filename}`, 'Lorebook Builder');
    
    try {
        const jsonContent = exportTemplateToJSON(template);
        
        // Create a Blob and trigger download
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
        debugLog(`Template saved successfully`, 'Lorebook Builder');
    } catch (error) {
        debugError(`Failed to save template: ${error.message}`, 'Lorebook Builder');
        throw error;
    }
}

/**
 * Loads a template from a file
 * @param {File} file - The file to load
 * @returns {Promise<Object>} The loaded template
 */
export function loadTemplateFromFile(file) {
    debugLog(`Loading template from file: ${file.name}`, 'Lorebook Builder');
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const template = importTemplateFromJSON(e.target.result);
                resolve(template);
            } catch (error) {
                debugError(`Failed to load template: ${error.message}`, 'Lorebook Builder');
                reject(error);
            }
        };
        reader.onerror = () => {
            debugError('Failed to read file', 'Lorebook Builder');
            reject(new Error('File read error'));
        };
        reader.readAsText(file);
    });
}