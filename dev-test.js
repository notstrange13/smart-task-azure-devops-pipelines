#!/usr/bin/env node

/**
 * Development script to test the Smart Task locally
 * Usage: node dev-test.js "Your prompt here" [mode]
 */

const { spawn } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let prompt = args[0];
let mode = args[1];
let additionalContext = args[2];

// If no CLI arguments provided, check environment variables
if (!prompt) {
    prompt = process.env.INPUT_PROMPT;
}

if (!mode) {
    mode = process.env.INPUT_MODE;
}

if (!additionalContext) {
    additionalContext = process.env.INPUT_ADDITIONALCONTEXT || '{}';
}

// If still no prompt or mode, show usage
if (!prompt || !mode) {
    console.log('Usage: node dev-test.js "Your prompt here" [decision|execution] [additional_context_json]');
    console.log('');
    console.log('Alternative: Set environment variables:');
    console.log('  INPUT_PROMPT="Your prompt here"');
    console.log('  INPUT_MODE="decision" or "execution"');
    console.log('  INPUT_ADDITIONALCONTEXT=\'{"key": "value"}\'');
    console.log('');
    console.log('Both prompt and mode are required via CLI args or environment variables.');
    process.exit(1);
}

if (mode !== 'decision' && mode !== 'execution') {
    console.log('Error: Mode must be either "decision" or "execution"');
    process.exit(1);
}

console.log(`Testing Smart Task with:`);
console.log(`  Prompt: ${prompt}`);
console.log(`  Mode: ${mode}`);
console.log(`  Additional Context: ${additionalContext}`);
console.log(`  Source: ${args.length >= 2 ? 'CLI arguments' : 'Environment variables'}`);
console.log(`  Environment: Development`);
console.log('');

// Set development environment
process.env.NODE_ENV = 'development';

// Mock Azure DevOps task library inputs
// Azure DevOps task lib converts input names to uppercase and prefixes with INPUT_
process.env.INPUT_PROMPT = prompt;
process.env.INPUT_MODE = mode;
process.env.INPUT_ADDITIONALCONTEXT = additionalContext;

// Debug: Show what we're setting
console.log('Setting environment variables:');
console.log(`  INPUT_PROMPT: ${process.env.INPUT_PROMPT}`);
console.log(`  INPUT_MODE: ${process.env.INPUT_MODE}`);
console.log(`  INPUT_ADDITIONALCONTEXT: ${process.env.INPUT_ADDITIONALCONTEXT}`);
console.log('');

// Run the built JavaScript
const scriptPath = path.join(__dirname, 'dist', 'index.js');

// Explicitly create the environment for the child process
const childEnv = {
    ...process.env,
    NODE_ENV: 'development',
    INPUT_PROMPT: prompt,
    INPUT_MODE: mode,
    INPUT_ADDITIONALCONTEXT: additionalContext
};

console.log('Final environment variables for child process:');
console.log(`  NODE_ENV: ${childEnv.NODE_ENV}`);
console.log(`  INPUT_PROMPT: ${childEnv.INPUT_PROMPT}`);
console.log(`  INPUT_MODE: ${childEnv.INPUT_MODE}`);
console.log(`  INPUT_ADDITIONALCONTEXT: ${childEnv.INPUT_ADDITIONALCONTEXT}`);
console.log('');

const child = spawn('node', [scriptPath], {
    stdio: 'inherit',
    env: childEnv
});

child.on('close', (code) => {
    console.log(`\nSmart Task completed with exit code: ${code}`);
});

child.on('error', (error) => {
    console.error(`Error running Smart Task: ${error.message}`);
});
