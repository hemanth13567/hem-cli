const os = require('os');
const path = require('path');
const fs = require('fs');
const logger = require('../cli/logger')('config:mgr');
const { cosmiconfigSync } = require('cosmiconfig');
const Ajv = require('ajv');
const betterAjvErrors = require('better-ajv-errors');
const YAML = require('yaml');

const schema = {
    type: 'object',
    properties: {
        apps: { type: 'object', additionalProperties: { type: 'string' } },
        commands: { type: 'object', additionalProperties: { type: 'string' } },
        workspaces: {
            type: 'object',
            additionalProperties: {
                type: 'object',
                properties: {
                    apps: { type: 'array', items: { type: 'string' } },
                    commands: { type: 'array', items: { type: 'string' } },
                },
                additionalProperties: true,
            },
        },
    },
    additionalProperties: true,
};

const ajv = new Ajv({ jsonPointers: true, allErrors: true });
const validate = ajv.compile(schema);

const configLoader = cosmiconfigSync('hem', {
    searchPlaces: ['hem.yaml', 'hem.yml', 'hem.json', 'hem.config.js', '.hemrc'],
});

const GLOBAL_DIR = process.env.HEM_CONFIG_DIR
    || path.join(os.homedir(), '.config', 'hem');
const GLOBAL_CONFIG_FILE = process.env.HEM_CONFIG_FILE
    || path.join(GLOBAL_DIR, 'config.yaml');

function ensureGlobalDir() {
    fs.mkdirSync(GLOBAL_DIR, { recursive: true });
}

function loadGlobalConfig() {
    if (!fs.existsSync(GLOBAL_CONFIG_FILE)) {
        return { apps: {}, commands: {}, workspaces: {} };
    }
    const raw = fs.readFileSync(GLOBAL_CONFIG_FILE, 'utf8');
    const parsed = YAML.parse(raw) || {};
    return parsed;
}

function saveGlobalConfig(config) {
    ensureGlobalDir();
    fs.writeFileSync(GLOBAL_CONFIG_FILE, YAML.stringify(config), 'utf8');
}

function loadLocalConfig(startDir = process.cwd()) {
    const result = configLoader.search(startDir);
    if (!result) {
        return null;
    }
    return result.config;
}

function deepMerge(target, source) {
    const output = { ...target };
    for (const key of Object.keys(source)) {
        if (
            source[key] && typeof source[key] === 'object'
            && !Array.isArray(source[key])
            && target[key] && typeof target[key] === 'object'
            && !Array.isArray(target[key])
        ) {
            output[key] = deepMerge(target[key], source[key]);
        } else {
            output[key] = source[key];
        }
    }
    return output;
}

function resolveConfig(startDir = process.cwd()) {
    const global = loadGlobalConfig();
    const local = loadLocalConfig(startDir);
    const merged = local ? deepMerge(global, local) : global;

    if (!validate(merged)) {
        logger.error('Invalid configuration was supplied');
        console.log();
        console.log(betterAjvErrors(schema, merged, validate.errors));
        process.exit(1);
    }

    return merged;
}

module.exports = {
    GLOBAL_DIR,
    GLOBAL_CONFIG_FILE,
    resolveConfig,
    loadGlobalConfig,
    saveGlobalConfig,
    loadLocalConfig,
    deepMerge,
};