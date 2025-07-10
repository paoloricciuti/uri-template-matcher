# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Testing
- `pnpm test` - Run all tests with Vitest
- `pnpm test:coverage` - Run tests with coverage reporting

### Code Quality
- `pnpm typecheck` - Type check with TypeScript (uses `tsc --noEmit`)
- `pnpm lint` - Lint code with ESLint
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Publishing
- `pnpm release` - Publish package using Changesets, this is executed by a github action and should never be invoked

## Architecture

This is a lightweight URI template matcher library that implements RFC 6570 Level 1-4 features for parsing and matching URI templates.

### Core Components

**src/index.js** - Main entry point, exports `UriTemplateMatcher` class
**src/matcher.js** - Contains the `UriTemplateMatcher` class with methods:
- `add(template)` - Register URI templates
- `match(uri)` - Match URI against registered templates
- `clear()` - Clear all templates
- `all()` - Get all registered templates

**src/parser.js** - Core parsing and matching logic:
- `parse_template()` - Parse URI template into structured parts
- `match_uri()` - Match URI against parsed template with backtracking
- Expression handlers for different RFC 6570 operators (+, #, ., /, ;, ?, &)

**src/types.js** - Type definitions (JSDoc comments for runtime JS)
**src/index.d.ts** - TypeScript declarations

### Key Features

- **RFC 6570 Compliance**: Supports all levels (1-4) including operators, prefix modifiers, and explode modifiers
- **Backtracking Algorithm**: Handles consecutive variables by trying different boundary splits
- **Snake Case Convention**: Uses snake_case for function names (parse_template, match_uri, etc.)
- **No Dependencies**: Pure JavaScript implementation without regex usage
- **URL Encoding**: Automatic encoding/decoding of URI components

### Testing Structure

- **test/matcher.test.ts** - Tests for UriTemplateMatcher class
- **test/parser.test.ts** - Tests for parsing and matching logic
- **test/rfc-examples.test.ts** - RFC 6570 compliance tests

## Code Style

- Uses snake_case for functions and variables
- ESLint configuration with TypeScript support
- Prettier formatting with specific rules
- JSDoc comments for type information in JavaScript files