/**
 * AutoLorebookDetectionSystem - AI-powered automatic lorebook updates
 * Modeled after ST-Outfits AutoOutfitSystem
 * @module AutoLorebookDetectionSystem
 */

import { getContext, extension_settings, LorebookUpdater, UserStateDetector } from './RPGEngineExports.js';
import { debugLog, debugWarn, debugError } from './debug.js';

export class AutoLorebookDetectionSystem {
    constructor(lorebookUpdater, userStateDetector) {
        this.lorebookUpdater = lorebookUpdater;
        this.userStateDetector = userStateDetector;
        this.isEnabled = false;
        this.systemPrompt = this.getDefaultPrompt();
        this.commandPattern = /lorebook-update_(\w+)_([^|]+)\|([^|]+)\|(.+)/g;
        this.isProcessing = false;
        this.consecutiveFailures = 0;
        this.maxConsecutiveFailures = 5;
        this.eventHandler = null;
        this.maxRetries = 3;
        this.retryDelay = 2000;
        this.currentRetryCount = 0;
        this.appInitialized = false;
        debugLog('AutoLorebookDetectionSystem instance created', 'AutoLorebookDetectionSystem');
    }

    getDefaultPrompt() {
        return `Analyze the recent messages and detect any changes to the game state. Generate lorebook updates for detected changes.

IMPORTANT: Output commands as plain text, NOT as JSON. Use this format:
lorebook-update_category_name|content|keywords

Available categories: inventory, gameState, quest, npcs, items, locations, equipment

Rules:
1. Only generate updates for NEW or CHANGED information
2. Content should be descriptive and contextual
3. Keywords should be comma-separated and relevant
4. Do NOT output JSON arrays or any other format

Examples:
- lorebook-update_inventory_items_Rusty Sword|A rusty sword found in the dark cave. The blade is chipped but still sharp.|rusty sword, sword, weapon, item, inventory
- lorebook-update_gameState_locations_Dark Cave|A dark and damp cave entrance. Water drips from the ceiling and the air is cold.|dark cave, cave, location, entrance, dark
- lorebook-update_gameState_npcs_Blacksmith|A skilled blacksmith who makes weapons and armor. He has a strong build and calloused hands.|blacksmith, npc, character, smith, weapons

Current game state will be provided below. Only update entries that have changed or are new.

Output [none] if no changes detected.`;
    }

    enable() {
        if (this.isEnabled) return '[RPG Engine] Auto lorebook updates already enabled.';
        
        debugLog('Enabling auto lorebook detection', 'AutoLorebookDetectionSystem');
        this.isEnabled = true;
        this.consecutiveFailures = 0;
        this.currentRetryCount = 0;
        this.setupEventListeners();
        debugLog('Auto lorebook detection enabled', 'AutoLorebookDetectionSystem');
        return '[RPG Engine] Auto lorebook updates enabled.';
    }

    disable() {
        debugLog('Disabling auto lorebook detection', 'AutoLorebookDetectionSystem');
        if (!this.isEnabled) return '[RPG Engine] Auto lorebook updates already disabled.';
        
        this.isEnabled = false;
        this.removeEventListeners();
        debugLog('Auto lorebook detection disabled', 'AutoLorebookDetectionSystem');
        return '[RPG Engine] Auto lorebook updates disabled.';
    }

    setupEventListeners() {
        debugLog('Setting up event listeners', 'AutoLorebookDetectionSystem');
        this.removeEventListeners();
        
        const { eventSource, event_types } = getContext();
        
        // Listen for MESSAGE_RECEIVED event (fires when new messages arrive)
        this.eventHandler = (data) => {
            debugLog('Event handler triggered', 'AutoLorebookDetectionSystem');
            // Only process AI messages and only after app is initialized
            if (this.isEnabled && !this.isProcessing && this.appInitialized && 
                data && !data.is_user) {
                debugLog('New AI message received, processing...', 'AutoLorebookDetectionSystem');
                setTimeout(() => {
                    this.processLorebookCommands().catch(error => {
                        debugError('Auto lorebook processing failed:', error, 'AutoLorebookDetectionSystem');
                        this.consecutiveFailures++;
                    });
                }, 1000);
            }
        };
        
        eventSource.on(event_types.MESSAGE_RECEIVED, this.eventHandler);
        debugLog('Event listener registered for MESSAGE_RECEIVED', 'AutoLorebookDetectionSystem');
    }

    removeEventListeners() {
        debugLog('Removing event listeners', 'AutoLorebookDetectionSystem');
        if (this.eventHandler) {
            const { eventSource, event_types } = getContext();
            eventSource.off(event_types.MESSAGE_RECEIVED, this.eventHandler);
            this.eventHandler = null;
            debugLog('Event listener removed', 'AutoLorebookDetectionSystem');
        }
    }

