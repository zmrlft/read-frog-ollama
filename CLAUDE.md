# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development

- `pnpm dev` - Run all apps in development mode
- `pnpm dev:extension` - Run only the browser extension (`@read-frog/extension`)
- `pnpm dev:website` - Run only the website (`@read-frog/website`)

### Building & Testing

- `pnpm build` - Build all apps
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all code and run turbo lint
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm type-check` - Type check all TypeScript code

### Extension Specific

- `pnpm --filter=@read-frog/extension test:watch` - Run extension tests in watch mode
- `pnpm --filter=@read-frog/extension zip` - Create extension ZIP for distribution
- `pnpm --filter=@read-frog/extension dev:firefox` - Run extension in Firefox
- `pnpm --filter=@read-frog/extension dev:edge` - Run extension in Edge

### Database (when working with website)

- `pnpm db:generate` - Generate database schema
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open database studio

## Project Architecture

### Monorepo Structure

This is a Turborepo monorepo with two main applications and shared packages:

**Apps:**

- `apps/extension/` - Browser extension built with WXT (WebExtension Tooling)
- `apps/website/` - Next.js website with documentation and user dashboard

**Shared Packages:**

- `packages/api/` - tRPC API definitions shared between extension and website
- `packages/auth/` - Authentication logic using better-auth
- `packages/db/` - Database schema and client using Drizzle ORM
- `packages/definitions/` - Shared types and constants
- `packages/ui/` - Shared UI components
- `packages/eslint-config/` - ESLint configurations
- `packages/typescript-config/` - TypeScript configurations

### Extension Architecture

The extension uses WXT framework with the following key entrypoints:

- `background/` - Service worker for API requests and background tasks
- `popup/` - Extension popup UI
- `options/` - Extension settings page
- `host.content/` - Content script for page translation
- `side.content/` - Side panel for article reading
- `selection.content/` - Text selection translation

Key technical aspects:

- React + TypeScript for UI components
- Jotai for state management
- Dexie for IndexedDB storage
- AI SDK for multiple LLM provider support (OpenAI, DeepSeek, Google)
- tRPC for type-safe API communication with website

### Website Architecture

Next.js 15 app with:

- App Router with internationalization (i18n) support
- Fumadocs for documentation system
- Better-auth for authentication
- Drizzle ORM with database
- tRPC for API layer
- Tailwind CSS for styling

## Development Environment Setup

- Node.js 22.18.0+ required (specified in devEngines)
- pnpm as package manager
- The extension requires browser-specific setup - check `apps/extension/web-ext.config.ts`

## Key Dependencies

- **WXT**: Extension development framework
- **Better-auth**: Authentication system
- **Drizzle**: Database ORM
- **tRPC**: Type-safe API layer
- **AI SDK**: Multi-provider AI integration
- **Turborepo**: Monorepo build system

## Testing

- Extension uses Vitest with React Testing Library
- Tests located in `__test__` and `__tests__` directories
- Coverage available via `test:cov` command in extension package

## Commit Message Guidelines

Follow conventional commits format: `type(scope): description`, keep the commit message concise and clear. and don't add `🤖 Generated with [Claude Code](https://claude.ai/code)` in the commit message.

**Allowed commit types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes
- `perf`: Performance improvements
- `revert`: Reverting previous commits
- `i18n`: Internationalization changes
- `ai`: AI-related features or improvements

**Examples:**

- `feat(extension): add vocabulary book feature`
- `fix(website): resolve login redirect issue`
- `docs: update contribution guide`
- `i18n(extension): add Japanese translations`
- `ai(extension): integrate new DeepSeek model`

## Language

The code comments should be in English.
