# 🚀 Hem-CLI (v2 Architecture)

> **`hem` = Your personal workstation launcher & developer cockpit.**

Instead of manually navigating to project directories and launching applications individually, `hem` orchestrates your software development, design, and research environments instantly based on domain intent and project context.

---

## 🏗️ Core Architecture & Boundaries

```
                     ┌───────────────┐
                     │    hem CLI    │
                     └───────┬───────┘
                             │
                  ┌──────────▼──────────┐
                  │    Command Router   │
                  └──────────┬──────────┘
                             │
       ┌─────────────┬───────┼────────┬─────────────┐
       │             │       │        │             │
       ▼             ▼       ▼        ▼             ▼
     dev          design   project    app         config
       │             │       │        │
       └─────────────┴───────┴────────┘
                             │
                    ┌────────▼────────┐
                    │ Workspace Engine│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
           Apps          Commands        Projects
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    ┌────────────────┐
                    │ App/OS Adapter │
                    └───────┬────────┘
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
               macOS     Windows     Linux
```

---

## 🛠️ Tech Stack

| Package                            | Purpose                                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| 🟢 **Commander.js**                | Command routing, options, and subcommand management                                                 |
| ⚙️ **Cosmiconfig** & **AJV**       | Global (`~/.config/hem/config.yaml`) & local (`hem.yaml`) configuration with JSON schema validation |
| 🚀 **Execa**                       | Safe background process execution and command spawning                                              |
| 🌐 **Open**                        | OS-agnostic application launcher (Windows / macOS / Linux)                                          |
| 🎨 **Chalk** & **Boxen**           | TTY-aware color styling and boxed UI containers                                                     |
| 🧙 **@inquirer/prompts** & **Ora** | Interactive terminal wizard (`hem start`) & loading spinners                                        |
| 🧪 **Jest**                        | Automated unit and integration testing suite                                                        |

---

## 💻 Domain Commands Reference

```bash
hem start               # Interactive context-aware workstation launcher wizard
hem dev [workspace]     # Launch dev workspace profile (e.g. hem dev frontend, hem dev backend)
hem design [profile]    # Launch creative design environment (e.g. hem design ui, hem design graphics)
hem web                 # Launch browser-oriented workspace
hem work                # Launch general work environment

hem app add <id> [path] # Register an application
hem app scan            # Auto-detect applications on your local machine
hem app list            # List registered applications

hem project add [path]  # Register project with auto-detection (Node, React, Rust, Go, Docker)
hem project dev <name>  # Launch workspace tuned for specific project

hem workspace list      # Show configured workspace profiles
hem workspace show <id> # Inspect apps and commands in a workspace

hem doctor              # Run system & configuration diagnostics
hem status              # Display active context, registered apps, and workspaces
hem config show         # Display merged configuration YAML
hem config completion   # Output shell autocomplete script (bash, zsh, powershell)
```

---

## ⚙️ Configuration Example (`hem.yaml`)

```yaml
apps:
  vscode: code
  chrome: chrome
  figma: figma

commands:
  dev-server: npm run dev
  docker-up: docker-compose up -d

workspaces:
  dev:
    description: "General coding workspace"
    apps:
      - vscode
      - terminal
  frontend:
    description: "Frontend development workstation"
    apps:
      - vscode
      - chrome
    commands:
      - dev-server
  design:
    description: "UI & graphics environment"
    apps:
      - figma
      - chrome
```

---

## 🧪 Running Tests

```bash
cd tool
npm test
```
