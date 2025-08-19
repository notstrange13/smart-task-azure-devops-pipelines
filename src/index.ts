// Capture INPUT_ environment variables FIRST, before any other imports
import './providers/inputCapture';

// Load environment variables from .env file during development (if it exists)
if (process.env.NODE_ENV !== 'production') {
    try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '..', '.env');

        if (fs.existsSync(envPath)) {
            require('dotenv').config({ override: false });
            console.log('Development mode: loaded environment variables from .env file');
        } else {
            console.log('Development mode: no .env file found, using system environment variables');
        }
    } catch {
        console.log(
            'Development mode: dotenv not available or error loading, using system environment variables'
        );
    }
}

import { TaskExecutor } from './executors/task';

/**
 * Main entry point for the Smart Task Azure DevOps Pipeline Extension
 */
async function run(): Promise<void> {
    const executor = new TaskExecutor();
    await executor.execute();
}

run();
