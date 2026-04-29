# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vite React dashboard written in TypeScript. Application code lives in `src/`: route-level views are in `src/pages`, reusable UI is in `src/components`, API access is centralized in `src/services/api.ts`, shared TypeScript models are in `src/types`, and global Tailwind/CSS styles are in `src/styles/globals.css`. Static public files belong in `public/`. Build and tooling configuration lives at the repository root, including `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `tailwind.config.js`, and `postcss.config.js`.

## Build, Test, and Development Commands

Run commands from the repository root:

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server with hot reload.
- `npm run build`: type-check with `tsc` and create the production bundle in `dist/`.
- `npm run preview`: serve the built app locally for a production-like check.
- `npm run lint`: run ESLint on TypeScript and React files with warnings treated as failures.

The frontend currently expects the backend API at `http://localhost:8080/api`.

## Coding Style & Naming Conventions

Use TypeScript, React functional components, and ES modules. Match the existing style: two-space indentation, semicolons, single quotes, and explicit imports. Name React components and page files in `PascalCase` such as `StockCard.tsx`; use `camelCase` for functions, variables, hooks, and service methods. Keep API calls in `src/services` and shared shapes in `src/types` instead of duplicating inline types across components. Prefer Tailwind utility classes for layout and styling, with global CSS reserved for app-wide rules.

## Testing Guidelines

No test runner is configured yet. Before opening a PR, run `npm run lint` and `npm run build`. If tests are added, use a Vite-compatible stack such as Vitest with React Testing Library, place tests near the code they cover as `*.test.ts` or `*.test.tsx`, and focus on user-visible behavior, routing, and API-state handling.

## Commit & Pull Request Guidelines

Recent history uses short conventional-style commits such as `refactor: ...`. Continue using lowercase prefixes like `feat:`, `fix:`, `refactor:`, `docs:`, or `test:` followed by a concise summary. Pull requests should include the purpose of the change, validation performed, linked issues when relevant, and screenshots or screen recordings for visible UI changes. Note any backend API assumptions or configuration changes explicitly.
