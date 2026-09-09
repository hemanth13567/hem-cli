const fs = require('fs');
const chalk = require('chalk');
const logger = require('../cli/logger')('commands:doctor');
const { getPlatformInfo, scanInstalledApps } = require('../adapters/platform');
const { GLOBAL_CONFIG_FILE, GLOBAL_DIR } = require('../config/config-manager');

module.exports = function doctorCommand(program) {
    program
        .command('doctor')
        .description('Diagnose hem-cli configuration, OS compatibility, and installed tools')
        .action(async () => {
            logger.highlight('  HEM CLI DOCTOR DIAGNOSTICS  ');
            console.log();

            const platform = getPlatformInfo();
            logger.info(`OS Platform : ${chalk.cyan(platform.platform)} (${platform.arch})`);
            logger.info(`Node.js     : ${chalk.cyan(platform.nodeVersion)}`);
            logger.info(`Home Dir    : ${chalk.gray(platform.homeDir)}`);
            console.log();

            // Check config directory
            const configDirExists = fs.existsSync(GLOBAL_DIR);
            const configFileExists = fs.existsSync(GLOBAL_CONFIG_FILE);

            if (configDirExists) {
                logger.success(`✓ Global config dir exists: ${GLOBAL_DIR}`);
            } else {
                logger.warning(`! Global config dir missing: ${GLOBAL_DIR} (will be created automatically)`);
            }

            if (configFileExists) {
                logger.success(`✓ Global config file exists: ${GLOBAL_CONFIG_FILE}`);
            } else {
                logger.info(`i Global config file not created yet: ${GLOBAL_CONFIG_FILE} (using built-in defaults)`);
            }
            console.log();

            // Scan apps
            logger.info('Scanning installed development applications...');
            const detected = scanInstalledApps();
            const detectedKeys = Object.keys(detected);

            if (detectedKeys.length > 0) {
                detectedKeys.forEach((key) => {
                    logger.success(`  ✓ Detected ${chalk.bold(key)} at ${chalk.gray(detected[key])}`);
                });
            } else {
                logger.warning('  ! No standard applications auto-detected.');
            }

            console.log();
            logger.success('Diagnostics complete. Everything looks operational!');
        });
};
