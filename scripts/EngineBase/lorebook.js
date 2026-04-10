/**
 * @file RPG Engine - Lorebook Template Builder Module
 * Provides functions to create, manage, and export/import template lorebooks
 * Uses official SillyTavern lorebook API for proper integration
 */

import { debugLog, debugWarn, debugError, isDebugModeEnabled } from './debug.js';
import { 
    createNewWorldInfo, 
    createWorldInfoEntry, 
    saveWorldInfo, 
    worldInfoCache,
    extension_settings 
} from './RPGEngineExports.js';

const MODULE_NAME = 'rpg_engine';

/**
 * Get world info data from SillyTavern's worldInfoCache
 * @param {string} name - Name of the world info
 * @returns {Object|null} The world info data or null if not found
 */
function getWorldInfoData(name) {
    // Try to use imported worldInfoCache first
    if (worldInfoCache) {
        return worldInfoCache.get(name) || null;
    }
    // Fallback to window scope
    if (typeof window !== 'undefined' && window.worldInfoCache) {
        return window.worldInfoCache.get(name) || null;
    }
    return null;
}

/**
 * Creates a new template lorebook with the RPG structure using official SillyTavern API
 * @param {string} name - Name of the lorebook to create
 * @returns {Promise<Object>} The created lorebook structure
 */
export async function createTemplateLorebook(name) {
    debugLog(`Creating template lorebook: ${name}`, 'Lorebook Builder');
    
    try {
        // Call official SillyTavern function to create new world info
        await createNewWorldInfo(name, { interactive: false });
        
        // Get the world info data from cache
        const worldInfoData = getWorldInfoData(name);
        
        if (!worldInfoData) {
            throw new Error('Failed to create world info data structure');
        }

        // Build all template sections and add entries
        const questEntries = buildQuestDataTemplate();
        const gameStateEntries = buildGameStateTemplate();
        const inventoryEntries = buildInventoryTemplate();
        const userStateEntries = buildUserStateTemplate();
        
        // Add all entries to the lorebook
        const allEntries = [...questEntries, ...gameStateEntries, ...inventoryEntries, ...userStateEntries];
        
        allEntries.forEach(entry => {
            const newEntry = createWorldInfoEntry(entry.name, worldInfoData);
            if (newEntry) {
                // Set entry properties after creation
                newEntry.key = entry.keywords;
                newEntry.content = entry.content;
                newEntry.group = entry.group || '';
                newEntry.constant = false;
                newEntry.probability = 100;
                newEntry.weight = 1;
                newEntry.sticky = false;
                newEntry.cooldown = 0;
                newEntry.delay = 0;
                newEntry.match = 'all';
            }
        });

        // Save using official function
        await saveWorldInfo(name, worldInfoData, true);
        
        debugLog(`Template created with ${allEntries.length} entries`, 'Lorebook Builder');
        return worldInfoData;
    } catch (error) {
        debugError(`Failed to create template lorebook: ${error.message}`, 'Lorebook Builder');
        throw error;
    }
}

/**
 * Loads the RPG template from JSON file
 * @returns {Promise<Object>} The template data
 */
export async function loadTemplateFromJSON() {
    debugLog('Loading template from JSON file', 'Lorebook Builder');
    
    try {
        // Use ES modules import for the JSON template
        const templateModule = await import('./templates/rpg-template.json');
        return templateModule.default;
    } catch (error) {
        debugError(`Failed to load template from JSON: ${error.message}`, 'Lorebook Builder');
        throw error;
    }
}

/**
 * Converts template JSON to array of entry structures
 * @param {Object} template - The template JSON object
 * @returns {Array} Array of entry structures
 */
export function convertTemplateToEntries(template) {
    debugLog('Converting template JSON to entries', 'Lorebook Builder');
    
    const entries = [];
    
    // Helper function to process nested template objects
    function processCategory(categoryName, categoryData, parentPath = '') {
        for (const [key, value] of Object.entries(categoryData)) {
            const currentPath = parentPath ? `${parentPath}/${key}` : key;
            
            if (value && typeof value === 'object' && value.keywords && value.content) {
                // This is an entry
                entries.push(generateEntryStructure(
                    currentPath,
                    value.keywords,
                    value.content,
                    value.group || currentPath
                ));
            } else if (value && typeof value === 'object') {
                // This is a nested category, process recursively
                processCategory(key, value, currentPath);
            }
        }
    }
    
    // Process each top-level category
    for (const [categoryName, categoryData] of Object.entries(template)) {
        processCategory(categoryName, categoryData);
    }
    
    debugLog(`Converted template to ${entries.length} entries`, 'Lorebook Builder');
    return entries;
}

