/**
 * @fileoverview RFC 6570 compliance tests with examples from the specification
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { UriTemplateMatcher } from '../src/matcher.js';

describe('RFC 6570 Compliance Tests', () => {
	let matcher: UriTemplateMatcher;

	beforeEach(() => {
		matcher = new UriTemplateMatcher();
	});

	describe('Level 1 - Simple String Expansion', () => {
		it('should handle basic variable expansion', () => {
			matcher.add('/users/{id}');

			const result = matcher.match('/users/123');
			expect(result).toEqual({
				template: '/users/{id}',
				params: { id: '123' },
			});
		});

		it('should handle multiple variables', () => {
			matcher.add('/users/{id}/posts/{post_id}');

			const result = matcher.match('/users/123/posts/456');
			expect(result).toEqual({
				template: '/users/{id}/posts/{post_id}',
				params: { id: '123', post_id: '456' },
			});
		});

		it('should handle variables with special characters', () => {
			matcher.add('/search/{query}');

			const result = matcher.match('/search/hello%20world');
			expect(result).toEqual({
				template: '/search/{query}',
				params: { query: 'hello world' },
			});
		});
	});

	describe('Level 2 - Reserved String Expansion', () => {
		it('should handle reserved expansion operator', () => {
			matcher.add('/files/{+path}');

			const result = matcher.match('/files/docs/readme.txt');
			expect(result).toEqual({
				template: '/files/{+path}',
				params: { path: 'docs/readme.txt' },
			});
		});

		it('should handle fragment expansion', () => {
			matcher.add('/page#{section}');

			const result = matcher.match('/page#introduction');
			expect(result).toEqual({
				template: '/page#{section}',
				params: { section: 'introduction' },
			});
		});
	});

	describe('Level 3 - Multiple Variable Expansion', () => {
		it('should handle dot notation', () => {
			matcher.add('/files{.format}');

			const result = matcher.match('/files.json');
			expect(result).toEqual({
				template: '/files{.format}',
				params: { format: 'json' },
			});
		});

		it('should handle path segments', () => {
			matcher.add('/api{/version}/users');

			const result = matcher.match('/api/v1/users');
			expect(result).toEqual({
				template: '/api{/version}/users',
				params: { version: 'v1' },
			});
		});

		it('should handle query parameters', () => {
			matcher.add('/search{?q}');

			const result = matcher.match('/search?q=test');
			expect(result).toEqual({
				template: '/search{?q}',
				params: { q: 'test' },
			});
		});

		it('should handle multiple query parameters', () => {
			matcher.add('/search{?q,limit}');

			const result = matcher.match('/search?q=test&limit=10');
			expect(result).toEqual({
				template: '/search{?q,limit}',
				params: { q: 'test', limit: '10' },
			});
		});

		it('should handle query continuation', () => {
			matcher.add('/search?type=user{&q}');

			const result = matcher.match('/search?type=user&q=john');
			expect(result).toEqual({
				template: '/search?type=user{&q}',
				params: { q: 'john' },
			});
		});

		it('should handle semicolon parameters', () => {
			matcher.add('/api{;version}');

			const result = matcher.match('/api;version=v1');
			expect(result).toEqual({
				template: '/api{;version}',
				params: { version: 'v1' },
			});
		});
	});

	describe('Level 4 - Value Modifiers', () => {
		it('should handle prefix modifiers', () => {
			matcher.add('/api/{name:3}');

			const result = matcher.match('/api/toolong');
			expect(result).toEqual({
				template: '/api/{name:3}',
				params: { name: 'too' },
			});
		});

		it('should handle explode modifiers with lists', () => {
			matcher.add('/tags{.tags*}');

			const result = matcher.match('/tags.red.green.blue');
			expect(result).toEqual({
				template: '/tags{.tags*}',
				params: { tags: ['red', 'green', 'blue'] },
			});
		});

		it('should handle explode modifiers with query', () => {
			matcher.add('/search{?filters*}');

			const result = matcher.match('/search?color=red&size=large');
			expect(result).toEqual({
				template: '/search{?filters*}',
				params: { filters: ['color=red', 'size=large'] },
			});
		});
	});

	describe('Complex Real-World Examples', () => {
		it('should handle GitHub-style API paths', () => {
			matcher.add('/repos/{owner}/{repo}/issues/{issue_number}');

			const result = matcher.match('/repos/octocat/Hello-World/issues/1');
			expect(result).toEqual({
				template: '/repos/{owner}/{repo}/issues/{issue_number}',
				params: {
					owner: 'octocat',
					repo: 'Hello-World',
					issue_number: '1',
				},
			});
		});

		it.skip('should handle REST API with optional extensions', () => {
			matcher.add('/api/v1/users/{id}{.format}');

			const result1 = matcher.match('/api/v1/users/123.json');
			expect(result1).toEqual({
				template: '/api/v1/users/{id}{.format}',
				params: { id: '123', format: 'json' },
			});

			const result2 = matcher.match('/api/v1/users/123');
			expect(result2).toEqual({
				template: '/api/v1/users/{id}{.format}',
				params: { id: '123', format: '' },
			});
		});

		it('should handle file system paths', () => {
			matcher.add('file:///{+path}');

			const result = matcher.match(
				'file:///home/user/documents/file.txt',
			);
			expect(result).toEqual({
				template: 'file:///{+path}',
				params: { path: 'home/user/documents/file.txt' },
			});
		});

		it('should handle template with no matches', () => {
			matcher.add('/api/users/{id}');

			expect(matcher.match('/api/posts/123')).toBeNull();
			expect(matcher.match('/api/users/')).toBeNull();
			expect(matcher.match('/api/users/123/extra')).toBeNull();
		});
	});

	describe('Edge Cases and Error Handling', () => {
		it('should handle empty templates', () => {
			matcher.add('');

			const result = matcher.match('');
			expect(result).toEqual({
				template: '',
				params: {},
			});
		});

		it('should handle templates with only variables', () => {
			matcher.add('{id}');

			const result = matcher.match('123');
			expect(result).toEqual({
				template: '{id}',
				params: { id: '123' },
			});
		});

		it('should handle Unicode characters', () => {
			matcher.add('/users/{name}');

			const result = matcher.match('/users/José');
			expect(result).toEqual({
				template: '/users/{name}',
				params: { name: 'José' },
			});
		});

		it('should handle encoded Unicode characters', () => {
			matcher.add('/users/{name}');

			const result = matcher.match('/users/Jos%C3%A9');
			expect(result).toEqual({
				template: '/users/{name}',
				params: { name: 'José' },
			});
		});
	});
});
