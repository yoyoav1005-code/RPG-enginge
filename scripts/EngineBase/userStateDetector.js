/**
 * UserStateDetector - Extracts and analyzes user state changes from chat messages
 * @module UserStateDetector
 */

import { PromptManager } from './promptManager.js';

class UserStateDetector {
    constructor() {
        this.promptManager = new PromptManager();
        this.initialized = false;
    }

    /**
     * Initialize the state detector by loading prompts
     * @returns {Promise<void>}
     */
    async initialize() {
        await this.promptManager.loadPrompts();
        this.initialized = true;
        debugLog('UserStateDetector initialized', 'UserStateDetector');
    }

    /**
     * Extract state information from a chat message using prompt-guided analysis
     * @param {string} message - The chat message to analyze
     * @returns {Promise<Object>} Extracted state information
     */
    async extractStateFromMessage(message) {
        if (!this.initialized) {
            debugWarn('UserStateDetector not initialized', 'UserStateDetector');
            await this.initialize();
        }

        const prompt = this.promptManager.getStateDetectionPrompt();
        const extractionPrompt = this.promptManager.getStateExtractionPrompt();

        if (!prompt || !extractionPrompt) {
            debugWarn('Prompts not available for state extraction', 'UserStateDetector');
            return this.extractStateBasic(message);
        }

        // Combine prompts for comprehensive analysis
        const analysisPrompt = `${prompt}\n\n${extractionPrompt}\n\nMessage to analyze: ${message}`;
        
        debugLog(`Analyzing message: ${message.substring(0, 100)}...`, 'UserStateDetector');
        
        const extractedState = this.performStateExtraction(message, analysisPrompt);
        debugLog(`Extracted state: ${JSON.stringify(extractedState)}`, 'UserStateDetector');
        
        return extractedState;
    }

    /**
     * Perform the actual state extraction using pattern matching
     * @param {string} message - The message to analyze
     * @param {string} prompt - The analysis prompt
     * @returns {Object} Extracted state
     */
    performStateExtraction(message, prompt) {
        const lowerMessage = message.toLowerCase();
        const extractedState = {
            inventory: { added: [], removed: [] },
            location: null,
            time: null,
            npcs: { added: [], removed: [] },
            statusEffects: { added: [], removed: [] },
            equipment: { changed: [] }
        };

        // Inventory patterns
        const inventoryPatterns = [
            { regex: /\b(found|got|received|loot[ed]?|purchas[ed]?|got|obtained)\b.*?\b(a|an|the)?\s*(\w+(?:\s+\w+)*)\b/i, action: 'added' },
            { regex: /\b(lost|dropped|used|consumed|broke|destroyed)\b.*?\b(a|an|the)?\s*(\w+(?:\s+\w+)*)\b/i, action: 'removed' }
        ];

        inventoryPatterns.forEach(pattern => {
            const match = lowerMessage.match(pattern.regex);
            if (match) {
                const itemName = this.extractItemName(match[0]);
                extractedState.inventory[pattern.action].push({
                    item: itemName,
                    confidence: 0.85
                });
            }
        });

        // Location patterns
        const locationPatterns = [
            /\b(in|at|to|enter[s]?|arrive[s]?|reach[es]?)\s+(the\s+)?(\w+(?:\s+\w+)*)\b/i,
            /\b(current\s+location[:\s]+)?(\w+(?:\s+\w+)*)\b/i,
            /\b(\w+(?:\s+\w+)*)\s+(appears|shows\s+up|comes\s+into\s+view)\b/i
        ];

        for (const pattern of locationPatterns) {
            const match = lowerMessage.match(pattern);
            if (match) {
                const location = this.extractLocationName(match[0]);
                if (location && !this.isCommonWord(location)) {
                    extractedState.location = { value: location, confidence: 0.8 };
                    break;
                }
            }
        }

        // Time patterns
        const timePatterns = [
            { regex: /\b(it\s+is\s+)?(morning|afternoon|evening|night|dawn|dusk)\b/i, type: 'period' },
            { regex: /\b(\d+)\s*(hours?|minutes?)\s*(pass[es]?)?\b/i, type: 'progression' },
            { regex: /\b(the\s+)?(sun\s+)?(rise[s]?|set[s]?)\b/i, type: 'period' }
        ];

        for (const pattern of timePatterns) {
            const match = lowerMessage.match(pattern.regex);
            if (match) {
                extractedState.time = { 
                    value: match[1]?.toLowerCase() || match[2]?.toLowerCase(), 
                    confidence: 0.75 
                };
                break;
            }
        }

        // NPC patterns
        const npcPatterns = [
            { regex: /\b(meet[s]?|see[s]?|encounter[s]?|talk\s+to|approach[es]?)\s+(the\s+)?(\w+(?:\s+\w+)*)\b/i, action: 'added' },
            { regex: /\b(\w+(?:\s+\w+)*)\s+(leave[s]?|depart[s]?|go\s+away|disappear[s]?)\b/i, action: 'removed' }
        ];

        npcPatterns.forEach(pattern => {
            const match = lowerMessage.match(pattern.regex);
            if (match) {
                const npcName = this.extractNpcName(match[0]);
                if (npcName && !this.isCommonWord(npcName)) {
                    extractedState.npcs[pattern.action].push({
                        name: npcName,
                        confidence: 0.8
                    });
                }
            }
        });

        // Status effect patterns
        const statusPatterns = [
            { regex: /\b(poisoned|buffed|debuffed|blessed|cursed|healed|strengthened|weakened)\b/i, action: 'added' },
            { regex: /\b(cured|cleansed|removed)\s+(the\s+)?(poison|buff|debuff|effect)\b/i, action: 'removed' }
        ];

        statusPatterns.forEach(pattern => {
            const match = lowerMessage.match(pattern.regex);
            if (match) {
                const effectName = this.extractEffectName(match[0]);
                extractedState.statusEffects[pattern.action].push({
                    effect: effectName,
                    confidence: 0.85
                });
            }
        });

        // Equipment patterns
        const equipmentPatterns = [
            { regex: /\b(equip[s]?|wear[s]?|put\s+on)\s+(the\s+)?(\w+(?:\s+\w+)*)\b/i, action: 'equipped' },
            { regex: /\b(unequip[s]?|remove[s]?|take\s+off)\s+(the\s+)?(\w+(?:\s+\w+)*)\b/i, action: 'unequipped' }
        ];

        equipmentPatterns.forEach(pattern => {
            const match = lowerMessage.match(pattern.regex);
            if (match) {
                const equipmentName = this.extractEquipmentName(match[0]);
                extractedState.equipment.changed.push({
                    item: equipmentName,
                    action: pattern.action,
                    confidence: 0.9
                });
            }
        });

        return extractedState;
    }

