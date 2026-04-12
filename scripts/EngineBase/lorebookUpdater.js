/**
 * LorebookUpdater - Applies detected state changes to lorebooks using WorldInfoCache API
 * @module LorebookUpdater
 */

import { debugLog, debugWarn, debugError } from './debug.js';
import { extension_settings, getContext } from './RPGEngineExports.js';

class LorebookUpdater {
    constructor() {
        this.initialized = false;
        this.cache = null;
        this.wi = null;
        debugLog('LorebookUpdater instance created', 'LorebookUpdater');
    }

    /**
     * Initialize the lorebook updater
     * @returns {Promise<void>}
     */
    async initialize() {
        debugLog('Initializing LorebookUpdater', 'LorebookUpdater');
        try {
            const { WorldInfoCache, WorldInfo } = getContext();
            this.cache = new WorldInfoCache();
            this.wi = new WorldInfo();
            this.initialized = true;
            debugLog('LorebookUpdater initialized successfully', 'LorebookUpdater');
        } catch (error) {
            debugError('Failed to initialize LorebookUpdater:', error, 'LorebookUpdater');
            throw error;
        }
    }

    /**
     * Apply state changes as lorebook updates
     * @param {Array} stateChanges - Array of state change objects
     * @returns {Promise<Object>} Result of the update operation
     */
    async applyLorebookUpdates(stateChanges) {
        debugLog(`Applying ${stateChanges.length} lorebook updates`, 'LorebookUpdater');
        
        if (!this.initialized) {
            debugWarn('LorebookUpdater not initialized, initializing now', 'LorebookUpdater');
            await this.initialize();
        }

        if (!stateChanges || stateChanges.length === 0) {
            debugLog('No state changes to apply', 'LorebookUpdater');
            return { applied: 0, failed: 0 };
        }

        let applied = 0;
        let failed = 0;

        for (const change of stateChanges) {
            try {
                await this.applySingleUpdate(change);
                applied++;
                debugLog(`Applied update: ${change.category}/${change.subcategory}/${change.name}`, 'LorebookUpdater');
            } catch (error) {
                debugError(`Failed to apply update: ${error}`, 'LorebookUpdater');
                failed++;
            }
        }

        debugLog(`Lorebook update complete: ${applied} applied, ${failed} failed`, 'LorebookUpdater');
        return { applied, failed };
    }

    /**
     * Apply a single lorebook update
     * @param {Object} update - The update object
     * @returns {Promise<void>}
     */
    async applySingleUpdate(update) {
        debugLog(`Applying single update: ${update.category}/${update.subcategory}/${update.name}`, 'LorebookUpdater');
        
        const { category, subcategory, name, content, keywords } = update;

        // Validate required fields
        if (!category || !name || !content) {
            debugError('Invalid update object - missing required fields', 'LorebookUpdater');
            throw new Error('Update object missing required fields');
        }

        // Create entry structure
        const entry = {
            keywords: keywords || [],
            content: content,
            probability: 1.0,
            trigger_above: 0,
            trigger_below: 100,
            group: false,
            group_alias: ''
        };

        // Generate entry path
        const entryPath = this.generateEntryPath(category, subcategory, name);
        debugLog(`Entry path: ${entryPath}`, 'LorebookUpdater');

        // Apply to lorebook cache
        await this.cache.apply(update.category, update.subcategory, name, entry);
        debugLog(`Applied update to cache: ${entryPath}`, 'LorebookUpdater');
    }

    /**
     * Generate entry path from category, subcategory, and name
     * @param {string} category - The category
     * @param {string} subcategory - The subcategory
     * @param {string} name - The name
     * @returns {string} Entry path
     */
    generateEntryPath(category, subcategory, name) {
        const safeName = name.replace(/[^a-z0-9-]/gi, '-');
        return `${category}/${subcategory}/${safeName}`;
    }

    /**
     * Update location entry
     * @param {string} location - The location name
     * @param {string} content - The location description
     * @returns {Promise<void>}
     */
    async updateLocation(location, content) {
        debugLog(`Updating location: ${location}`, 'LorebookUpdater');
        
        const update = {
            category: 'gameState',
            subcategory: 'locations',
            name: location,
            content: content,
            keywords: [location.toLowerCase(), 'location', 'place']
        };

        await this.applySingleUpdate(update);
        debugLog(`Location updated: ${location}`, 'LorebookUpdater');
    }

