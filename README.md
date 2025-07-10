# URI Template Matcher

A lightweight URI template matcher based on RFC 6570 that allows you to register URI templates and match URIs against them to extract parameters.

## Installation

```bash
npm install uri-template-matcher
```
```bash
pnpm add uri-template-matcher
```

## Usage

### Basic Usage

```javascript
import { UriTemplateMatcher } from 'uri-template-matcher';

const matcher = new UriTemplateMatcher();

// Register URI templates
matcher.add('/users/{id}');
matcher.add('/posts/{postId}/comments/{commentId}');

// Match URIs and extract parameters
const result = matcher.match('/users/123');
console.log(result);
// Output: { template: '/users/{id}', params: { id: '123' } }

const result2 = matcher.match('/posts/456/comments/789');
console.log(result2);
// Output: { 
//   template: '/posts/{postId}/comments/{commentId}', 
//   params: { postId: '456', commentId: '789' } 
// }
```

### Working with Multiple Templates

```javascript
const matcher = new UriTemplateMatcher();

// Add multiple templates
matcher.add('/api/users/{id}');
matcher.add('/api/posts/{id}');
matcher.add('/api/health');

// The matcher returns the first matching template
const userMatch = matcher.match('/api/users/123');
console.log(userMatch);
// Output: { template: '/api/users/{id}', params: { id: '123' } }

const healthMatch = matcher.match('/api/health');
console.log(healthMatch);
// Output: { template: '/api/health', params: {} }

// No match returns null
const noMatch = matcher.match('/api/unknown');
console.log(noMatch); // Output: null
```

### URL Encoding Support

The matcher automatically handles URL encoding and decoding:

```javascript
const matcher = new UriTemplateMatcher();
matcher.add('/search/{query}');

const result = matcher.match('/search/hello%20world');
console.log(result);
// Output: { template: '/search/{query}', params: { query: 'hello world' } }
```

### RFC 6570 Level 2 - Reserved String Expansion

```javascript
const matcher = new UriTemplateMatcher();

// Reserved expansion with '+' operator
matcher.add('/files/{+path}');
const result = matcher.match('/files/docs/readme.txt');
console.log(result);
// Output: { template: '/files/{+path}', params: { path: 'docs/readme.txt' } }

// Fragment expansion with '#' operator
matcher.add('/page#{section}');
const fragmentResult = matcher.match('/page#introduction');
console.log(fragmentResult);
// Output: { template: '/page#{section}', params: { section: 'introduction' } }
```

### RFC 6570 Level 3 - Advanced Operators

```javascript
const matcher = new UriTemplateMatcher();

// Dot notation
matcher.add('/files{.format}');
console.log(matcher.match('/files.json'));
// Output: { template: '/files{.format}', params: { format: 'json' } }

// Path segments
matcher.add('/api{/version}/users');
console.log(matcher.match('/api/v1/users'));
// Output: { template: '/api{/version}/users', params: { version: 'v1' } }

// Query parameters
matcher.add('/search{?q}');
console.log(matcher.match('/search?q=test'));
// Output: { template: '/search{?q}', params: { q: 'test' } }

// Multiple query parameters
matcher.add('/search{?q,limit}');
console.log(matcher.match('/search?q=test&limit=10'));
// Output: { template: '/search{?q,limit}', params: { q: 'test', limit: '10' } }

// Query continuation
matcher.add('/search?type=user{&q}');
console.log(matcher.match('/search?type=user&q=john'));
// Output: { template: '/search?type=user{&q}', params: { q: 'john' } }

// Semicolon parameters
matcher.add('/api{;version}');
console.log(matcher.match('/api;version=v1'));
// Output: { template: '/api{;version}', params: { version: 'v1' } }
```

### RFC 6570 Level 4 - Value Modifiers

```javascript
const matcher = new UriTemplateMatcher();

// Prefix modifiers
matcher.add('/api/{name:3}');
console.log(matcher.match('/api/toolong'));
// Output: { template: '/api/{name:3}', params: { name: 'too' } }

// Explode modifiers with lists
matcher.add('/tags{.tags*}');
console.log(matcher.match('/tags.red.green.blue'));
// Output: { template: '/tags{.tags*}', params: { tags: ['red', 'green', 'blue'] } }

// Explode modifiers with query parameters
matcher.add('/search{?filters*}');
console.log(matcher.match('/search?color=red&size=large'));
// Output: { template: '/search{?filters*}', params: { filters: ['color=red', 'size=large'] } }
```

### Managing Templates

```javascript
const matcher = new UriTemplateMatcher();

// Add templates
matcher.add('/users/{id}');
matcher.add('/posts/{id}');

// Get all registered templates
console.log(matcher.all());
// Output: ['/users/{id}', '/posts/{id}']

// Clear all templates
matcher.clear();
console.log(matcher.all());
// Output: []
```

### Real-World Examples

#### REST API Routing

```javascript
const matcher = new UriTemplateMatcher();

// Register API endpoints
matcher.add('/api/v1/users/{id}');
matcher.add('/api/v1/users/{id}/posts');
matcher.add('/api/v1/posts/{postId}/comments/{commentId}');

// Route incoming requests
function routeRequest(path) {
  const match = matcher.match(path);
  
  if (!match) {
    return { status: 404, message: 'Not Found' };
  }
  
  return {
    template: match.template,
    params: match.params,
    status: 200
  };
}

console.log(routeRequest('/api/v1/users/123'));
// Output: { template: '/api/v1/users/{id}', params: { id: '123' }, status: 200 }
```

#### GitHub-style URLs

```javascript
const matcher = new UriTemplateMatcher();
matcher.add('/repos/{owner}/{repo}/issues/{issue_number}');

const match = matcher.match('/repos/octocat/Hello-World/issues/1');
console.log(match);
// Output: {
//   template: '/repos/{owner}/{repo}/issues/{issue_number}',
//   params: {
//     owner: 'octocat',
//     repo: 'Hello-World',
//     issue_number: '1'
//   }
// }
```

#### File System Paths

```javascript
const matcher = new UriTemplateMatcher();
matcher.add('file:///{+path}');

const match = matcher.match('file:///home/user/documents/file.txt');
console.log(match);
// Output: {
//   template: 'file:///{+path}',
//   params: { path: 'home/user/documents/file.txt' }
// }
```

## API Reference

### Class: UriTemplateMatcher

#### Constructor

```javascript
new UriTemplateMatcher()
```

Creates a new UriTemplateMatcher instance.

#### Methods

##### `add(template: string): void`

Adds a URI template to the matcher.

- `template` - The URI template string to add
- Throws `Error` if template is invalid

##### `match(uri: string): MatchResult | null`

Matches a URI against all registered templates.

- `uri` - The URI to match
- Returns `MatchResult` if a match is found, `null` otherwise
- Throws `Error` if URI is invalid

##### `clear(): void`

Clears all registered templates.

##### `all(): string[]`

Returns an array of all registered template strings.

### Types

#### MatchResult

```typescript
interface MatchResult {
  template: string;                    // The matched template
  params: Record<string, string | string[]>; // Extracted parameters
}
```

## RFC 6570 Compliance

This library implements URI Template matching based on RFC 6570 with support for:

- **Level 1**: Simple string expansion
- **Level 2**: Reserved string expansion (`+`) and fragment expansion (`#`)
- **Level 3**: Multiple variable expansion with operators (`.`, `/`, `;`, `?`, `&`)
- **Level 4**: Value modifiers including prefix (`:n`) and explode (`*`) modifiers

## License

MIT
