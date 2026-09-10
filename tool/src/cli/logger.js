const chalk = require('chalk');
const debug = require('debug');
const boxen = require('boxen');

// Check if output is TTY or colored output disabled
const supportsColor = Boolean(process.stdout.isTTY && !process.env.NO_COLOR);

function colorize(colorFn, text) {
    return supportsColor ? colorFn(text) : text;
}

module.exports = function createLogger(name) {
    return {
        log: (...args) => console.log(...args.map(a => typeof a === 'string' ? colorize(chalk.gray, a) : a)),
        info: (...args) => console.log(...args.map(a => typeof a === 'string' ? colorize(chalk.white, a) : a)),
        success: (...args) => console.log(...args.map(a => typeof a === 'string' ? colorize(chalk.green, a) : a)),
        warning: (...args) => console.warn(...args.map(a => typeof a === 'string' ? colorize(chalk.yellow, a) : a)),
        error: (...args) => console.error(...args.map(a => typeof a === 'string' ? colorize(chalk.red, a) : a)),
        highlight: (...args) => console.log(...args.map(a => typeof a === 'string' ? colorize(chalk.bgCyanBright.black, a) : a)),
        box: (text, options = {}) => {
            if (!supportsColor) {
                console.log(`--- ${options.title || 'HEM CLI'} ---\n${text}\n---`);
                return;
            }
            console.log(boxen(text, {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'cyan',
                ...options,
            }));
        },
        debug: debug(`hem:${name}`)
    };
};