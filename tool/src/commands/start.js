const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { select } = require('@inquirer/prompts');
const ora = require('ora');
const logger = require('../cli/logger')('commands:start');
const { resolveConfig } = require('../config/config-manager');
const WorkspaceEngine = require('../core/workspace-engine');

function detectProjectContext(cwd = process.cwd()) {
    const hints = [];
    if (fs.existsSync(path.join(cwd, 'package.json'))) hints.push('node / javascript project');
    if (fs.existsSync(path.join(cwd, 'docker-compose.yml'))
        || fs.existsSync(path.join(cwd, 'docker-compose.yaml'))) hints.push('docker');
    if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) hints.push('rust project');
    if (fs.existsSync(path.join(cwd, 'go.mod'))) hints.push('go project');
    if (fs.existsSync(path.join(cwd, 'pyproject.toml'))
        || fs.existsSync(path.join(cwd, 'requirements.txt'))) hints.push('python project');
    return hints;
}

module.exports = function startCommand(program) {
    program
        .command('start')
        .description('Interactive wizard that detects project context and launches a workspace')
        .action(async () => {
            const config = resolveConfig();
            const loggerBox = require('../cli/logger')('commands:start:box');
            loggerBox.box('HEM CLI', { title: 'Personal OS Layer', borderColor: 'magenta' });

            const workspaces = config.workspaces || {};
            const names = Object.keys(workspaces);

            const detected = detectProjectContext();
            if (detected.length) {
                logger.info(`Detected context: ${chalk.cyan(detected.join(', '))}`);
            }

            if (names.length === 0) {
                logger.warning('No workspaces configured. Create one under "workspaces:" in your hem config.');
                return;
            }

            const answer = await select({
                message: 'What are you doing?',
                choices: names.map((name) => ({ name, value: name })),
            });

            const spinner = ora(`Starting workspace "${answer}"`).start();
            const engine = await WorkspaceEngine(config);

            try {
                await engine.runWorkspace(answer);
                spinner.succeed(`Workspace "${answer}" launched`);
            } catch (err) {
                spinner.fail(err.message);
                process.exit(1);
            }
        });
};