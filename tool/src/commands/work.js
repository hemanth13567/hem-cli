const logger = require('../cli/logger')('commands:work');
const { resolveConfig } = require('../config/config-manager');
const WorkspaceEngine = require('../core/workspace-engine');

module.exports = function workCommand(program) {
    program
        .command('work')
        .description('Launch general work workstation environment')
        .action(async () => {
            const config = resolveConfig();
            const engine = await WorkspaceEngine(config);
            try {
                await engine.runWorkspace('work');
            } catch (err) {
                logger.error(err.message);
                process.exit(1);
            }
        });
};
