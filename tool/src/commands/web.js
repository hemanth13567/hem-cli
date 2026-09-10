const logger = require('../cli/logger')('commands:web');
const { resolveConfig } = require('../config/config-manager');
const WorkspaceEngine = require('../core/workspace-engine');

module.exports = function webCommand(program) {
    program
        .command('web')
        .description('Launch web / browser oriented workspace')
        .action(async () => {
            const config = resolveConfig();
            const engine = await WorkspaceEngine(config);
            try {
                await engine.runWorkspace('web');
            } catch (err) {
                logger.error(err.message);
                process.exit(1);
            }
        });
};
