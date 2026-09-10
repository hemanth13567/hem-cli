#!/usr/bin/env node
const { program } = require('commander');
const path = require('path');
const { version } = require('../package.json');
const logger = require('../src/cli/logger')('bin');

// Handle SIGINT (Ctrl+C) gracefully
process.on('SIGINT', () => {
    logger.info('\nExiting hem-cli...');
    process.exit(0);
});

program
    .name('hem')
    .description('Personal workstation launcher & developer cockpit')
    .version(version, '-v, --version', 'output the current version');

// Register all domain commands
require('../src/commands/app')(program);
require('../src/commands/config')(program);
require('../src/commands/design')(program);
require('../src/commands/dev')(program);
require('../src/commands/doctor')(program);
require('../src/commands/project')(program);
require('../src/commands/start')(program);
require('../src/commands/status')(program);
require('../src/commands/web')(program);
require('../src/commands/work')(program);
require('../src/commands/workspace')(program);

program.parse(process.argv);