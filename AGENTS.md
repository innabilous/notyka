<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Instructions for AI Agents (AGENTS.md)

This file contains rules and requirements for development, architecture, code formatting, file naming, and commit message styling in the `notyka` repository. All AI assistants must strictly follow these instructions.

---

## 🗂️ File & Directory Naming (Kebab-case)

- **Strict Kebab-case**: All files, directories, and components must follow `kebab-case` naming (e.g. `bottom-toolbar.tsx`, `brush-settings.tsx`, `canvas-renderer.ts`, `image-menu-modal.tsx`).
- No PascalCase or camelCase for filenames or folders under any circumstances.

---

## 🚀 Incremental Commits Rule ("Кожен ендпоїнт / крок комітимо")

- **Commit Every Endpoint & Logical Step**:
   - Кожну окрему фічу, логічний модуль, компонент чи ендпоїнт комітимо окремо.
   - Не змішувати в один коміт різні логічні частини.
   - Завершили створення/зміну ендпоїнту чи модуля -> одразу готуємо окремий коміт.

---

## ✅ Verification & Quality Gate Rules

Before completing any task, preparing commits, or reporting back to the user, always run and verify the following quality checks across the workspace:

1. `pnpm typecheck` — TypeScript typecheck (`tsc --noEmit`).
2. `pnpm build` — Next.js build verification.

---

## 📝 Commit Message Formatting Rules

All commits must follow the **Conventional Commits** standard with the following formatting rules:

- **Subject**:
   - Format: `<type>(<scope>): <lowercase description in English>`
   - The `<scope>` is optional but recommended (e.g., `canvas`, `toolbar`, `modal`, `config`).
   - **No trailing period** at the end of the subject.
   - Subject length should be up to 50 characters (maximum 72).
- **Body**:
   - Starts after one blank line following the subject.
   - Use a hyphen `-` as the list bullet.
   - Each bullet item must start with a **capital letter**.
   - Use backticks \` \` to denote filenames, methods, classes, CLI commands, or variables (e.g., `canvas-renderer.ts`, `photo-editor.tsx`).
   - The text of each bullet item must end **without a trailing period**.
   - **Line Length**: Each line in the body (including bullet points) must not exceed **100 characters** (maximum 72 characters is recommended).
      - If a bullet item is too long, wrap it to the next line and indent it with two spaces to keep it under the limit.

### Example of a correct commit message:

```git
feat(toolbar): implement note stamp selection buttons

- Add notes and accidentals chips selector
- Bind note size memory to stamp state
- Use tab indentation matching editorconfig
```

### Presenting Commits to the User

- **Never Commit Directly**: The assistant must **NEVER** run `git commit` directly, even if explicitly asked to commit. Commits must always be executed by the user.
- When the user asks to commit, prepare commit messages, or review commits, always present each logical change group with its explicit staging command immediately followed by the commit message:

```bash
git add src/path/to/file.ts src/path/to/file.spec.ts
```

```git
type(scope): lowercase description

- Capitalized bullet item with backticks like `MyClass`
- Another bullet item without trailing period
```

- **PowerShell Commit Quoting**:
   - When executing `git commit` in PowerShell, wrap commit messages containing backticks in single quotes `'...'` (e.g. `git commit -m 'subject' -m '- Line with `backticks`'`) instead of double quotes `"..."`. In PowerShell, the backtick \` is an escape character and breaks double-quoted strings into interactive continuation prompts (`>`).

---

## 📦 Package Management & Dependencies

- **pnpm Strict Dependencies**:
   - We use `pnpm` as the package manager.
   - Do NOT import packages that are not explicitly declared in `package.json`.
   - Use `pnpm <command>` instead of `npm <command>` (e.g., `pnpm add`, `pnpm run`).

---

## 🏷️ Typing & Coding Practices

- **Strict Typing**:
   - Avoid using `any`, type-assertions (`as`), or non-null assertions (`!`) as much as possible.
   - Prefer safe type narrowing and custom type guards.
- **Language**:
   - Technical code comments must be in English.
   - Explanations of changes in code comments are in Ukrainian (e.g., `//! Додав обробку помилки`).
