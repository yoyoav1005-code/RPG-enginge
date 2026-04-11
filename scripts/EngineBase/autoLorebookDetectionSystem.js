/**
 * AutoLorebookDetectionSystem - AI-powered automatic lorebook updates
 * Modeled after ST-Outfits AutoOutfitSystem
 * @module AutoLorebookDetectionSystem
 */

import { getContext, extension_settings } from "../../../extensions.js";
import { LorebookUpdater } from './lorebookUpdater.js';
import { UserStateDetector } from './userStateDetector.js';

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
        
        this.isEnabled = true;
        this.consecutiveFailures = 0;
        this.currentRetryCount = 0;
        this.setupEventListeners();
        return '[RPG Engine] Auto lorebook updates enabled.';
    }

    disable() {
        if (!this.isEnabled) return '[RPG Engine] Auto lorebook updates already disabled.';
        
        this.isEnabled = false;
        this.removeEventListeners();
        return '[RPG Engine] Auto lorebook updates disabled.';
    }

    setupEventListeners() {
        this.removeEventListeners();
        
        const { eventSource, event_types } = getContext();
        
        // Listen for MESSAGE_RECEIVED event (fires when new messages arrive)
        this.eventHandler = (data) => {
            // Only process AI messages and only after app is initialized
            if (this.isEnabled && !this.isProcessing && this.appInitialized && 
                data && !data.is_user) {
                console.log('[AutoLorebookDetectionSystem] New AI message received, processing...');
                setTimeout(() => {
                    this.processLorebookCommands().catch(error => {
                        console.error('Auto lorebook processing failed:', error);
                        this.consecutiveFailures++;
                    });
                }, 1000);
            }
        };
        
        eventSource.on(event_types.MESSAGE_RECEIVED, this.eventHandler);
        console.log('[AutoLorebookDetectionSystem] Event listener registered for MESSAGE_RECEIVED');
    }

    removeEventListeners() {
        if (this.eventHandler) {
            const { eventSource, event_types } = getContext();
            eventSource.off(event_types.MESSAGE_RECEIVED, this.eventHandler);
            this.eventHandler = null;
            console.log('[AutoLorebookDetectionSystem] Event listener removed');
        }
    }

    markAppInitialized() {
        if (!this.appInitialized) {
            this.appInitialized = true;
            console.log('[AutoLorebookDetectionSystem] App marked as initialized - will now process new AI messages');
        }
    }

    async processLorebookCommands() {
        if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
            this.disable();
            this.showPopup('Auto lorebook updates disabled due to repeated failures.', 'error');
            return;
        }

        if (this.isProcessing) {
            console.log('[AutoLorebookDetectionSystem] Already processing, skipping');
            return;
        }
        
        this.isProcessing = true;
        this.currentRetryCount = 0;
        
        try {
            await this.processWithRetry();
        } catch (error) {
            console.error('Lorebook command processing failed after retries:', error);
            this.consecutiveFailures++;
            this.showPopup(`Lorebook check failed ${this.consecutiveFailures} time(s).`, 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    async processWithRetry() {
        while (this.currentRetryCount < this.maxRetries) {
            try {
                this.showPopup(`Checking for lorebook updates... (Attempt ${this.currentRetryCount + 1}/${this.maxRetries})`, 'info');
                
                await this.executeGenCommand();
                
                this.consecutiveFailures = 0;
                this.showPopup('Lorebook check completed.', 'success');
                return;
                
            } catch (error) {
                this.currentRetryCount++;
                
                if (this.currentRetryCount < this.maxRetries) {
                    console.log(`[AutoLorebookDetectionSystem] Attempt ${this.currentRetryCount} failed, retrying in ${this.retryDelay}ms...`, error);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    getLorebookStateString() {
        // Build current lorebook state for AI context
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
        
        return output;
    }

    async executeGenCommand() {
        const recentMessages = this.getLastMessages(3);
        if (!recentMessages.trim()) {
            throw new Error('No valid messages to process');
        }

        const { generateRaw } = getContext();
        
        // Generate current lorebook state
        const currentLorebookState = this.getLorebookStateString();
        
        const promptText = `${this.systemPrompt}\n\n${currentLorebookState}\n\nRecent Messages:\n${recentMessages}\n\nOutput:`;
        
        console.log('[AutoLorebookDetectionSystem] Generating lorebook commands with generateRaw...');
        
        try {
            const result = await generateRaw({
                prompt: promptText,
                systemPrompt: "You are a game state detection system. Analyze the conversation and output lorebook update commands when state changes occur."
            });

            if (!result) {
                throw new Error('No output generated from generation');
            }
            
            console.log('[AutoLorebookDetectionSystem] Generated result:', result);
            
            // Check if AI output [none]
            if (result.trim().toLowerCase() === '[none]') {
                console.log('[AutoLorebookDetectionSystem] No changes detected by AI');
                return;
            }
            
            const commands = this.parseGeneratedText(result);
            
            if (commands.length > 0) {
                console.log(`[AutoLorebookDetectionSystem] Found ${commands.length} commands, processing...`);
                await this.processCommandBatch(commands);
            } else {
                console.log('[AutoLorebookDetectionSystem] No lorebook commands found in response');
            }
            
        } catch (error) {
            console.error('[AutoLorebookDetectionSystem] Generation failed:', error);
            await this.tryFallbackGeneration(promptText);
        }
    }

    async tryFallbackGeneration(promptText) {
        try {
            const { generateQuietPrompt } = getContext();
            
            if (!generateQuietPrompt) {
                throw new Error('generateQuietPrompt not available');
            }
            
            const result = await generateQuietPrompt({
                quietPrompt: promptText
            });

            if (!result) {
                throw new Error('No output generated from fallback generation');
            }
            
            console.log('[AutoLorebookDetectionSystem] Fallback result:', result);
            
            const commands = this.parseGeneratedText(result);
            
            if (commands.length > 0) {
                await this.processCommandBatch(commands);
            }
            
        } catch (fallbackError) {
            console.error('[AutoLorebookDetectionSystem] Fallback generation also failed:', fallbackError);
            throw new Error(`Both generation methods failed: ${fallbackError.message}`);
        }
    }

    parseGeneratedText(text) {
        if (!text) return [];
        
        const commands = [];
        const matches = text.matchAll(this.commandPattern);
        
        for (const match of matches) {
            commands.push(match[0]);
        }
        
        console.log(`[AutoLorebookDetectionSystem] Found ${commands.length} commands:`, commands);
        return commands;
    }

    async processCommandBatch(commands) {
        if (!commands || commands.length === 0) {
            console.log('[AutoLorebookDetectionSystem] No commands to process');
            return;
        }

        console.log(`[AutoLorebookDetectionSystem] Processing batch of ${commands.length} commands`);
        
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
                failedCommands.push({ command, error: error.message });
                console.error(`Error processing command "${command}":`, error);
            }
        }
        
        if (successfulCommands.length > 0 && extension_settings.rpg_engine?.enableSysMessages) {
            this.showPopup(`${successfulCommands.length} lorebook update(s) applied.`, 'success');
        }
        
        if (failedCommands.length > 0) {
            console.warn(`[AutoLorebookDetectionSystem] ${failedCommands.length} commands failed:`, failedCommands);
        }
        
        console.log(`[AutoLorebookDetectionSystem] Batch completed: ${successfulCommands.length} successful, ${failedCommands.length} failed`);
    }

    async processSingleCommand(command) {
        try {
            const match = command.match(/lorebook-update_(\w+)_([^|]+)\|([^|]+)\|(.+)/);
            if (!match) {
                throw new Error(`Invalid command format: ${command}`);
            }
            
            const [, category, name, content, keywordsStr] = match;
            
            // Parse keywords
            const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
            
            // Create subcategory based on category
            const subcategory = this.getSubcategory(category);
            
            console.log(`[AutoLorebookDetectionSystem] Processing: ${category}/${subcategory}/${name}`);
            
            // Create lorebook update object
            const update = {
                category: category,
                subcategory: subcategory,
                name: name.trim(),
                content: content.trim(),
                keywords: keywords
            };
            
            // Apply via LorebookUpdater
            const result = await this.lorebookUpdater.applyLorebookUpdates([update]);
            
            return {
                success: result.applied > 0,
                command,
                update
            };
            
        } catch (error) {
            return {
                success: false,
                command,
                error: error.message
            };
        }
    }

    getSubcategory(category) {
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
        
        return mapping[category] || 'entries';
    }

    getLastMessages(count = 3) {
        try {
            const { chat } = getContext();
            
            if (!chat || !Array.isArray(chat) || chat.length === 0) {
                console.log('[AutoLorebookDetectionSystem] No chat or empty chat array');
                return '';
            }
            
            const validMessages = chat.filter(msg => 
                msg && typeof msg === 'object' && 
                typeof msg.mes === 'string' && 
                typeof msg.is_user === 'boolean'
            );
            
            if (validMessages.length === 0) {
                console.log('[AutoLorebookDetectionSystem] No valid messages found');
                return '';
            }
            
            const recentMessages = validMessages.slice(-count);
            return recentMessages.map(msg => 
                `${msg.is_user ? 'User' : (msg.name || 'AI')}: ${msg.mes}`
            ).join('\n');
            
        } catch (error) {
            console.error('Error getting last messages:', error);
            return '';
        }
    }

    showPopup(message, type = 'info') {
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
            console.error('Failed to show popup:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
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
        if (this.isProcessing) {
            this.showPopup('Auto lorebook check already in progress.', 'warning');
            return;
        }
        
        try {
            this.showPopup('Manual lorebook check started...', 'info');
            await this.processLorebookCommands();
        } catch (error) {
            this.showPopup(`Manual trigger failed: ${error.message}`, 'error');
        }
    }

    setPrompt(prompt) {
        this.systemPrompt = prompt || this.getDefaultPrompt();
        return '[RPG Engine] System prompt updated.';
    }

    resetToDefaultPrompt() {
        this.systemPrompt = this.getDefaultPrompt();
        return '[RPG Engine] Reset to default prompt.';
    }
}