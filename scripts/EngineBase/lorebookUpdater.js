/**
 * LorebookUpdater - Applies state changes to lorebooks using WorldInfoCache API
 * @module LorebookUpdater
 */

import { worldInfoCache } from './RPGEngineExports.js';

class LorebookUpdater {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the lorebook updater
     * @returns {Promise<void>}
     */
    async initialize() {
        if (!worldInfoCache) {
            debugWarn('WorldInfoCache not available', 'LorebookUpdater');
        }
        this.initialized = true;
        debugLog('LorebookUpdater initialized', 'LorebookUpdater');
    }

    /**
     * Apply batch of lorebook updates
     * @param {Array} updates - Array of lorebook updates to apply
     * @returns {Promise<Object>} Results of the updates
     */
    async applyLorebookUpdates(updates) {
        if (!this.initialized) {
            debugWarn('LorebookUpdater not initialized', 'LorebookUpdater');
            await this.initialize();
        }

        if (!updates || updates.length === 0) {
            debugLog('No updates to apply', 'LorebookUpdater');
            return { success: true, applied: 0, failed: 0 };
        }

        debugLog(`Applying ${updates.length} lorebook updates`, 'LorebookUpdater');

        const results = {
            success: true,
            applied: 0,
            failed: 0,
            details: []
        };

        for (const update of updates) {
            try {
                await this.applySingleUpdate(update);
                results.applied++;
                debugLog(`Applied update: ${update.category}/${update.subcategory}/${update.name}`, 'LorebookUpdater');
            } catch (error) {
                results.failed++;
                results.details.push({
                    update: update.name,
                    error: error.message
                });
                debugWarn(`Failed to apply update: ${update.name}`, error, 'LorebookUpdater');
            }
        }

        debugLog(`Applied ${results.applied}/${updates.length} lorebook updates`, 'LorebookUpdater');
        return results;
    }

    /**
     * Apply a single lorebook update
     * @param {Object} update - The update to apply
     * @returns {Promise<void>}
     */
    async applySingleUpdate(update) {
        const { category, subcategory, name, content, keywords } = update;

        // Construct the lorebook path
        const lorebookPath = `${category}/${subcategory}`;
        const entryPath = `${lorebookPath}/${name}`;

        debugLog(`Updating lorebook: ${entryPath}`, 'LorebookUpdater');

        // Get or create the lorebook
        let lorebook = this.getLorebook(lorebookPath);
        
        if (!lorebook) {
            debugWarn(`Lorebook not found: ${lorebookPath}`, 'LorebookUpdater');
            // Try to create it
            lorebook = await this.createLorebook(lorebookPath);
        }

        // Update or create the entry
        const entryId = this.findEntryId(lorebook, name);
        
        if (entryId) {
            // Update existing entry
            await this.updateEntry(lorebook, entryId, content, keywords);
        } else {
            // Create new entry
            await this.createEntry(lorebook, name, content, keywords);
        }
    }

    /**
     * Get a lorebook by path
     * @param {string} path - The lorebook path
     * @returns {Object|null} The lorebook or null if not found
     */
    getLorebook(path) {
        if (!worldInfoCache) return null;
        
        try {
            const lorebooks = worldInfoCache.getLorebooks();
            const pathParts = path.split('/');
            
            // Navigate through the path
            let current = lorebooks;
            for (const part of pathParts) {
                if (!current[part]) return null;
                current = current[part];
            }
            
            return current;
        } catch (error) {
            debugWarn(`Error getting lorebook ${path}:`, error, 'LorebookUpdater');
            return null;
        }
    }

