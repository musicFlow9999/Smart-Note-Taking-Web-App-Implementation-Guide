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
  * **Context Awareness:** Always maintain `MainGoal.md` in context when generating code to ensure alignment with ContextFlow's vision, feature requirements, and technical architecture specifications.

### 2. **Claude Sonnet Agent (VSCode Integration)**

* **Role:** Integrated Development Environment (IDE) support, environment management, and strategic development guidance.
* **Tasks:**

  * Interface with OpenAI Codex via VSCode extensions, such as GitHub Copilot.
  * Automatically manage dependencies and provide real-time linting and syntax checking.
  * Offer built-in debugging tools, unit test integration, and deployment automation via task runners or scripts.
  * Manage version control workflows (Git), facilitating seamless code commits, merges, and pull requests.
  * Provide detailed strategic insights, competitive analyses, and market positioning feedback.
  * Generate UX and feature-related recommendations for enhancing the ContextFlow platform.
  * Assist in crafting compelling user-facing documentation, help guides, and onboarding materials.
  * Deliver comprehensive summaries and context analysis to ensure the application meets defined user needs and business objectives.
  * **Context Awareness:** Always reference `MainGoal.md` to ensure development decisions align with ContextFlow's product vision, target audience, core features, and business objectives.
  * **Codex Documentation Management:** Maintain rolling copies of `codexlastupdate.md` to assist Codex in analysis and code generation. Claude Sonnet mirrors this process with `claudes4lastupdate.md` so Codex knows the latest changes from Claude:
    
    **File Naming Convention:**
    ```
    codexlastupdate.md                    # Current/latest version
    codexlastupdate-YYYY-MM-DD-HHMMSS.md  # Timestamped archives
    claudes4lastupdate.md                 # Latest updates from Claude
    claudes4lastupdate-YYYY-MM-DD-HHMMSS.md # Claude's timestamped archives
    ```
    
    **Archive Management:**
    - Keep up to 5 timestamped copies of each update file
    - Codex creates a timestamped `codexlastupdate-YYYY-MM-DD-HHMMSS.md` before every push
    - Claude creates a timestamped `claudes4lastupdate-YYYY-MM-DD-HHMMSS.md` before every push
    - Remove the oldest archive when exceeding 5 copies per file
    - Always maintain the non timestamped files as the primary reference
    
    **Timestamp Format:** Use ISO format `YYYY-MM-DD-HHMMSS` (e.g., `codexlastupdate-2025-06-11-143022.md`)
    
    **Purpose:** Maintain a bidirectional record of updates and instructions so each agent knows what the other has changed. `codexlastupdate.md` lets Claude Sonnet track Codex's recent updates and read any instructions from Codex, including which dependencies must be installed or unignored for Codex's tests. `claudes4lastupdate.md` informs Codex of Claude Sonnet's latest updates and guidance.

    **Next Steps Tracking:** Codex must include a **Next Steps** section in every `codexlastupdate.md` summarizing the immediate tasks. The section must clearly separate duties for Claude from coding work. Provide two bullet lists labeled **For Claude** and **For Code**. Claude Sonnet reads this section whenever it pulls the repository to determine its next actions.

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
  * **Repository Backup Trigger:** When the user writes "AGENT BACKUP REPO", immediately create a complete backup of the entire repository: (This applies only to claude)
    
    **Backup Process:**
    - Source: `C:\github\Smart-Note-Taking-Web-App-Implementation-Guide`
    - Destination: `C:\github\Backups\NOTESAPP\NOTESAPP-YYYY-MM-DD-HHMMSS`
    - Copy all files and folders recursively
    - Exclude `.git` folder from backup (config files and source code only)
    - Timestamp format: ISO `YYYY-MM-DD-HHMMSS` (e.g., `NOTESAPP-2025-06-11-230145`)
    
    **Backup Command Example:**
    ```powershell
    $timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
    $destination = "C:\github\Backups\NOTESAPP\NOTESAPP-$timestamp"
    Copy-Item -Path "C:\github\Smart-Note-Taking-Web-App-Implementation-Guide\*" -Destination $destination -Recurse -Exclude ".git"
    ```

## Interaction Workflow