    /**
     * Basic state extraction without prompts (fallback)
     * @param {string} message - The message to analyze
     * @returns {Object} Basic extracted state
     */
    extractStateBasic(message) {
        return {
            inventory: { added: [], removed: [] },
            location: null,
            time: null,
            npcs: { added: [], removed: [] },
            statusEffects: { added: [], removed: [] },
            equipment: { changed: [] }
        };
    }

    /**
     * Helper: Extract item name from matched text
     * @param {string} matchedText - The matched text
     * @returns {string} Extracted item name
     */
    extractItemName(matchedText) {
        const words = matchedText.split(' ');
        // Remove common verbs and articles
        const filterWords = ['found', 'got', 'received', 'looted', 'the', 'a', 'an'];
        const itemName = words.filter(word => !filterWords.includes(word.toLowerCase()));
        return itemName.join(' ').trim();
    }

    /**
     * Helper: Extract location name from matched text
     * @param {string} matchedText - The matched text
     * @returns {string} Extracted location name
     */
    extractLocationName(matchedText) {
        const words = matchedText.split(' ');
        const filterWords = ['in', 'at', 'to', 'the', 'enter', 'arrive', 'reach'];
        const locationName = words.filter(word => !filterWords.includes(word.toLowerCase()));
        return locationName.join(' ').trim();
    }

    /**
     * Helper: Extract NPC name from matched text
     * @param {string} matchedText - The matched text
     * @returns {string} Extracted NPC name
     */
    extractNpcName(matchedText) {
        const words = matchedText.split(' ');
        const filterWords = ['meet', 'see', 'encounter', 'talk', 'to', 'the', 'approaches'];
        const npcName = words.filter(word => !filterWords.includes(word.toLowerCase()));
        return npcName.join(' ').trim();
    }

    /**
     * Helper: Extract effect name from matched text
     * @param {string} matchedText - The matched text
     * @returns {string} Extracted effect name
     */
    extractEffectName(matchedText) {
        const words = matchedText.split(' ');
        const filterWords = ['poisoned', 'buffed', 'debuffed', 'the', 'cured', 'cleansed'];
        const effectName = words.filter(word => !filterWords.includes(word.toLowerCase()));
        return effectName.join(' ').trim() || matchedText.toLowerCase().replace(/[^a-z]/g, '');
    }

    /**
     * Helper: Extract equipment name from matched text
     * @param {string} matchedText - The matched text
     * @returns {string} Extracted equipment name
     */
    extractEquipmentName(matchedText) {
        const words = matchedText.split(' ');
        const filterWords = ['equip', 'wear', 'put', 'on', 'unequip', 'remove', 'take', 'off', 'the'];
        const equipmentName = words.filter(word => !filterWords.includes(word.toLowerCase()));
        return equipmentName.join(' ').trim();
    }

