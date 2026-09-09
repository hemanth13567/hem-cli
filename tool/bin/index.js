#!/usr/bin/env node
const chalk = require('chalk');
const { program } = require('commander');
const { version } = require('../package.json');

program
    .name('hem')
    .description('Personal workstation launcher & developer cockpit')
    .version(version);

require('./commands/app')(program);
require('./commands/dev')(program);
require('./commands/start')(program);
require('./commands/doctor')(program);

program.parse(process.argv);