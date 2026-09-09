const chalk = require('chalk');
const logger = require('../cli/logger')('commands:app');
const {
    loadGlobalConfig,
    saveGlobalConfig,
    GLOBAL_CONFIG_FILE,
} = require('../config/config-manager');
const { scanInstalledApps } = require('../adapters/platform');

module.exports = function appCommand(program) {
    const app = program
        .command('app')
        .description('Manage registered applications');

    app.command('add <id> [target]')
        .description('Register an application (defaults target to id if omitted)')
        .action((id, target) => {
            const config = loadGlobalConfig();
            config.apps = config.apps || {};
            config.apps[id] = target || id;
            saveGlobalConfig(config);
            logger.success(`Registered application "${id}" -> "${target || id}"`);
            logger.info(`Stored in ${chalk.gray(GLOBAL_CONFIG_FILE)}`);
        });

    app.command('remove <id>')
        .description('Unregister an application')
        .action((id) => {
            const config = loadGlobalConfig();
            config.apps = config.apps || {};
            if (!(id in config.apps)) {
                logger.warning(`Application "${id}" is not registered`);
                return;
            }
            delete config.apps[id];
            saveGlobalConfig(config);
            logger.success(`Removed application "${id}"`);
        });

    app.command('list')
        .description('List registered applications')
        .action(() => {
            const config = loadGlobalConfig();
            const apps = config.apps || {};
            const ids = Object.keys(apps);
            if (ids.length === 0) {
                logger.warning('No applications registered yet. Use "hem app add <id>"');
                return;
            }
            logger.info('Registered applications:');
            ids.forEach((id) => console.log(`  ${chalk.green(id)} -> ${chalk.gray(apps[id])}`));
        });

    app.command('scan')
        .description('Scan machine for installed development applications')
        .action(() => {
            logger.info('Scanning system for installed tools...');
            const detected = scanInstalledApps();
            const keys = Object.keys(detected);

            if (keys.length === 0) {
                logger.warning('No standard applications detected automatically.');
                return;
            }

            logger.info('Detected applications on your system:');
            const config = loadGlobalConfig();
            config.apps = config.apps || {};

            keys.forEach((key) => {
                const appPath = detected[key];
                config.apps[key] = appPath;
                console.log(`  ✓ ${chalk.green(key)} -> ${chalk.gray(appPath)}`);
            });

            saveGlobalConfig(config);
            logger.success(`Automatically registered ${keys.length} application(s) to global config.`);
        });
};