    /**
     * Update inventory entry
     * @param {string} itemName - The item name
     * @param {string} content - The item description
     * @returns {Promise<void>}
     */
    async updateInventoryItem(itemName, content) {
        debugLog(`Updating inventory item: ${itemName}`, 'LorebookUpdater');
        
        const update = {
            category: 'inventory',
            subcategory: 'items',
            name: itemName,
            content: content,
            keywords: [itemName.toLowerCase(), 'item', 'inventory']
        };

        await this.applySingleUpdate(update);
        debugLog(`Inventory item updated: ${itemName}`, 'LorebookUpdater');
    }

    /**
     * Update NPC entry
     * @param {string} npcName - The NPC name
     * @param {string} content - The NPC description
     * @returns {Promise<void>}
     */
    async updateNpc(npcName, content) {
        debugLog(`Updating NPC: ${npcName}`, 'LorebookUpdater');
        
        const update = {
            category: 'gameState',
            subcategory: 'npcs',
            name: npcName,
            content: content,
            keywords: [npcName.toLowerCase(), 'npc', 'character']
        };

        await this.applySingleUpdate(update);
        debugLog(`NPC updated: ${npcName}`, 'LorebookUpdater');
    }

    /**
     * Update time entry
     * @param {string} time - The time description
     * @param {string} content - The time-related content
     * @returns {Promise<void>}
     */
    async updateTime(time, content) {
        debugLog(`Updating time: ${time}`, 'LorebookUpdater');
        
        const update = {
            category: 'gameState',
            subcategory: 'time',
            name: time,
            content: content,
            keywords: [time.toLowerCase(), 'time', 'hour']
        };

        await this.applySingleUpdate(update);
        debugLog(`Time updated: ${time}`, 'LorebookUpdater');
    }

    /**
     * Remove entry from lorebook
     * @param {string} category - The category
     * @param {string} subcategory - The subcategory
     * @param {string} name - The name
     * @returns {Promise<void>}
     */
    async removeEntry(category, subcategory, name) {
        debugLog(`Removing entry: ${category}/${subcategory}/${name}`, 'LorebookUpdater');
        
        await this.cache.apply(category, subcategory, name, null);
        debugLog(`Entry removed: ${category}/${subcategory}/${name}`, 'LorebookUpdater');
    }

    /**
     * Batch update multiple entries
     * @param {Array} updates - Array of update objects
     * @returns {Promise<Object>} Result object
     */
    async batchUpdate(updates) {
        debugLog(`Batch updating ${updates.length} entries`, 'LorebookUpdater');
        
        const results = {
            successful: [],
            failed: []
        };

        for (const update of updates) {
            try {
                await this.applySingleUpdate(update);
                results.successful.push(update.name);
                debugLog(`Batch update successful: ${update.name}`, 'LorebookUpdater');
            } catch (error) {
                debugError(`Batch update failed: ${error}`, 'LorebookUpdater');
                results.failed.push({ name: update.name, error: error.message });
            }
        }

        debugLog(`Batch update complete: ${results.successful.length} successful, ${results.failed.length} failed`, 'LorebookUpdater');
        return results;
    }

    /**
     * Get current lorebook state for a category
     * @param {string} category - The category
     * @returns {Promise<Object>} Current state
     */
    async getLorebookState(category) {
        debugLog(`Getting lorebook state for category: ${category}`, 'LorebookUpdater');
        
        if (!this.initialized) {
            debugWarn('LorebookUpdater not initialized', 'LorebookUpdater');
            await this.initialize();
        }

        try {
            const state = this.cache.get(category);
            debugLog(`Retrieved state for category: ${category}`, 'LorebookUpdater');
            return state;
        } catch (error) {
            debugError(`Failed to get state for category ${category}:`, error, 'LorebookUpdater');
            return null;
        }
    }

    /**
     * Validate update object
     * @param {Object} update - The update object to validate
     * @returns {boolean} True if valid
     */
    validateUpdate(update) {
        debugLog('Validating update object', 'LorebookUpdater');
        
        if (!update || typeof update !== 'object') {
            debugError('Invalid update object', 'LorebookUpdater');
            return false;
        }

        const required = ['category', 'subcategory', 'name', 'content'];
        const missing = required.filter(field => !update[field]);
        
        if (missing.length > 0) {
            debugError(`Missing required fields: ${missing.join(', ')}`, 'LorebookUpdater');
            return false;
        }

        debugLog('Update object is valid', 'LorebookUpdater');
        return true;
    }

    /**
     * Check if updater is initialized
     * @returns {boolean}
     */
    isInitialized() {
        debugLog(`Initialization status: ${this.initialized}`, 'LorebookUpdater');
        return this.initialized;
    }
}

// Export for use in other modules
export { LorebookUpdater };