/**
 * PromptManager - Manages loading and providing system prompts for state detection
 * @module PromptManager
 */

class PromptManager {
    constructor() {
        this.prompts = {
            stateDetection: null,
            lorebookUpdate: null,
            stateExtraction: null
        };
        this.loaded = false;
    }

    /**
     * Load all prompts from the prompts directory
     * @returns {Promise<void>}
     */
    async loadPrompts() {
        try {
            await Promise.all([
                this.loadPrompt('state-detection'),
                this.loadPrompt('lorebook-update'),
                this.loadPrompt('state-extraction')
            ]);
            this.loaded = true;
            debugLog('All prompts loaded successfully', 'PromptManager');
        } catch (error) {
            debugWarn('Failed to load prompts:', error, 'PromptManager');
            throw error;
        }
    }

    /**
     * Load a single prompt file by name
     * @param {string} promptName - The prompt name (e.g., 'state-detection', 'lorebook-update', 'state-extraction')
     * @returns {Promise<string>}
     */
    async loadPrompt(promptName) {
        try {
            // Map prompt names to filenames
            const filename = `${promptName}.md`;
            
            // Map prompt names to storage keys
            let key;
            if (promptName === 'state-detection') {
                key = 'stateDetection';
            } else if (promptName === 'lorebook-update') {
                key = 'lorebookUpdate';
            } else if (promptName === 'state-extraction') {
                key = 'stateExtraction';
            } else {
                throw new Error(`Unknown prompt name: ${promptName}`);
            }
            
            // Use dynamic import for ES module loading
            const response = await fetch(`${chrome.runtime.getURL('/')}SillyTavern-RPG-Engine/prompts/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load prompt ${filename}: ${response.status}`);
            }
            const promptContent = await response.text();
            this.prompts[key] = promptContent.trim();
            debugLog(`Loaded prompt: ${filename}`, 'PromptManager');
            return promptContent;
        } catch (error) {
            debugWarn(`Failed to load prompt ${promptName}:`, error, 'PromptManager');
            throw error;
        }
    }

    /**
     * Get the state detection prompt
     * @returns {string|null}
     */
    getStateDetectionPrompt() {
        if (!this.prompts.stateDetection) {
            debugWarn('State detection prompt not loaded', 'PromptManager');
        }
        return this.prompts.stateDetection;
    }

    /**
     * Get the lorebook update prompt
     * @returns {string|null}
     */
    getLorebookUpdatePrompt() {
        if (!this.prompts.lorebookUpdate) {
            debugWarn('Lorebook update prompt not loaded', 'PromptManager');
        }
        return this.prompts.lorebookUpdate;
    }

    /**
     * Get the state extraction prompt
     * @returns {string|null}
     */
    getStateExtractionPrompt() {
        if (!this.prompts.stateExtraction) {
            debugWarn('State extraction prompt not loaded', 'PromptManager');
        }
        return this.prompts.stateExtraction;
    }

    /**
     * Check if all prompts are loaded
     * @returns {boolean}
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Get all prompts
     * @returns {Object}
     */
    getAllPrompts() {
        return { ...this.prompts };
    }

    /**
     * Refresh all prompts (reload from files)
     * @returns {Promise<void>}
     */
    async refreshPrompts() {
        this.prompts = {
            stateDetection: null,
            lorebookUpdate: null,
            stateExtraction: null
        };
        this.loaded = false;
        await this.loadPrompts();
        debugLog('Prompts refreshed successfully', 'PromptManager');
    }
}

// Export for use in other modules
export { PromptManager };