1. **Feature Development Initiation:**

   * Claude Sonnet analyzes market trends, user feedback, and competitive positioning to suggest optimal feature sets.
   * These insights feed into high-level project plans, roadmap adjustments, and detailed user stories.

2. **Coding and Implementation:**

   * Developers use natural language prompts in VSCode.
   * OpenAI Codex interprets these prompts and provides real-time code suggestions, snippets, and complete function implementations.
   * Claude Sonnet ensures code quality and manages development workflow (linting, testing, version control).

3. **Continuous Feedback Loop:**

   * Claude Sonnet continuously monitors and provides feedback on user experience effectiveness, refining the scope and relevance of features.
   * Codex incorporates changes and improvements in real-time code suggestions.

4. **Quality Assurance and Deployment:**

   * Claude Sonnet automates unit testing, integration testing, and manages CI/CD pipelines.
   * Final code review and approval happen within VSCode, facilitated by Codex-generated suggestions.
   * **Dependency Verification:** Claude Sonnet must verify that all required dependencies are present in `package.json` before any repository push operations.
   * **Configuration Integrity:** Ensure critical configuration files (`.eslintrc.json`, `.prettierrc.json`, `azure.json`) are not excluded by `.gitignore` rules.
  * **Documentation Archiving:**
      - Claude Sonnet creates a timestamped archive of `claudes4lastupdate.md` before each push and keeps up to 5 copies.
      - Codex creates a timestamped archive of `codexlastupdate.md` before each push and keeps up to 5 copies.
      - These files allow each agent to track the other's recent changes and instructions.
   * **Repository Backup:** When user requests "AGENT BACKUP REPO", Claude Sonnet immediately creates timestamped backup to `C:\github\Backups\NOTESAPP-YYYY-MM-DD-HHMMSS`.

5. **Documentation and Knowledge Transfer:**

   * Claude Sonnet assists in producing user-centric documentation and onboarding materials.
   * Codex supports technical documentation generation within codebases.
   * **README Maintenance:** Codex must update `README.md` whenever code or configuration changes alter setup steps, environment variables, or usage details. These updates should be derived from Codex's own analysis of the codebase, `MainGoal.md`, and related configuration files rather than relying solely on existing documentation.

This structured collaboration between Codex and Claude Sonnet ensures an efficient, intelligent, and streamlined development process for ContextFlow, effectively aligning technical implementation with strategic user experience and market considerations.

## Environment Configuration Handoff

Codex operates in a constrained environment without direct access to certain configuration tools or network resources. When environment setup or system-level configuration is required, Codex must instead outline the steps for the Claude Sonnet agent to carry out in a fully provisioned development environment. These task descriptions should include:

* Specific commands to run with proper paths and arguments
* Required environment variables or configuration files that must be created or modified
* Any expected outputs or verifications so Claude can confirm successful completion

By providing this handoff, Codex ensures development continues smoothly despite proximity or permission limitations.

## Context Requirements

### **MainGoal.md Context Mandate**

Both agents (Codex and Claude Sonnet) must maintain constant awareness of `MainGoal.md` content, which includes:

**Product Vision:**
- ContextFlow: Intelligent Context-Aware Note-Taking Platform
- Target Market: Knowledge workers, students, researchers, lifelong learners
- Core Value Proposition: Dynamic, contextual webs of knowledge

**Key Features to Implement:**
- Dynamic Split-Screen Interface with adaptive layouts
- Smart Content Linking with multi-reference highlighting
- Intelligent Context Engine with AI-powered suggestions
- Knowledge Graph Visualization
- Advanced Note Organization with flexible hierarchies

**Technical Architecture:**
- Frontend: React with TypeScript, Progressive Web App
- Backend: Node.js with GraphQL, PostgreSQL + Neo4j
- AI/ML: OpenAI API integration for content analysis
- Security: End-to-end encryption, GDPR compliance

**Business Context:**
- Freemium model ($9.99/month Personal Pro, $19.99/user Team)
- Target metrics: 60% DAU, 15% conversion rate, $300+ LTV
- Competition: Differentiation from Notion, Obsidian, Roam Research

This context ensures all development work aligns with ContextFlow's strategic objectives and user needs.
