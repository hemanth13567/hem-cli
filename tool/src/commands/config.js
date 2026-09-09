const chalk = require('chalk');
const YAML = require('yaml');
const logger = require('../cli/logger')('commands:config');
const { GLOBAL_CONFIG_FILE, loadGlobalConfig, saveGlobalConfig, resolveConfig } = require('../config/config-manager');

module.exports = function configCommand(program) {
    const config = program
        .command('config')
        .description('Manage hem-cli global and local configuration');

    config
        .command('path')
        .description('Show path to global configuration file')
        .action(() => {
            logger.info(`Global config file: ${chalk.cyan(GLOBAL_CONFIG_FILE)}`);
        });

    config
        .command('show')
        .description('Display current merged configuration')
        .action(() => {
            const merged = resolveConfig();
            console.log(YAML.stringify(merged));
        });

    config
        .command('set <key> <value>')
        .description('Set a global config value (e.g. hem config set apps.vscode code)')
        .action((key, value) => {
            const current = loadGlobalConfig();
            const keys = key.split('.');
            let ptr = current;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!ptr[keys[i]] || typeof ptr[keys[i]] !== 'object') {
                    ptr[keys[i]] = {};
                }
                ptr = ptr[keys[i]];
            }
            ptr[keys[keys.length - 1]] = value;
            saveGlobalConfig(current);
            logger.success(`Set ${key} = "${value}"`);
        });

    config
        .command('completion [shell]')
        .description('Generate shell autocomplete script (bash, zsh, powershell)')
        .action((shell = 'bash') => {
            const { generateCompletion } = require('../cli/completions');
            console.log(generateCompletion(shell));
        });
};
