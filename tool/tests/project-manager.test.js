const path = require('path');
const { detectProject, ProjectManager } = require('../src/core/project-manager');

describe('Project Manager', () => {
    it('should detect node project context from tool directory', () => {
        const toolDir = path.resolve(__dirname, '..');
        const detected = detectProject(toolDir);

        expect(detected).not.toBeNull();
        expect(detected.name).toBe('tool');
        expect(detected.type).toBe('node');
        expect(detected.features).toContain('Node.js');
    });

    it('should register and retrieve a project', () => {
        const toolDir = path.resolve(__dirname, '..');
        const registered = ProjectManager.register(toolDir, 'hem-tool-test');

        expect(registered).toBeDefined();
        expect(registered.path).toBe(toolDir);

        const retrieved = ProjectManager.get('hem-tool-test');
        expect(retrieved).not.toBeNull();
        expect(retrieved.path).toBe(toolDir);

        // Cleanup
        ProjectManager.unregister('hem-tool-test');
        expect(ProjectManager.get('hem-tool-test')).toBeNull();
    });
});
