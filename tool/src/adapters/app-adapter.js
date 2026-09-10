const open = require('open');
const execa = require('execa');
const logger = require('../cli/logger')('adapters:app');
const { getPlatformInfo } = require('./platform');

async function launchApp(appTarget, options = {}) {
    if (!appTarget) {
        throw new Error('No app target provided');
    }

    try {
        const appLower = appTarget.toLowerCase();
        const cwd = options.cwd || process.cwd();

        // IDE-type apps: pass the project directory so they open into the right folder
        const isIde = appLower.includes('code.exe')    // VS Code
                   || appLower.includes('code')
                   || appLower.includes('idea')
                   || appLower.includes('webstorm')
                   || appLower.includes('fleet');

        if (isIde) {
            logger.info(`Launching IDE "${appTarget}" in ${cwd}`);
            const { spawn } = require('child_process');
            spawn(appTarget, [cwd], { detached: true, stdio: 'ignore' }).unref();
            return;
        }

        // Everything else (browsers, DaVinci, ClipShlip, Word, terminals, etc.)
        // → launch the executable with NO path argument to avoid opening the folder
        logger.info(`Launching "${appTarget}"`);
        const { spawn } = require('child_process');
        spawn(appTarget, [], { detached: true, stdio: 'ignore' }).unref();

    } catch (err) {
        logger.warning(`Failed to launch ${appTarget}: ${err.message}`);
        throw err;
    }
}


function createAppLauncher() {
    const platformInfo = getPlatformInfo();
    return {
        platform: platformInfo.platform,
        platformInfo,
        launch: launchApp,
        launchMany: async (targets, options = {}) => {
            const results = [];
            for (const target of targets) {
                try {
                    const child = await launchApp(target, options);
                    logger.success(`Launched ${target}`);
                    results.push({ target, ok: true, child });
                } catch (err) {
                    logger.error(`Failed to launch ${target}: ${err.message}`);
                    results.push({ target, ok: false, error: err });
                }
            }
            return results;
        },
    };
}

module.exports = {
    createAppLauncher,
    launchApp,
};