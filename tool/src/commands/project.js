const chalk = require('chalk');
const logger = require('../cli/logger')('commands:project');
const { ProjectManager } = require('../core/project-manager');
const { resolveConfig } = require('../config/config-manager');
const WorkspaceEngine = require('../core/workspace-engine');

module.exports = function projectCommand(program) {
    const project = program
        .command('project')
        .description('Manage registered projects');

    project
        .command('add [dir] [name]')
        .description('Register a project directory (defaults to current working directory)')
        .action((dir, name) => {
            const targetDir = dir || process.cwd();
            try {
                const registered = ProjectManager.register(targetDir, name);
                logger.info(`Detected type: ${chalk.cyan(registered.type)} | Suggested workspace: ${chalk.green(registered.suggestedWorkspace)}`);
            } catch (err) {
                logger.error(err.message);
                process.exit(1);
            }
        });

    project
        .command('list')
        .description('List all registered projects')
        .action(() => {
            const projects = ProjectManager.list();
            const names = Object.keys(projects);
            if (names.length === 0) {
                logger.warning('No projects registered yet. Use "hem project add <path>"');
                return;
            }

            logger.info('Registered projects:');
            names.forEach((n) => {
                const p = projects[n];
                console.log(`  ${chalk.yellow(n)} -> ${chalk.gray(p.path)} (${chalk.cyan(p.type)})`);
            });
        });

    project
        .command('remove <name>')
        .description('Unregister a project')
        .action((name) => {
            try {
                ProjectManager.unregister(name);
            } catch (err) {
                logger.error(err.message);
                process.exit(1);
            }
        });

    project
        .command('dev <name>')
        .description('Launch dev workspace for a registered project')
        .action(async (name) => {
            const proj = ProjectManager.get(name);
            if (!proj) {
                logger.error(`Project "${name}" is not registered.`);
                process.exit(1);
            }

            logger.info(`Switching context to project "${name}" (${proj.path})`);
            const config = resolveConfig(proj.path);
            const engine = await WorkspaceEngine(config, { cwd: proj.path });

            const targetWorkspace = proj.suggestedWorkspace || 'dev';
            try {
                await engine.runWorkspace(targetWorkspace);
            } catch (err) {
                logger.error(err.message);
                process.exit(1);
            }
        });
};
