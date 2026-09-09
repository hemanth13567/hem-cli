const logger = require('../cli/logger')('commands:dev');
const { resolveConfig } = require('../config/config-manager');
const WorkspaceEngine = require('../core/workspace-engine');

module.exports = function devCommand(program) {
    program
        .command('dev [workspace]')
        .description('Launch a workspace (apps + commands) defined in config')
        .option('-l, --list', 'List available workspaces')
        .action(async (workspace, options) => {
            const config = resolveConfig();

            if (options.list) {
                const names = Object.keys(config.workspaces || {});
                if (names.length === 0) {
                    logger.warning('No workspaces defined. Add a "workspaces" section to your config.');
                    return;
                }
                logger.info('Available workspaces:');
                names.forEach((n) => console.log(`  - ${n}`));
                return;
            }

            if (!workspace) {
                logger.error('Please specify a workspace, e.g. "hem dev backend"');
                logger.info('Hint: "hem dev --list" shows available workspaces.');
                process.exit(1);
            }

            const engine = await WorkspaceEngine(config);
            try {
                await engine.runWorkspace(workspace);
            } catch (err) {
                logger.error(err.message);
                process.exit(1);
            }
        });
};