/**
 * @file Central import/export hub for all RPG Engine extension modules.
 * This file serves as a single point of entry for all imports, eliminating path depth issues.
 */

// External dependencies (SillyTavern)
import { getContext, extension_settings, renderExtensionTemplateAsync } from '../../../../../extensions.js';
import { chat, eventSource, event_types, saveChatConditional, addOneMessage } from '../../../../../../script.js';

// Import SillyTavern world-info functions directly from world-info.js
import { 
    createNewWorldInfo, 
    createWorldInfoEntry, 
    saveWorldInfo, 
    worldInfoCache 
} from '../../../../../world-info.js';

// Export SillyTavern API functions for use by other modules
export { createNewWorldInfo, createWorldInfoEntry, saveWorldInfo, worldInfoCache };

// Core extension constants and functions (defined locally to avoid circular dependency)
const extensionName = "RPG Engine";

// Import and export debug functions
import { debugLog, debugWarn, debugError, isDebugModeEnabled } from './debug.js';
export { debugLog, debugWarn, debugError, isDebugModeEnabled };

// Import and export lorebook builder functions
import { 
    createTemplateLorebook,
    buildQuestDataTemplate,
    buildGameStateTemplate,
    buildInventoryTemplate,
    buildUserStateTemplate,
    generateEntryStructure,
    exportTemplateToJSON,
    importTemplateFromJSON,
    saveTemplateToFile,
    loadTemplateFromFile,
    loadTemplateFromJSON,
    convertTemplateToEntries
} from './lorebook.js';
export { 
    createTemplateLorebook,
    buildQuestDataTemplate,
    buildGameStateTemplate,
    buildInventoryTemplate,
    buildUserStateTemplate,
    generateEntryStructure,
    exportTemplateToJSON,
    importTemplateFromJSON,
    saveTemplateToFile,
    loadTemplateFromFile,
    loadTemplateFromJSON,
    convertTemplateToEntries 
};

// Import and export state detection modules
import { PromptManager } from './promptManager.js';
import { UserStateDetector } from './userStateDetector.js';
import { LorebookUpdater } from './lorebookUpdater.js';
import { AutoLorebookDetectionSystem } from './autoLorebookDetectionSystem.js';
export { PromptManager, UserStateDetector, LorebookUpdater, AutoLorebookDetectionSystem };

// Export extension_settings for use by other modules
export { getContext, extension_settings, renderExtensionTemplateAsync, chat, eventSource, event_types, saveChatConditional, addOneMessage };