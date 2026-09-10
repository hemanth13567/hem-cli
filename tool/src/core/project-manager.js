const fs = require('fs');
const path = require('path');
const { loadGlobalConfig, saveGlobalConfig } = require('../config/config-manager');
const logger = require('../cli/logger')('core:project');

/**
 * Detect project type and configuration from target directory.
 */
function detectProject(targetDir = process.cwd()) {
    const absPath = path.resolve(targetDir);
    if (!fs.existsSync(absPath)) {
        return null;
    }

    const name = path.basename(absPath);
    const result = {
        name,
        path: absPath,
        type: 'unknown',
        suggestedWorkspace: 'dev',
        features: [],
    };

    if (fs.existsSync(path.join(absPath, 'package.json'))) {
        result.type = 'node';
        result.features.push('Node.js');
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(absPath, 'package.json'), 'utf8'));
            if (pkg.dependencies?.react || pkg.devDependencies?.react) {
                result.type = 'react';
                result.suggestedWorkspace = 'frontend';
                result.features.push('React');
            } else if (pkg.dependencies?.express || pkg.dependencies?.fastify || pkg.dependencies?.nestjs) {
                result.type = 'backend';
                result.suggestedWorkspace = 'backend';
                result.features.push('API Server');
            }
        } catch {
            // Ignore JSON read error
        }
    }

    if (fs.existsSync(path.join(absPath, 'docker-compose.yml')) || fs.existsSync(path.join(absPath, 'docker-compose.yaml'))) {
        result.features.push('Docker');
    }

    if (fs.existsSync(path.join(absPath, 'Cargo.toml'))) {
        result.type = 'rust';
        result.suggestedWorkspace = 'dev';
        result.features.push('Rust');
    }

    if (fs.existsSync(path.join(absPath, 'go.mod'))) {
        result.type = 'go';
        result.suggestedWorkspace = 'backend';
        result.features.push('Go');
    }

    if (fs.existsSync(path.join(absPath, 'pyproject.toml')) || fs.existsSync(path.join(absPath, 'requirements.txt'))) {
        result.type = 'python';
        result.features.push('Python');
    }

    if (fs.existsSync(path.join(absPath, '.git'))) {
        result.features.push('Git');
    }

    return result;
}

/**
 * Manage project registrations in global configuration.
 */
class ProjectManager {
    static register(projectPath, customName) {
        const absPath = path.resolve(projectPath);
        const info = detectProject(absPath);
        if (!info) {
            throw new Error(`Directory does not exist: ${projectPath}`);
        }

        const name = customName || info.name;
        const config = loadGlobalConfig();
        config.projects = config.projects || {};
        config.projects[name] = {
            path: absPath,
            type: info.type,
            features: info.features,
            suggestedWorkspace: info.suggestedWorkspace,
            registeredAt: new Date().toISOString(),
        };

        saveGlobalConfig(config);
        logger.success(`Registered project "${name}" (${absPath})`);
        return config.projects[name];
    }

    static unregister(name) {
        const config = loadGlobalConfig();
        config.projects = config.projects || {};
        if (!config.projects[name]) {
            throw new Error(`Project "${name}" is not registered`);
        }

        delete config.projects[name];
        saveGlobalConfig(config);
        logger.success(`Unregistered project "${name}"`);
    }

    static list() {
        const config = loadGlobalConfig();
        return config.projects || {};
    }

    static get(name) {
        const projects = ProjectManager.list();
        return projects[name] || null;
    }
}

module.exports = {
    detectProject,
    ProjectManager,
};
