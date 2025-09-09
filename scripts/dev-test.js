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
    prompt = process.env.PROMPT;
}

if (!mode) {
    mode = process.env.MODE;
}

if (!additionalContext) {
    additionalContext = process.env.ADDITIONAL_CONTEXT || '{}';
}

// If still no prompt or mode, show usage
if (!prompt || !mode) {
    console.log(
        'Usage: node dev-test.js "Your prompt here" [decision|execution] [additional_context_json]'
    );
    console.log('');
    console.log('Alternative: Set environment variables:');
    console.log('  PROMPT="Your prompt here"');
    console.log('  MODE="decision" or "execution"');
    console.log('  ADDITIONAL_CONTEXT=\'{"key": "value"}\'');
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

// Debug: Show what we're setting
console.log('Setting environment variables:');
console.log(`  PROMPT: ${prompt}`);
console.log(`  MODE: ${mode}`);
console.log(`  ADDITIONAL_CONTEXT: ${additionalContext}`);
console.log('');

// Run the built JavaScript - go up one directory from scripts to project root
const scriptPath = path.join(__dirname, '..', 'dist', 'index.js');

// Explicitly create the environment for the child process
const childEnv = {
    ...process.env,
    NODE_ENV: 'development',
    PROMPT: prompt,
    MODE: mode,
    ADDITIONAL_CONTEXT: additionalContext,
    // Set dummy INPUT_ variables to prevent Azure DevOps task library debug messages
    INPUT_PROMPT: 'dev-mode',
    INPUT_MODE: 'dev-mode',
    INPUT_ADDITIONALCONTEXT: 'dev-mode',
};

console.log('Final environment variables for child process:');
console.log(`  NODE_ENV: ${childEnv.NODE_ENV}`);
console.log(`  PROMPT: ${childEnv.PROMPT}`);
console.log(`  MODE: ${childEnv.MODE}`);
console.log(`  ADDITIONAL_CONTEXT: ${childEnv.ADDITIONAL_CONTEXT}`);
console.log('');

const child = spawn('node', [scriptPath], {
    stdio: 'inherit',
    env: childEnv,
});

child.on('close', code => {
    console.log(`\nSmart Task completed with exit code: ${code}`);
});

child.on('error', error => {
    console.error(`Error running Smart Task: ${error.message}`);
});
