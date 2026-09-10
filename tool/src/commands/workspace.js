const chalk = require('chalk');
const logger = require('../cli/logger')('commands:workspace');
const { resolveConfig, loadGlobalConfig, saveGlobalConfig } = require('../config/config-manager');

module.exports = function workspaceCommand(program) {
    const ws = program
        .command('workspace')
        .description('Manage saved workspace combinations');

    ws
        .command('list')
        .description('List all available workspaces')
        .action(() => {
            const config = resolveConfig();
            const names = Object.keys(config.workspaces || {});
            if (names.length === 0) {
                logger.warning('No workspaces defined.');
                return;
            }
            logger.info('Available workspaces:');
            names.forEach((n) => {
                const desc = config.workspaces[n].description ? ` - ${config.workspaces[n].description}` : '';
                console.log(`  ${chalk.cyan(n)}${chalk.gray(desc)}`);
            });
        });

    ws
        .command('show <name>')
        .description('Show details of a specific workspace')
        .action((name) => {
            const config = resolveConfig();
            const workspace = (config.workspaces || {})[name];
            if (!workspace) {
                logger.error(`Workspace "${name}" not found.`);
                process.exit(1);
            }

            logger.highlight(`  Workspace: ${name}  `);
            if (workspace.description) {
                logger.info(`Description: ${workspace.description}`);
            }
            logger.info(`Apps     : ${(workspace.apps || []).join(', ') || 'None'}`);
            logger.info(`Commands : ${(workspace.commands || []).map(c => typeof c === 'string' ? c : c.id || c.run).join(', ') || 'None'}`);
        });

    ws
        .command('create <name>')
        .description('Create a new global workspace profile')
        .option('-a, --apps <apps>', 'Comma separated list of app IDs', (val) => val.split(',').map(s => s.trim()))
        .option('-d, --desc <desc>', 'Description of workspace')
        .action((name, options) => {
            const config = loadGlobalConfig();
            config.workspaces = config.workspaces || {};
            config.workspaces[name] = {
                description: options.desc || `Workspace profile for ${name}`,
                apps: options.apps || ['vscode', 'chrome'],
                commands: [],
            };
            saveGlobalConfig(config);
            logger.success(`Created workspace "${name}"`);
        });
};
