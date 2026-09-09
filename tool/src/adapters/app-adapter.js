const open = require('open');
const logger = require('../cli/logger')('adapters:app');
const { getPlatformInfo } = require('./platform');

async function launchApp(appTarget, options = {}) {
    if (!appTarget) {
        throw new Error('No app target provided');
    }
    
    try {
        const isUrl = appTarget.startsWith('http://') || appTarget.startsWith('https://');
        const appLower = appTarget.toLowerCase();

        // If it's a URL or a browser/standalone app, just open it natively.
        // Chrome, Spotify, Postman usually ignore directory arguments or behave weirdly with them.
        if (isUrl || appLower.includes('chrome') || appLower.includes('spotify') || appLower.includes('postman')) {
            // For registered apps like "chrome.exe", we can just pass the string to open.
            // But open() prefers 'chrome' as the app name. However, since the user already had it working
            // using the direct string before my execa refactor, we just use their previously working method.
            
            // To ensure it opens the application by name itself:
            return await open(appTarget, { wait: false });
        }

        // For Editors (like VS Code), feed it the current directory 
        // This ensures hem opens VS Code exactly where you are standing!
        const cwd = options.cwd || process.cwd();
        return await open(cwd, {
            app: { name: appTarget },
            wait: false
        });

    } catch (err) {
        logger.warning(`Direct open failed for ${appTarget}: ${err.message}`);
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