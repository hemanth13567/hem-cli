const path = require('path');
const execa = require('execa');
const logger = require('../cli/logger')('core:workspace');
const { createAppLauncher } = require('../adapters/app-adapter');

function resolveAppTarget(apps, id) {
    for (const key of Object.keys(apps)) {
        if (key.toLowerCase() === id.toLowerCase()) {
            return apps[key];
        }
    }
    return id;
}

function resolveCommandTarget(commands, id) {
    for (const key of Object.keys(commands)) {
        if (key.toLowerCase() === id.toLowerCase()) {
            return commands[key];
        }
    }
    throw new Error(`Unknown command "${id}". Define it under "commands:" in your hem config.`);
}

function splitCommand(cmd) {
    if (Array.isArray(cmd)) {
        return cmd;
    }
    return cmd.split(/\s+/).filter(Boolean);
}

async function WorkspaceEngine(config, options = {}) {
    const appLauncher = createAppLauncher();
    const cwd = options.cwd || process.cwd();

    return {
        launcher: appLauncher,

        launchApps: (ids) => {
            const targets = ids.map((id) => resolveAppTarget(config.apps || {}, id));
            return appLauncher.launchMany(targets);
        },

        runCommand: async (id, runOptions = {}) => {
            const cmd = resolveCommandTarget(config.commands || {}, id);
            const [file, ...args] = splitCommand(cmd);
            logger.info(`Running "${cmd}" in ${cwd}`);
            return execa(file, args, { cwd, stdio: 'inherit', ...runOptions });
        },

        runWorkspace: async (name) => {
            const workspace = (config.workspaces || {})[name];
            if (!workspace) {
                throw new Error(
                    `Unknown workspace "${name}". Available: ${Object.keys(config.workspaces || {}).join(', ') || 'none'}`,
                );
            }

            const apps = workspace.apps || [];
            const commands = workspace.commands || [];

            logger.highlight(`  Workspace: ${name}  `);

            if (apps.length) {
                await appLauncher.launchMany(
                    apps.map((id) => resolveAppTarget(config.apps || {}, id)),
                );
            }

            for (const cmd of commands) {
                const cmdId = typeof cmd === 'string' ? cmd : cmd.id;
                const cmdSource = typeof cmd === 'string'
                    ? resolveCommandTarget(config.commands || {}, cmd)
                    : cmd.run || resolveCommandTarget(config.commands || {}, cmdId);

                const [file, ...args] = splitCommand(cmdSource);
                logger.info(`Starting "${cmdSource}"`);
                const child = execa(file, args, {
                    cwd: cmd.cwd ? path.resolve(cwd, cmd.cwd) : cwd,
                    stdio: 'inherit',
                });

                if (cmd.wait) {
                    await child;
                }
            }

            return true;
        },
    };
}

module.exports = WorkspaceEngine;