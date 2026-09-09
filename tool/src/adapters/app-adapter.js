const open = require('open');
const logger = require('../cli/logger')('adapters:app');

function launchApp(appTarget, options = {}) {
    if (!appTarget) {
        throw new Error('No app target provided');
    }
    return open(appTarget, {
        wait: false,
        ...options,
    });
}

function createAppLauncher() {
    return {
        platform: process.platform,
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