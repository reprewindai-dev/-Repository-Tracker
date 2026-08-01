```markdown
# -Repository-Tracker Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill covers the core development patterns and conventions used in the `-Repository-Tracker` TypeScript project. It documents file organization, code style, commit practices, and testing approaches to ensure consistency and maintainability. This guide is ideal for onboarding new contributors or maintaining code quality across the repository.

## Coding Conventions

### File Naming
- **PascalCase** is used for all file names.
  - Example: `RepositoryTracker.ts`, `UserManager.ts`

### Import Style
- **Relative imports** are used to reference other modules within the project.
  - Example:
    ```typescript
    import RepositoryTracker from './RepositoryTracker';
    ```

### Export Style
- **Default exports** are preferred for modules.
  - Example:
    ```typescript
    export default RepositoryTracker;
    ```

### Commit Patterns
- **Freeform commit messages** (no strict prefixes)
- **Average commit message length:** 38 characters

  Example:
  ```
  Add support for multiple repository sources
  ```

## Workflows

### Adding a New Feature
**Trigger:** When implementing new functionality  
**Command:** `/add-feature`

1. Create a new file using PascalCase (e.g., `NewFeature.ts`).
2. Implement the feature using TypeScript.
3. Use relative imports to include dependencies.
4. Export the main class or function as default.
5. Write corresponding tests in a `.test.ts` file.
6. Commit changes with a clear, concise message.

### Fixing a Bug
**Trigger:** When resolving a reported issue  
**Command:** `/fix-bug`

1. Identify the source of the bug in the codebase.
2. Edit the relevant file(s), following PascalCase naming.
3. Use relative imports/exports as needed.
4. Update or add tests to cover the bug fix.
5. Commit with a descriptive message about the fix.

### Writing Tests
**Trigger:** When adding or updating functionality  
**Command:** `/write-test`

1. Create a test file named after the module, using `.test.ts` (e.g., `RepositoryTracker.test.ts`).
2. Implement tests for all public interfaces.
3. Use the project's preferred (unknown) testing framework.
4. Run tests to ensure correctness.
5. Commit test files with a relevant message.

## Testing Patterns

- **Test File Naming:** Use the pattern `*.test.ts` (e.g., `RepositoryTracker.test.ts`).
- **Testing Framework:** Not explicitly detected; follow existing patterns or consult maintainers.
- **Test Coverage:** Ensure all new features and bug fixes are accompanied by relevant tests.

  Example:
  ```typescript
  // RepositoryTracker.test.ts
  import RepositoryTracker from './RepositoryTracker';

  describe('RepositoryTracker', () => {
    it('should track repositories', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command        | Purpose                                 |
|----------------|-----------------------------------------|
| /add-feature   | Scaffold and implement a new feature    |
| /fix-bug       | Guide through the bug fix workflow      |
| /write-test    | Create and update test files            |
```
