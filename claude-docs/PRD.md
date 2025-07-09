# URI Template Matcher Library - Product Requirements Document

## Overview
A lightweight JavaScript/TypeScript library for matching URIs against URI templates as defined in RFC 6570. The library provides functionality to register URI templates and match incoming URIs against them, extracting variable values.

## Core Functionality

### 1. Template Registration
- **Method**: `add(template: string)`
- **Purpose**: Register a URI template for matching
- **Example**: `matcher.add("file://foo/{bar}")`
- **Requirements**:
  - Support all RFC 6570 Level 1-4 template syntax
  - Handle variable expressions with proper parsing
  - Store templates for efficient matching

### 2. URI Matching
- **Method**: `match(uri: string)`
- **Purpose**: Match a URI against registered templates and extract parameters
- **Example**: `matcher.match("file://foo/hello")` returns `{ template: "file://foo/{bar}", params: { bar: "hello" } }`
- **Requirements**:
  - Return the matching template and extracted parameters
  - Handle multiple registered templates
  - Return `null` if no match found
  - Support proper URI decoding

## Technical Requirements

### Language and Dependencies
- **Language**: TypeScript with JSDoc comments
- **Module System**: Modern ESM (ES modules)
- **External Dependencies**: None for runtime (devDependencies allowed)
- **No Regex**: Implementation must not use regular expressions
- **Type Checking**: Use TypeScript with `checkJs` for local validation

### Testing
- **Framework**: Vitest
- **Coverage**: Comprehensive test suite covering:
  - All RFC 6570 template levels
  - Edge cases and error conditions
  - Unicode and internationalization
  - Multiple template scenarios

### Package Structure
- Initialize with `pnpm init`
- Use `pnpm` for package management
- Include proper TypeScript configuration
- Support both Node.js and browser environments

## API Design

```typescript
class UriTemplateMatcher {
  /**
   * Add a URI template to the matcher
   * @param {string} template - URI template following RFC 6570
   */
  add(template: string): void;

  /**
   * Match a URI against registered templates
   * @param {string} uri - URI to match
   * @returns {MatchResult | null} Match result or null if no match
   */
  match(uri: string): MatchResult | null;
}

interface MatchResult {
  template: string;
  params: Record<string, string | string[]>;
}
```

## RFC 6570 Support Requirements

### Level 1 - Simple String Expansion
- Basic variable substitution: `{var}`
- Simple string values only

### Level 2 - Reserved String Expansion
- Reserved character expansion: `{+var}`
- Fragment expansion: `{#var}`

### Level 3 - Multiple Variable Expansion
- Path segments: `{.var}`
- Path parameters: `{;var}`
- Query parameters: `{?var}`
- Query continuation: `{&var}`

### Level 4 - Value Modifiers
- Prefix modifiers: `{var:3}`
- Explode modifiers: `{var*}`
- Composite values (lists and associative arrays)

## Implementation Constraints

### Parsing Strategy
- Use character-by-character parsing instead of regex
- Implement proper state machine for template parsing
- Handle nested braces and escape sequences correctly

### Performance Requirements
- Efficient template storage and lookup
- Minimal memory footprint
- Fast matching algorithm for production use

### Error Handling
- Graceful handling of malformed templates
- Clear error messages for debugging
- Validation of template syntax during registration

## File Structure
```
uri-template-matcher/
├── src/
│   ├── index.ts              # Main entry point
│   ├── matcher.ts            # Core matcher class
│   ├── parser.ts             # Template parsing logic
│   └── types.ts              # Type definitions
├── test/
│   ├── matcher.test.ts       # Core functionality tests
│   ├── parser.test.ts        # Parser tests
│   └── rfc-examples.test.ts  # RFC 6570 compliance tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Success Criteria
1. Full RFC 6570 compliance for all template levels
2. Zero runtime dependencies
3. Comprehensive test coverage (>95%)
4. TypeScript support with proper type inference
5. ESM module compatibility
6. Performance benchmarks meet requirements
7. Clear documentation and examples

## Non-Goals
- URI template expansion (only matching/parsing)
- Server-side routing framework integration
- CLI tools or utilities
- Browser-specific optimizations