/**
 * Builds quest-related lorebook entries from template
 * @returns {Array} Array of quest data entry objects
 */
export async function buildQuestDataTemplate() {
    debugLog('Building quest data template', 'Lorebook Builder');
    
    const template = await loadTemplateFromJSON();
    const questData = template.questData || {};
    const entries = [];

    for (const [key, value] of Object.entries(questData)) {
        entries.push(generateEntryStructure(
            `questData/${key}`,
            value.keywords,
            value.content,
            value.group
        ));
    }

    debugLog(`Built ${entries.length} quest data entries`, 'Lorebook Builder');
    return entries;
}

/**
 * Builds game state lorebook entries (locations, NPCs, time, world state) from template
 * @returns {Array} Array of game state entry objects
 */
export async function buildGameStateTemplate() {
    debugLog('Building game state template', 'Lorebook Builder');
    
    const template = await loadTemplateFromJSON();
    const gameState = template.gameState || {};
    const entries = [];

    // Process all game state entries recursively
    function processEntries(data, basePath) {
        for (const [key, value] of Object.entries(data)) {
            const path = `${basePath}/${key}`;
            if (value.keywords && value.content) {
                entries.push(generateEntryStructure(path, value.keywords, value.content, value.group));
            } else if (typeof value === 'object') {
                processEntries(value, path);
            }
        }
    }

    processEntries(gameState, 'gameState');

    debugLog(`Built ${entries.length} game state entries`, 'Lorebook Builder');
    return entries;
}

/**
 * Builds inventory lorebook entries (weapons, armor, items, currency) from template
 * @returns {Array} Array of inventory entry objects
 */
export async function buildInventoryTemplate() {
    debugLog('Building inventory template', 'Lorebook Builder');
    
    const template = await loadTemplateFromJSON();
    const inventory = template.inventory || {};
    const entries = [];

    // Process all inventory entries recursively
    function processEntries(data, basePath) {
        for (const [key, value] of Object.entries(data)) {
            const path = `${basePath}/${key}`;
            if (value.keywords && value.content) {
                entries.push(generateEntryStructure(path, value.keywords, value.content, value.group));
            } else if (typeof value === 'object') {
                processEntries(value, path);
            }
        }
    }

    processEntries(inventory, 'inventory');

    debugLog(`Built ${entries.length} inventory entries`, 'Lorebook Builder');
    return entries;
}

/**
 * Builds user state lorebook entries (outfit, skills, stats, status effects) from template
 * @returns {Array} Array of user state entry objects
 */
export async function buildUserStateTemplate() {
    debugLog('Building user state template', 'Lorebook Builder');
    
    const template = await loadTemplateFromJSON();
    const userState = template.userState || {};
    const entries = [];

    // Process all user state entries recursively
    function processEntries(data, basePath) {
        for (const [key, value] of Object.entries(data)) {
            const path = `${basePath}/${key}`;
            if (value.keywords && value.content) {
                entries.push(generateEntryStructure(path, value.keywords, value.content, value.group));
            } else if (typeof value === 'object') {
                processEntries(value, path);
            }
        }
    }

    processEntries(userState, 'userState');

    debugLog(`Built ${entries.length} user state entries`, 'Lorebook Builder');
    return entries;
}

/**
 * Generates a single lorebook entry structure
 * @param {string} name - Entry name
 * @param {Array} keywords - Keywords that trigger this entry
 * @param {string} content - The lore content
 * @param {string} group - Group/category for the entry
 * @returns {Object} The entry object
 */
export function generateEntryStructure(name, keywords, content, group = '') {
    return {
        name: name,
        keywords: keywords,
        content: content,
        group: group,
        selective: true,
        useSelectives: ['all']
    };
}

/**
 * Exports the template to JSON format matching SillyTavern's structure
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