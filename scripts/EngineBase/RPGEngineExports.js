/**
 * @file Central import/export hub for all RPG Engine extension modules.
 * This file serves as a single point of entry for all imports, eliminating path depth issues.
 */

// External dependencies (SillyTavern)
import { getContext, extension_settings, renderExtensionTemplateAsync } from '../../../../../extensions.js';
import { chat, eventSource, event_types, saveChatConditional, addOneMessage } from '../../../../../../script.js';

// Import SillyTavern world-info functions from global scope
// These functions are defined in SillyTavern's world-info.js and are available globally when running in SillyTavern
let createNewWorldInfo, createWorldInfoEntry, saveWorldInfo, worldInfoCache;

// Try to get functions from window object first (browser context)
if (typeof window !== 'undefined') {
    createNewWorldInfo = window.createNewWorldInfo;
    createWorldInfoEntry = window.createWorldInfoEntry;
    saveWorldInfo = window.saveWorldInfo;
    worldInfoCache = window.worldInfoCache;
}

// Fallback to globalThis if not in window
if (!createNewWorldInfo && typeof globalThis !== 'undefined') {
    createNewWorldInfo = globalThis.createNewWorldInfo;
    createWorldInfoEntry = globalThis.createWorldInfoEntry;
    saveWorldInfo = globalThis.saveWorldInfo;
    worldInfoCache = globalThis.worldInfoCache;
}

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
    loadTemplateFromFile
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
    loadTemplateFromFile 
};

// Export extension_settings for use by other modules
export { getContext, extension_settings, renderExtensionTemplateAsync, chat, eventSource, event_types, saveChatConditional, addOneMessage };
