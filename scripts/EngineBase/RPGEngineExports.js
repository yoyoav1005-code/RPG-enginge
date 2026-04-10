/**
 * @file Central import/export hub for all GuidedGenerations extension modules.
 * This file serves as a single point of entry for all imports, eliminating path depth issues.
 */

// External dependencies (SillyTavern)
import { getContext, extension_settings, renderExtensionTemplateAsync } from '../../../../../extensions.js';
import { chat, eventSource, event_types, saveChatConditional, addOneMessage } from '../../../../../../script.js';

// Core extension constants and functions (defined locally to avoid circular dependency)
const extensionName = "RPG Engine";

// Import and export debug functions
import { debugLog, debugWarn, debugError, isDebugModeEnabled } from './debug.js';
export { debugLog, debugWarn, debugError, isDebugModeEnabled };

// Export extension_settings for use by other modules
export { extension_settings };
