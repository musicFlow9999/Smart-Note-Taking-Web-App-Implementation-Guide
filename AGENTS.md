# AGENTS.md

This document describes the interactions and roles of the AI agents involved in building the ContextFlow application, specifically using OpenAI Codex in collaboration with the VSCode development environment and the Claude agent.

## Agents Overview

### 1. **OpenAI Codex**

* **Role:** Primary code-generation agent.
* **Tasks:**

  * Generate code snippets and suggestions based on natural language prompts.
  * Provide real-time assistance in VSCode for completing code blocks, functions, and debugging issues.
  * Suggest best practices, design patterns, and code optimization techniques for React (frontend) and Node.js/GraphQL (backend).
  * Facilitate integration with external APIs, including OpenAI API and third-party tools like Zotero, Elasticsearch, and Neo4j.

### 2. **VSCode Agent**

* **Role:** Integrated Development Environment (IDE) support and environment management.
* **Tasks:**

  * Interface with OpenAI Codex via VSCode extensions, such as GitHub Copilot.
  * Automatically manage dependencies and provide real-time linting and syntax checking.
  * Offer built-in debugging tools, unit test integration, and deployment automation via task runners or scripts.
  * Manage version control workflows (Git), facilitating seamless code commits, merges, and pull requests.
  * **Codex Documentation Management:** Maintain rolling copies of `codexlastupdate.md` to assist Codex in analysis and code generation:
    
    **File Naming Convention:**
    ```
    codexlastupdate.md                    # Current/latest version
    codexlastupdate-YYYY-MM-DD-HHMMSS.md  # Timestamped archives
    ```
    
    **Archive Management:**
    - Keep up to 5 timestamped copies of `codexlastupdate.md`
    - Create new timestamped copy before each repository push
    - Remove oldest archive when exceeding 5 copies
    - Always maintain the current `codexlastupdate.md` as the primary reference
    
    **Timestamp Format:** Use ISO format `YYYY-MM-DD-HHMMSS` (e.g., `codexlastupdate-2025-06-11-143022.md`)
    
    **Purpose:** Provide Codex with historical context of code changes, implementation decisions, and evolution of the codebase for more informed code generation and suggestions.

### 3. **Claude Agent**

* **Role:** Conceptual and strategic agent for content and user-experience development.
* **Tasks:**

  * Provide detailed strategic insights, competitive analyses, and market positioning feedback.
  * Generate UX and feature-related recommendations for enhancing the ContextFlow platform.
  * Assist in crafting compelling user-facing documentation, help guides, and onboarding materials.
  * Deliver comprehensive summaries and context analysis to ensure the application meets defined user needs and business objectives.
  * **Repository Management:** Always ensure the following core dependencies are present in `backend/package.json` when pushing changes to the repository:
    
    **Production Dependencies:**
    ```json
    "dependencies": {
      "sql.js": "^1.8.0",
      "winston": "^3.11.0",
      "jsonwebtoken": "^9.0.2",
      "cors": "^2.8.5"
    }
    ```
    
    **Development Dependencies:**
    ```json
    "devDependencies": {
      "eslint": "^8.57.0",
      "prettier": "^3.1.1"
    }
    ```

## Interaction Workflow

1. **Feature Development Initiation:**

   * Claude analyzes market trends, user feedback, and competitive positioning to suggest optimal feature sets.
   * These insights feed into high-level project plans, roadmap adjustments, and detailed user stories.

2. **Coding and Implementation:**

   * Developers use natural language prompts in VSCode.
   * OpenAI Codex interprets these prompts and provides real-time code suggestions, snippets, and complete function implementations.
   * VSCode ensures code quality and manages development workflow (linting, testing, version control).

3. **Continuous Feedback Loop:**

   * Claude continuously monitors and provides feedback on user experience effectiveness, refining the scope and relevance of features.
   * Codex incorporates changes and improvements in real-time code suggestions.

4. **Quality Assurance and Deployment:**

   * VSCode automates unit testing, integration testing, and manages CI/CD pipelines.
   * Final code review and approval happen within VSCode, facilitated by Codex-generated suggestions.
   * **Dependency Verification:** Claude agent must verify that all required dependencies are present in `package.json` before any repository push operations.
   * **Configuration Integrity:** Ensure critical configuration files (`.eslintrc.json`, `.prettierrc.json`, `azure.json`) are not excluded by `.gitignore` rules.
   * **Documentation Archiving:** VSCode agent creates timestamped archive of `codexlastupdate.md` before each push and maintains rolling archive of up to 5 copies for Codex reference.

5. **Documentation and Knowledge Transfer:**

   * Claude assists in producing user-centric documentation and onboarding materials.
   * Codex supports technical documentation generation within codebases.

This structured collaboration between Codex, VSCode, and Claude ensures an efficient, intelligent, and streamlined development process for ContextFlow, effectively aligning technical implementation with strategic user experience and market considerations.
