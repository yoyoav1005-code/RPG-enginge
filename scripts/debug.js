// RPG Engine - Debug Utilities Module
// Provides conditional debug logging that respects user's debug mode setting

import { extension_settings } from "../../../extensions.js";

const MODULE_NAME = 'rpg_engine';

/**
 * Conditional debug log - only outputs when debug mode is enabled
 * @param {string} message - The message to log
 * @param {string} source - Source identifier (default: 'RPG Engine')
 */
export function debugLog(message, source = 'RPG Engine') {
    if (extension_settings[MODULE_NAME]?.debugMode) {
        console.log(`[DEBUG] [${source}] ${message}`);
    }
}

/**
 * Conditional warning log - only outputs when debug mode is enabled
 * @param {string} message - The warning message
 * @param {string} source - Source identifier (default: 'RPG Engine')
 */
export function debugWarn(message, source = 'RPG Engine') {
    if (extension_settings[MODULE_NAME]?.debugMode) {
        console.warn(`[WARN] [${source}] ${message}`);
    }
}

/**
 * Conditional error log - always outputs (for debugging errors)
 * @param {string} message - The error message
 * @param {string} source - Source identifier (default: 'RPG Engine')
 */
export function debugError(message, source = 'RPG Engine') {
    if (extension_settings[MODULE_NAME]?.debugMode) {
        console.error(`[ERROR] [${source}] ${message}`);
    }
}

/**
 * Check if debug mode is currently enabled
 * @returns {boolean} True if debug mode is enabled
 */
export function isDebugModeEnabled() {
    return extension_settings[MODULE_NAME]?.debugMode === true;
}