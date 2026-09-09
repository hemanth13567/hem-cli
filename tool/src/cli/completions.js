/**
 * Generate shell completion scripts for hem-cli commands.
 */
function generateCompletion(shell = 'bash') {
    if (shell === 'powershell') {
        return `
Register-ArgumentCompleter -Native -CommandName 'hem' -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)
    $subcommands = @('dev', 'design', 'web', 'work', 'project', 'app', 'workspace', 'config', 'doctor', 'status', 'start')
    $subcommands | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
    }
}
`;
    }

    if (shell === 'zsh') {
        return `
#compdef hem
_hem() {
    local -a commands
    commands=(
        'dev:coding / development workspace'
        'design:graphic / UI / creative workspace'
        'web:browser-oriented workspace'
        'work:general work environment'
        'project:manage registered projects'
        'app:manage applications'
        'workspace:saved combinations of apps/projects'
        'config:configuration'
        'doctor:diagnose configuration and apps'
        'status:environment status'
        'start:interactive workspace wizard'
    )
    _describe 'hem commands' commands
}
compdef _hem hem
`;
    }

    // Default to bash completion script
    return `
_hem_completions() {
    local cur="\${COMP_WORDS[COMP_CWORD]}"
    local cmds="dev design web work project app workspace config doctor status start"
    COMPREPLY=( $(compgen -W "\${cmds}" -- "\${cur}") )
}
complete -F _hem_completions hem
`;
}

module.exports = {
    generateCompletion,
};
