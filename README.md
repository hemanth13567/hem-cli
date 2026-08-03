# 🚀 Hem-CLI

**A powerful, config-driven Command Line Interface tool.**

---

## 🎀 Overview

This repo is my demo project for creating my own CLI tool natively. **Hem-CLI** is a robust and flexible command-line tool designed for streamlined development workflows. Built with a heavy emphasis on modularity, config validation, and developer experience through clean, colorized, and namespaced debug logging.

## 🛠️ Technology Stack & Packages

The tool leverages modern npm packages to provide a stellar experience:

| Package                                                                     | Purpose                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 🟢 [**Node.js**](https://nodejs.org/)                                       | Runtime environment.                                                |
| 🎨 [**chalk**](https://www.npmjs.com/package/chalk)                         | Terminal string styling to make outputs gorgeous.                   |
| 🐛 [**debug**](https://www.npmjs.com/package/debug)                         | Lightweight namespace-driven debugging utility.                     |
| ⚙️ [**cosmiconfig**](https://www.npmjs.com/package/cosmiconfig)             | Hunts for configuration files seamlessly (`tool.config.js`).        |
| 🛡️ [**ajv**](https://ajv.js.org/)                                          | JSON Schema validator to ensure robust config structures.           |
| 🚨 [**better-ajv-errors**](https://www.npmjs.com/package/better-ajv-errors) | Human-readable and intuitive error messages for format validations. |
| ⌨️ [**arg**](https://www.npmjs.com/package/arg)                             | Simple, robust command-line argument parsing.                       |

## 🚀 Getting Started

### 1. Installation

Run this in your terminal to properly install dependencies using npm:

```bash
cd tool
npm install
```

### 2. Available Commands

Start the application by passing the `--start` flag. Prefix the execution with `DEBUG=*` to get detailed visibility into what the CLI is executing internally.

```bash
# General Usage
tool [CMD]

# Examples
DEBUG=* tool --start
tool --build
```

---
