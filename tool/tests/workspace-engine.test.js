const WorkspaceEngine = require('../src/core/workspace-engine');

describe('Workspace Engine', () => {
    const mockConfig = {
        apps: {
            vscode: 'code',
            chrome: 'chrome',
        },
        commands: {
            testCmd: 'node -v',
        },
        workspaces: {
            mockWorkspace: {
                apps: ['vscode'],
                commands: ['testCmd'],
            },
        },
    };

    it('should instantiate launcher and resolve apps', async () => {
        const engine = await WorkspaceEngine(mockConfig);
        expect(engine.launcher).toBeDefined();
        expect(typeof engine.runWorkspace).toBe('function');
    });

    it('should throw when running non-existent workspace', async () => {
        const engine = await WorkspaceEngine(mockConfig);
        await expect(engine.runWorkspace('unknown-workspace')).rejects.toThrow('Unknown workspace "unknown-workspace"');
    });
});
