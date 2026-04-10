/**
 * @file Central import/export hub for all RPG Engine extension modules.
 * This file serves as a single point of entry for all imports, eliminating path depth issues.
 */

// External dependencies (SillyTavern)
import { getContext, extension_settings, renderExtensionTemplateAsync } from '../../../../../extensions.js';
import { chat, eventSource, event_types, saveChatConditional, addOneMessage } from '../../../../../../script.js';

// Import SillyTavern world-info functions (these are available globally in SillyTavern context)
// Note: These functions are defined in SillyTavern's world-info.js and are exported globally
// They will be available at runtime when the extension is loaded in SillyTavern

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