    markAppInitialized() {
        debugLog('Marking app as initialized', 'AutoLorebookDetectionSystem');
        if (!this.appInitialized) {
            this.appInitialized = true;
            debugLog('App marked as initialized - will now process new AI messages', 'AutoLorebookDetectionSystem');
        }
    }

    async processLorebookCommands() {
        debugLog('Starting to process lorebook commands', 'AutoLorebookDetectionSystem');
        
        if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
            debugWarn('Max consecutive failures reached, disabling', 'AutoLorebookDetectionSystem');
            this.disable();
            this.showPopup('Auto lorebook updates disabled due to repeated failures.', 'error');
            return;
        }

        if (this.isProcessing) {
            debugLog('Already processing, skipping', 'AutoLorebookDetectionSystem');
            return;
        }
        
        this.isProcessing = true;
        this.currentRetryCount = 0;
        
        try {
            debugLog('Starting process with retry', 'AutoLorebookDetectionSystem');
            await this.processWithRetry();
        } catch (error) {
            debugError('Lorebook command processing failed after retries:', error, 'AutoLorebookDetectionSystem');
            this.consecutiveFailures++;
            this.showPopup(`Lorebook check failed ${this.consecutiveFailures} time(s).`, 'error');
        } finally {
            debugLog('Finished processing lorebook commands', 'AutoLorebookDetectionSystem');
            this.isProcessing = false;
        }
    }

    async processWithRetry() {
        debugLog('Starting retry process', 'AutoLorebookDetectionSystem');
        while (this.currentRetryCount < this.maxRetries) {
            try {
                debugLog(`Checking for lorebook updates... (Attempt ${this.currentRetryCount + 1}/${this.maxRetries})`, 'AutoLorebookDetectionSystem');
                this.showPopup(`Checking for lorebook updates... (Attempt ${this.currentRetryCount + 1}/${this.maxRetries})`, 'info');
                
                await this.executeGenCommand();
                
                debugLog('Lorebook check completed successfully', 'AutoLorebookDetectionSystem');
                this.consecutiveFailures = 0;
                this.showPopup('Lorebook check completed.', 'success');
                return;
                
            } catch (error) {
                debugWarn(`Attempt ${this.currentRetryCount + 1} failed, retrying in ${this.retryDelay}ms...`, error, 'AutoLorebookDetectionSystem');
                this.currentRetryCount++;
                
                if (this.currentRetryCount < this.maxRetries) {
                    await this.delay(this.retryDelay);
                } else {
                    debugError('All retry attempts failed', error, 'AutoLorebookDetectionSystem');
                    throw error;
                }
            }
        }
    }

    getLorebookStateString() {
        debugLog('Building lorebook state string', 'AutoLorebookDetectionSystem');
        let output = `Current Lorebook Entries:\n\n`;
        
        // Get current extension settings state
        const settings = extension_settings.rpg_engine || {};
        
        if (settings.location) {
            output += `Location: ${settings.location}\n`;
        }
        
        if (settings.time) {
            output += `Time: ${settings.time}\n`;
        }
        
        if (settings.quest) {
            output += `Active Quest: ${settings.quest}\n`;
        }
        
        if (settings.items && settings.items.length > 0) {
            output += `Items: ${settings.items.join(', ')}\n`;
        }
        
        if (settings.npcs && settings.npcs.length > 0) {
            output += `Active NPCs: ${settings.npcs.join(', ')}\n`;
        }
        
        debugLog(`Lorebook state string built (${output.length} chars)`, 'AutoLorebookDetectionSystem');
        return output;
    }

    async executeGenCommand() {
        debugLog('Executing generation command', 'AutoLorebookDetectionSystem');
        const recentMessages = this.getLastMessages(3);
        if (!recentMessages.trim()) {
            debugWarn('No valid messages to process', 'AutoLorebookDetectionSystem');
            throw new Error('No valid messages to process');
        }

        const { generateRaw } = getContext();
        
        // Generate current lorebook state
        const currentLorebookState = this.getLorebookStateString();
        
        const promptText = `${this.systemPrompt}\n\n${currentLorebookState}\n\nRecent Messages:\n${recentMessages}\n\nOutput:`;
        
        debugLog('Generating lorebook commands with generateRaw...', 'AutoLorebookDetectionSystem');
        
        try {
            const result = await generateRaw({
                prompt: promptText,
                systemPrompt: "You are a game state detection system. Analyze the conversation and output lorebook update commands when state changes occur."
            });

            if (!result) {
                debugError('No output generated from generation', null, 'AutoLorebookDetectionSystem');
                throw new Error('No output generated from generation');
            }
            
            debugLog(`Generated result: ${result}`, 'AutoLorebookDetectionSystem');
            
            // Check if AI output [none]
            if (result.trim().toLowerCase() === '[none]') {
                debugLog('No changes detected by AI', 'AutoLorebookDetectionSystem');
                return;
            }
            
            const commands = this.parseGeneratedText(result);
            
            if (commands.length > 0) {
                debugLog(`Found ${commands.length} commands, processing...`, 'AutoLorebookDetectionSystem');
                await this.processCommandBatch(commands);
            } else {
                debugLog('No lorebook commands found in response', 'AutoLorebookDetectionSystem');
            }
            
        } catch (error) {
            debugError('Generation failed:', error, 'AutoLorebookDetectionSystem');
            await this.tryFallbackGeneration(promptText);
        }
    }

    async tryFallbackGeneration(promptText) {
        debugLog('Attempting fallback generation', 'AutoLorebookDetectionSystem');
        try {
            const { generateQuietPrompt } = getContext();
            
            if (!generateQuietPrompt) {
                debugError('generateQuietPrompt not available', null, 'AutoLorebookDetectionSystem');
                throw new Error('generateQuietPrompt not available');
            }
            
            const result = await generateQuietPrompt({
                quietPrompt: promptText
            });

            if (!result) {
                debugError('No output generated from fallback generation', null, 'AutoLorebookDetectionSystem');
                throw new Error('No output generated from fallback generation');
            }
            
            debugLog(`Fallback result: ${result}`, 'AutoLorebookDetectionSystem');
            
            const commands = this.parseGeneratedText(result);
            
            if (commands.length > 0) {
                debugLog('Processing fallback commands', 'AutoLorebookDetectionSystem');
                await this.processCommandBatch(commands);
            }
            
        } catch (fallbackError) {
            debugError('Fallback generation also failed:', fallbackError, 'AutoLorebookDetectionSystem');
            throw new Error(`Both generation methods failed: ${fallbackError.message}`);
        }
    }

    parseGeneratedText(text) {
        debugLog(`Parsing generated text (${text?.length || 0} chars)`, 'AutoLorebookDetectionSystem');
        if (!text) return [];
        
        const commands = [];
        const matches = text.matchAll(this.commandPattern);
        
        for (const match of matches) {
            commands.push(match[0]);
        }
        
        debugLog(`Found ${commands.length} commands:`, commands, 'AutoLorebookDetectionSystem');
        return commands;
    }

    async processCommandBatch(commands) {
        debugLog(`Processing command batch (${commands?.length || 0} commands)`, 'AutoLorebookDetectionSystem');
        if (!commands || commands.length === 0) {
            debugLog('No commands to process', 'AutoLorebookDetectionSystem');
            return;
        }

        debugLog(`Processing batch of ${commands.length} commands`, 'AutoLorebookDetectionSystem');
        
        const successfulCommands = [];
        const failedCommands = [];
        
        for (const command of commands) {
            try {
                const result = await this.processSingleCommand(command);
                if (result.success) {
                    successfulCommands.push(result);
                } else {
                    failedCommands.push({ command, error: result.error });
                }
            } catch (error) {
                debugError(`Error processing command "${command}":`, error, 'AutoLorebookDetectionSystem');
                failedCommands.push({ command, error: error.message });
            }
        }
        
        if (successfulCommands.length > 0 && extension_settings.rpg_engine?.enableSysMessages) {
            this.showPopup(`${successfulCommands.length} lorebook update(s) applied.`, 'success');
        }
        
        if (failedCommands.length > 0) {
            debugWarn(`${failedCommands.length} commands failed:`, failedCommands, 'AutoLorebookDetectionSystem');
        }
        
        debugLog(`Batch completed: ${successfulCommands.length} successful, ${failedCommands.length} failed`, 'AutoLorebookDetectionSystem');
    }

    async processSingleCommand(command) {
        debugLog(`Processing single command: ${command}`, 'AutoLorebookDetectionSystem');
        try {
            const match = command.match(/lorebook-update_(\w+)_([^|]+)\|([^|]+)\|(.+)/);
            if (!match) {
                debugError(`Invalid command format: ${command}`, null, 'AutoLorebookDetectionSystem');
                throw new Error(`Invalid command format: ${command}`);
            }
            
            const [, category, name, content, keywordsStr] = match;
            
            // Parse keywords
            const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
            
            // Create subcategory based on category
            const subcategory = this.getSubcategory(category);
            
            debugLog(`Processing: ${category}/${subcategory}/${name}`, 'AutoLorebookDetectionSystem');
            
            // Create lorebook update object
            const update = {
                category: category,
                subcategory: subcategory,
                name: name.trim(),
                content: content.trim(),
                keywords: keywords
            };
            
            // Apply via LorebookUpdater
            debugLog('Applying via LorebookUpdater', 'AutoLorebookDetectionSystem');
            const result = await this.lorebookUpdater.applyLorebookUpdates([update]);
            
            return {
                success: result.applied > 0,
                command,
                update
            };
            
        } catch (error) {
            debugError(`Failed to process command: ${error}`, null, 'AutoLorebookDetectionSystem');
            return {
                success: false,
                command,
                error: error.message
            };
        }
    }

    getSubcategory(category) {
        debugLog(`Getting subcategory for ${category}`, 'AutoLorebookDetectionSystem');
        // Map categories to subcategories
        const mapping = {
            'inventory': 'items',
            'gameState': 'locations',
            'quest': 'quests',
            'npcs': 'characters',
            'items': 'inventory',
            'locations': 'places',
            'equipment': 'gear'
        };
        
        const result = mapping[category] || 'entries';
        debugLog(`Subcategory for ${category} is ${result}`, 'AutoLorebookDetectionSystem');
        return result;
    }

    getLastMessages(count = 3) {
        debugLog(`Getting last ${count} messages`, 'AutoLorebookDetectionSystem');
        try {
            const { chat } = getContext();
            
            if (!chat || !Array.isArray(chat) || chat.length === 0) {
                debugWarn('No chat or empty chat array', null, 'AutoLorebookDetectionSystem');
                return '';
            }
            
            const validMessages = chat.filter(msg => 
                msg && typeof msg === 'object' && 
                typeof msg.mes === 'string' && 
                typeof msg.is_user === 'boolean'
            );
            
            if (validMessages.length === 0) {
                debugWarn('No valid messages found', null, 'AutoLorebookDetectionSystem');
                return '';
            }
            
            const recentMessages = validMessages.slice(-count);
            const result = recentMessages.map(msg => 
                `${msg.is_user ? 'User' : (msg.name || 'AI')}: ${msg.mes}`
            ).join('\n');
            
            debugLog(`Retrieved ${recentMessages.length} messages`, 'AutoLorebookDetectionSystem');
            return result;
            
        } catch (error) {
            debugError('Error getting last messages:', error, 'AutoLorebookDetectionSystem');
            return '';
        }
    }

    showPopup(message, type = 'info') {
        debugLog(`Showing popup: ${message}`, 'AutoLorebookDetectionSystem');
        try {
            if (typeof toastr !== 'undefined') {
                const options = {
                    timeOut: type === 'error' ? 5000 : 3000,
                    extendedTimeOut: type === 'error' ? 10000 : 5000
                };
                
                switch(type) {
                    case 'error':
                        toastr.error(message, 'RPG Engine', options);
                        break;
                    case 'warning':
                        toastr.warning(message, 'RPG Engine', options);
                        break;
                    case 'success':
                        toastr.success(message, 'RPG Engine', options);
                        break;
                    default:
                        toastr.info(message, 'RPG Engine', options);
                }
            }
        } catch (error) {
            debugError('Failed to show popup:', error, 'AutoLorebookDetectionSystem');
        }
    }

    delay(ms) {
        debugLog(`Delaying for ${ms}ms`, 'AutoLorebookDetectionSystem');
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
        debugLog('Getting status', 'AutoLorebookDetectionSystem');
        return {
            enabled: this.isEnabled,
            hasPrompt: !!this.systemPrompt,
            promptLength: this.systemPrompt?.length || 0,
            isProcessing: this.isProcessing,
            consecutiveFailures: this.consecutiveFailures,
            currentRetryCount: this.currentRetryCount,
            maxRetries: this.maxRetries,
            appInitialized: this.appInitialized
        };
    }

    async manualTrigger() {
        debugLog('Manual trigger called', 'AutoLorebookDetectionSystem');
        if (this.isProcessing) {
            this.showPopup('Auto lorebook check already in progress.', 'warning');
            return;
        }
        
        try {
            this.showPopup('Manual lorebook check started...', 'info');
            await this.processLorebookCommands();
        } catch (error) {
            debugError(`Manual trigger failed: ${error}`, null, 'AutoLorebookDetectionSystem');
            this.showPopup(`Manual trigger failed: ${error.message}`, 'error');
        }
    }

    setPrompt(prompt) {
        debugLog('Setting system prompt', 'AutoLorebookDetectionSystem');
        this.systemPrompt = prompt || this.getDefaultPrompt();
        debugLog(`System prompt updated (${this.systemPrompt.length} chars)`, 'AutoLorebookDetectionSystem');
        return '[RPG Engine] System prompt updated.';
    }

    resetToDefaultPrompt() {
        debugLog('Resetting to default prompt', 'AutoLorebookDetectionSystem');
        this.systemPrompt = this.getDefaultPrompt();
        debugLog('Reset to default prompt', 'AutoLorebookDetectionSystem');
        return '[RPG Engine] Reset to default prompt.';
    }
}