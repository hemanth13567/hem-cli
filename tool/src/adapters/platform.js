const os = require('os');
const path = require('path');
const fs = require('fs');

/**
 * Get normalized operating system information.
 */
function getPlatformInfo() {
    const type = process.platform;
    return {
        isWindows: type === 'win32',
        isMac: type === 'darwin',
        isLinux: type === 'linux',
        platform: type,
        arch: process.arch,
        nodeVersion: process.version,
        homeDir: os.homedir(),
        tempDir: os.tmpdir(),
    };
}

/**
 * Common application binary candidates per platform.
 */
const KNOWN_APPS = {
    vscode: {
        win32: ['code.cmd', 'code.exe', path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'Code.exe')],
        darwin: ['/Applications/Visual Studio Code.app', 'code'],
        linux: ['code', '/usr/bin/code']
    },
    chrome: {
        win32: [
            'chrome.exe',
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        ],
        darwin: ['/Applications/Google Chrome.app', 'google-chrome'],
        linux: ['google-chrome', 'chromium-browser', 'chromium']
    },
    figma: {
        win32: [path.join(process.env.LOCALAPPDATA || '', 'Figma', 'Figma.exe')],
        darwin: ['/Applications/Figma.app'],
        linux: ['figma-linux', 'figma']
    },
    docker: {
        win32: ['docker.exe', 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe'],
        darwin: ['/Applications/Docker.app', 'docker'],
        linux: ['docker']
    },
    postman: {
        win32: [path.join(process.env.LOCALAPPDATA || '', 'Postman', 'Postman.exe')],
        darwin: ['/Applications/Postman.app', 'postman'],
        linux: ['postman']
    },
    spotify: {
        win32: [path.join(process.env.APPDATA || '', 'Spotify', 'Spotify.exe')],
        darwin: ['/Applications/Spotify.app', 'spotify'],
        linux: ['spotify']
    }
};

/**
 * Scan machine for installed applications based on platform.
 */
function scanInstalledApps() {
    const platform = process.platform;
    const detected = {};

    for (const [appId, targets] of Object.entries(KNOWN_APPS)) {
        const candidates = targets[platform] || [];
        for (const candidate of candidates) {
            if (!candidate) continue;
            if (fs.existsSync(candidate) || candidate.indexOf(path.sep) === -1) {
                detected[appId] = candidate;
                break;
            }
        }
    }

    return detected;
}

module.exports = {
    getPlatformInfo,
    KNOWN_APPS,
    scanInstalledApps,
};