    /**
     * Create a new lorebook if it doesn't exist
     * @param {string} path - The lorebook path
     * @returns {Promise<Object|null>} The created lorebook or null
     */
    async createLorebook(path) {
        if (!worldInfoCache) return null;

        try {
            debugLog(`Creating lorebook: ${path}`, 'LorebookUpdater');
            
            // Use SillyTavern's API to create a new lorebook
            const lorebookId = await chrome.runtime.sendMessage({
                action: 'newWorldInfo',
                args: [{
                    name: path.split('/').pop(),
                    folder: path.split('/').slice(0, -1).join('/') || 'root'
                }]
            });

            if (lorebookId) {
                debugLog(`Created lorebook: ${path} (ID: ${lorebookId})`, 'LorebookUpdater');
                return this.getLorebook(path);
            }
            
            return null;
        } catch (error) {
            debugWarn(`Failed to create lorebook ${path}:`, error, 'LorebookUpdater');
            return null;
        }
    }

    /**
     * Find an entry by name in a lorebook
     * @param {Object} lorebook - The lorebook to search
     * @param {string} name - The entry name to find
     * @returns {string|null} The entry ID or null if not found
     */
    findEntryId(lorebook, name) {
        if (!lorebook || !lorebook.entries) return null;

        const entries = lorebook.entries;
        for (const entryId of Object.keys(entries)) {
            const entry = entries[entryId];
            if (entry && entry.name && entry.name.toLowerCase() === name.toLowerCase()) {
                return entryId;
            }
        }
        return null;
    }

    /**
     * Update an existing entry
     * @param {Object} lorebook - The lorebook containing the entry
     * @param {string} entryId - The entry ID to update
     * @param {string} content - The new content
     * @param {Array} keywords - The keywords for the entry
     * @returns {Promise<void>}
     */
    async updateEntry(lorebook, entryId, content, keywords) {
        if (!worldInfoCache) return;

        try {
            debugLog(`Updating entry ${entryId} in ${lorebook.name}`, 'LorebookUpdater');

            // Prepare the entry data
            const entryData = {
                content: content,
                keywords: keywords.join(', '),
                enabled: true
            };

            // Use WorldInfoCache to update the entry
            await worldInfoCache.updateEntry(lorebook.id, entryId, entryData);
            
            debugLog(`Updated entry ${entryId}`, 'LorebookUpdater');
        } catch (error) {
            debugWarn(`Failed to update entry ${entryId}:`, error, 'LorebookUpdater');
            throw error;
        }
    }

    /**
     * Create a new entry in a lorebook
     * @param {Object} lorebook - The lorebook to add the entry to
     * @param {string} name - The entry name
     * @param {string} content - The entry content
     * @param {Array} keywords - The keywords for the entry
     * @returns {Promise<void>}
     */
    async createEntry(lorebook, name, content, keywords) {
        if (!worldInfoCache) return;

        try {
            debugLog(`Creating entry ${name} in ${lorebook.name}`, 'LorebookUpdater');

            // Use WorldInfoCache to create a new entry
            const entryId = await worldInfoCache.createEntry(lorebook.id, {
                name: name,
                content: content,
                keywords: keywords.join(', '),
                enabled: true
            });

            if (entryId) {
                debugLog(`Created entry ${name} (ID: ${entryId})`, 'LorebookUpdater');
            }
        } catch (error) {
            debugWarn(`Failed to create entry ${name}:`, error, 'LorebookUpdater');
            throw error;
        }
    }

    /**
     * Update multiple lorebooks in batch
     * @param {Array} batchUpdates - Array of batch update objects
     * @returns {Promise<Object>} Results of the batch updates
     */
    async batchUpdateLorebooks(batchUpdates) {
        if (!this.initialized) {
            await this.initialize();
        }

        const allResults = {
            success: true,
            totalApplied: 0,
            totalFailed: 0,
            batches: []
        };

        for (const batch of batchUpdates) {
            const result = await this.applyLorebookUpdates(batch.updates);
            allResults.totalApplied += result.applied;
            allResults.totalFailed += result.failed;
            allResults.batches.push({
                category: batch.category,
                result: result
            });
        }

        debugLog(`Batch update complete: ${allResults.totalApplied}/${allResults.totalApplied + allResults.totalFailed} applied`, 'LorebookUpdater');
        return allResults;
    }

    /**
     * Check if updater is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this.initialized;
    }
}

// Export for use in other modules
export { LorebookUpdater };