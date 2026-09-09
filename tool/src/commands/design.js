const logger = require('../cli/logger')('commands:design');
const { resolveConfig } = require('../config/config-manager');
const WorkspaceEngine = require('../core/workspace-engine');

module.exports = function designCommand(program) {
    program
        .command('design [profile]')
        .description('Launch design workspace profile (e.g. hem design, hem design ui, hem design graphics)')
        .action(async (profile) => {
            const targetWorkspace = profile ? `design.${profile}` : 'design';
            const config = resolveConfig();

            let workspace = config.workspaces[targetWorkspace];
            // Fallback to base 'design' workspace if specific profile is missing
            if (!workspace && profile) {
                logger.warning(`Workspace profile "${targetWorkspace}" not found. Falling back to "design" workspace.`);
                workspace = config.workspaces['design'];
            }

            if (!workspace) {
                logger.error('Design workspace is not defined in hem config.');
                process.exit(1);
            }

            const engine = await WorkspaceEngine(config);
            try {
                await engine.runWorkspace(profile && config.workspaces[targetWorkspace] ? targetWorkspace : 'design');
            } catch (err) {
                logger.error(err.message);
                process.exit(1);
            }
        });
};
