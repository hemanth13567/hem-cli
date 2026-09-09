const chalk = require('chalk');
const debug = require('debug');
const boxen = require('boxen');

module.exports = function createLogger(name) {
    return {
        log: (...args) => console.log(chalk.gray(...args)),
        info: (...args) => console.log(chalk.white(...args)),
        success: (...args) => console.log(chalk.green(...args)),
        warning: (...args) => console.log(chalk.yellow(...args)),
        error: (...args) => console.log(chalk.red(...args)),
        highlight: (...args) => console.log(chalk.bgCyanBright.black(...args)),
        box: (text, options) => console.log(boxen(text, {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'cyan',
            ...options,
        })),
        debug: debug(name)
    };
};