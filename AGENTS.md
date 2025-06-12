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
   * **Documentation Archiving:** Claude Sonnet creates timestamped archive of `codexlastupdate.md` before each push and maintains rolling archive of up to 5 copies for Codex reference.

5. **Documentation and Knowledge Transfer:**

   * Claude Sonnet assists in producing user-centric documentation and onboarding materials.
   * Codex supports technical documentation generation within codebases.

This structured collaboration between Codex and Claude Sonnet ensures an efficient, intelligent, and streamlined development process for ContextFlow, effectively aligning technical implementation with strategic user experience and market considerations.

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
