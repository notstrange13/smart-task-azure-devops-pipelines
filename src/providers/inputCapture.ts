/**
 * Captures INPUT_ environment variables before they can be consumed by the Azure DevOps task library
 * This module should be imported very early, before any task library imports
 */

// Capture INPUT_ environment variables immediately when module is loaded
export const capturedInputs = {
    prompt: process.env.INPUT_PROMPT,
    mode: process.env.INPUT_MODE,
    additionalContext: process.env.INPUT_ADDITIONALCONTEXT,
};
