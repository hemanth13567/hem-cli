const { deepMerge, resolveConfig, loadGlobalConfig } = require('../src/config/config-manager');

describe('Config Manager', () => {
    it('should correctly deep merge objects', () => {
        const target = {
            apps: { vscode: 'code' },
            workspaces: { dev: { apps: ['vscode'] } }
        };
        const source = {
            apps: { chrome: 'chrome' },
            workspaces: { dev: { apps: ['vscode', 'chrome'] } }
        };

        const result = deepMerge(target, source);
        expect(result.apps).toEqual({ vscode: 'code', chrome: 'chrome' });
        expect(result.workspaces.dev.apps).toEqual(['vscode', 'chrome']);
    });

    it('should return valid resolved config with default workspaces', () => {
        const config = resolveConfig();
        expect(config).toBeDefined();
        expect(config.workspaces).toHaveProperty('dev');
        expect(config.workspaces).toHaveProperty('design');
    });

    it('should load global config object', () => {
        const globalConfig = loadGlobalConfig();
        expect(globalConfig).toBeDefined();
        expect(typeof globalConfig).toBe('object');
    });
});
