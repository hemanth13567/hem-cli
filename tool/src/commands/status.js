const chalk = require('chalk');
const logger = require('../cli/logger')('commands:status');
const { resolveConfig } = require('../config/config-manager');
const { detectProject } = require('../core/project-manager');

module.exports = function statusCommand(program) {
    program
        .command('status')
        .description('Show current hem-cli environment status, apps, workspaces, and project context')
        .action(() => {
            const config = resolveConfig();
            logger.box('HEM CLI STATUS', { borderColor: 'cyan' });

            // Project context
            const localProject = detectProject(process.cwd());
            if (localProject) {
                logger.info(`Current Directory Context: ${chalk.bold.yellow(localProject.name)}`);
                logger.info(`Detected Features        : ${chalk.cyan(localProject.features.join(', ') || 'General')}`);
                logger.info(`Suggested Workspace      : ${chalk.green(localProject.suggestedWorkspace)}`);
            } else {
                logger.info(`Current Directory Context: ${chalk.gray(process.cwd())}`);
            }
            console.log();

            // Workspaces
            const workspaces = Object.keys(config.workspaces || {});
            logger.info(`Configured Workspaces (${workspaces.length}):`);
            workspaces.forEach((w) => {
                const desc = config.workspaces[w].description ? ` - ${config.workspaces[w].description}` : '';
                console.log(`  ${chalk.cyan(w)}${chalk.gray(desc)}`);
            });
            console.log();

            // Registered Apps
            const apps = Object.keys(config.apps || {});
            logger.info(`Registered Apps (${apps.length}):`);
            apps.forEach((a) => {
                console.log(`  ${chalk.green(a)} -> ${chalk.gray(config.apps[a])}`);
            });
            console.log();

            // Registered Projects
            const projects = Object.keys(config.projects || {});
            logger.info(`Registered Projects (${projects.length}):`);
            if (projects.length === 0) {
                console.log(`  ${chalk.gray('None registered yet. Use "hem project add <path>"')}`);
            } else {
                projects.forEach((p) => {
                    console.log(`  ${chalk.yellow(p)} (${config.projects[p].path})`);
                });
            }
        });
};
