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
    // Not a named alias — treat as a raw shell command
    return id;
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
                    { cwd },
                );
            }

            for (const cmd of commands) {
                const cmdId = typeof cmd === 'string' ? cmd : cmd.id;
                const cmdSource = typeof cmd === 'string'
                    ? resolveCommandTarget(config.commands || {}, cmd)
                    : cmd.run || resolveCommandTarget(config.commands || {}, cmdId);

                const [file, ...args] = splitCommand(cmdSource);
                const resolvedCwd = cmd.cwd ? path.resolve(cwd, cmd.cwd) : cwd;

                // Smart pre-flight check: don't run node scripts if no package.json exists
                if ((file === 'npm' || file === 'yarn' || file === 'pnpm') && !require('fs').existsSync(path.join(resolvedCwd, 'package.json'))) {
                    logger.warning(`Skipping "${cmdSource}" - no package.json found in ${resolvedCwd}`);
                    continue;
                }

                // If the command looks like a URL, launch it with the app-adapter (detached)
                if (args.length === 1 && (args[0].startsWith('http://') || args[0].startsWith('https://'))) {
                    logger.info(`Opening URL "${args[0]}" with ${file}`);
                    const exePath = resolveAppTarget(config.apps || {}, file);
                    try {
                        const { spawn } = require('child_process');
                        spawn(exePath, [args[0]], { detached: true, stdio: 'ignore' }).unref();
                    } catch (err) {
                        logger.warning(`Failed to open URL "${args[0]}": ${err.message}`);
                    }
                    continue;
                }

                logger.info(`Starting "${cmdSource}"`);
                let child;
                try {
                    child = execa(file, args, {
                        cwd: cmd.cwd ? path.resolve(cwd, cmd.cwd) : cwd,
                        stdio: 'inherit',
                    });

                    if (cmd.wait) {
                        await child;
                    } else {
                        // Attach a catch handler so background processes don't crash the CLI on exit
                        child.catch((err) => {
                            logger.warning(`[Background] Command "${cmdSource}" exited or failed: ${err.shortMessage || err.message}`);
                        });
                    }
                } catch (err) {
                    logger.warning(`Failed to run command "${cmdSource}": ${err.shortMessage || err.message}`);
                }
            }

            return true;
        },
    };
}

module.exports = WorkspaceEngine;