    /**
     * Helper: Check if word is too common to be meaningful
     * @param {string} word - The word to check
     * @returns {boolean} True if word is common
     */
    isCommonWord(word) {
        const commonWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
        return commonWords.includes(word.toLowerCase());
    }

    /**
     * Generate lorebook updates based on state changes
     * @param {Object} changes - The detected state changes
     * @returns {Promise<Array>} Array of lorebook updates
     */
    async generateLorebookUpdates(changes) {
        if (!this.initialized) {
            debugWarn('UserStateDetector not initialized', 'UserStateDetector');
            await this.initialize();
        }

        const prompt = this.promptManager.getLorebookUpdatePrompt();
        if (!prompt) {
            debugWarn('Lorebook update prompt not available', 'UserStateDetector');
            return this.generateBasicLorebookUpdates(changes);
        }

        const updates = [];

        // Generate inventory updates
        if (changes.inventory?.added?.length > 0) {
            changes.inventory.added.forEach(item => {
                updates.push({
                    category: 'inventory',
                    subcategory: 'items',
                    name: item.item,
                    content: `${item.item}. A newly acquired item.`,
                    keywords: [item.item, 'item', 'inventory']
                });
            });
        }

        // Generate location updates
        if (changes.location) {
            updates.push({
                category: 'gameState',
                subcategory: 'locations',
                name: changes.location.value,
                content: `${changes.location.value}. Current location of the user.`,
                keywords: [changes.location.value, 'location', 'place']
            });
        }

        // Generate NPC updates
        if (changes.npcs?.added?.length > 0) {
            changes.npcs.added.forEach(npc => {
                updates.push({
                    category: 'gameState',
                    subcategory: 'npcs',
                    name: npc.name,
                    content: `${npc.name}. An NPC encountered by the user.`,
                    keywords: [npc.name, 'npc', 'character']
                });
            });
        }

        debugLog(`Generated ${updates.length} lorebook updates`, 'UserStateDetector');
        return updates;
    }

    /**
     * Basic lorebook update generation (fallback)
     * @param {Object} changes - The detected state changes
     * @returns {Array} Array of basic lorebook updates
     */
    generateBasicLorebookUpdates(changes) {
        return [];
    }

    /**
     * Detect states from multiple messages
     * @param {string} messageText - The concatenated messages to analyze
     * @returns {Promise<Array>} Array of detected states
     */
    async detectStates(messageText) {
        if (!this.initialized) {
            debugWarn('UserStateDetector not initialized', 'UserStateDetector');
            await this.initialize();
        }

        debugLog('Detecting states from messages', 'UserStateDetector');
        
        const extractedState = await this.extractStateFromMessage(messageText);
        const states = [];

        // Convert extracted state to state change objects
        if (extractedState.location) {
            states.push({
                type: 'location',
                value: extractedState.location.value,
                confidence: extractedState.location.confidence
            });
        }

        if (extractedState.time) {
            states.push({
                type: 'time',
                value: extractedState.time.value,
                confidence: extractedState.time.confidence
            });
        }

        if (extractedState.inventory.added.length > 0) {
            extractedState.inventory.added.forEach(item => {
                states.push({
                    type: 'item',
                    action: 'add',
                    value: item.item,
                    confidence: item.confidence
                });
            });
        }

        if (extractedState.inventory.removed.length > 0) {
            extractedState.inventory.removed.forEach(item => {
                states.push({
                    type: 'item',
                    action: 'remove',
                    value: item.item,
                    confidence: item.confidence
                });
            });
        }

        if (extractedState.npcs.added.length > 0) {
            extractedState.npcs.added.forEach(npc => {
                states.push({
                    type: 'npc',
                    action: 'add',
                    value: npc.name,
                    confidence: npc.confidence
                });
            });
        }

        if (extractedState.npcs.removed.length > 0) {
            extractedState.npcs.removed.forEach(npc => {
                states.push({
                    type: 'npc',
                    action: 'remove',
                    value: npc.name,
                    confidence: npc.confidence
                });
            });
        }

        if (extractedState.statusEffects.added.length > 0) {
            extractedState.statusEffects.added.forEach(effect => {
                states.push({
                    type: 'gamestate',
                    value: `Status effect applied: ${effect.effect}`,
                    confidence: effect.confidence
                });
            });
        }

        debugLog(`Detected ${states.length} state changes`, 'UserStateDetector');
        return states;
    }

    /**
     * Check if detector is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this.initialized;
    }
}

// Export for use in other modules
export { UserStateDetector };
