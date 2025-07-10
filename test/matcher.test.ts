/**
 * @fileoverview Tests for UriTemplateMatcher class
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { UriTemplateMatcher } from '../src/matcher.js';

describe('UriTemplateMatcher', () => {
	let matcher: UriTemplateMatcher;

	beforeEach(() => {
		matcher = new UriTemplateMatcher();
	});

	describe('add method', () => {
		it('should add a simple template', () => {
			matcher.add('file://foo/{bar}');
			expect(matcher.all()).toEqual(['file://foo/{bar}']);
		});

		it('should add multiple templates', () => {
			matcher.add('file://foo/{bar}');
			matcher.add('http://example.com/{id}');
			expect(matcher.all()).toEqual([
				'file://foo/{bar}',
				'http://example.com/{id}',
			]);
		});

		it('should throw error for non-string template', () => {
			expect(() => matcher.add(123 as any)).toThrow(
				'Template must be a string',
			);
		});

		it('should throw error for empty template', () => {
			expect(() => matcher.add('   ')).toThrow(
				'Template cannot be empty',
			);
		});

		it('should throw error for invalid template syntax', () => {
			expect(() => matcher.add('file://foo/{bar')).toThrow(
				'Invalid template',
			);
		});
	});

	describe('match method', () => {
		it('should match simple template', () => {
			matcher.add('file://foo/{bar}');
			const result = matcher.match('file://foo/hello');

			expect(result).toEqual({
				template: 'file://foo/{bar}',
				params: { bar: 'hello' },
			});
		});

		it('should return null for no match', () => {
			matcher.add('file://foo/{bar}');
			const result = matcher.match('file://baz/hello');

			expect(result).toBeNull();
		});

		it('should match against multiple templates', () => {
			matcher.add('file://foo/{bar}');
			matcher.add('http://example.com/{id}');

			const result1 = matcher.match('file://foo/test');
			expect(result1).toEqual({
				template: 'file://foo/{bar}',
				params: { bar: 'test' },
			});

			const result2 = matcher.match('http://example.com/123');
			expect(result2).toEqual({
				template: 'http://example.com/{id}',
				params: { id: '123' },
			});
		});

		it('should return first matching template', () => {
			matcher.add('api/{version}/users');
			matcher.add('api/{resource}');

			const result = matcher.match('api/v1/users');
			expect(result).toEqual({
				template: 'api/{version}/users',
				params: { version: 'v1' },
			});
		});

		it('should handle templates with multiple variables', () => {
			matcher.add('api/{version}/users/{id}');
			const result = matcher.match('api/v1/users/123');

			expect(result).toEqual({
				template: 'api/{version}/users/{id}',
				params: { version: 'v1', id: '123' },
			});
		});

		it('should handle URL encoding', () => {
			matcher.add('search/{query}');
			const result = matcher.match('search/hello%20world');

			expect(result).toEqual({
				template: 'search/{query}',
				params: { query: 'hello world' },
			});
		});

		it('should throw error for non-string URI', () => {
			expect(() => matcher.match(123 as any)).toThrow(
				'URI must be a string',
			);
		});

		it('should handle empty variable values', () => {
			matcher.add('api/{version}/test');
			const result = matcher.match('api//test');

			expect(result).toEqual({
				template: 'api/{version}/test',
				params: { version: '' },
			});
		});
	});

	describe('clear method', () => {
		it('should clear all templates', () => {
			matcher.add('file://foo/{bar}');
			matcher.add('http://example.com/{id}');

			matcher.clear();
			expect(matcher.all()).toEqual([]);
			expect(matcher.match('file://foo/hello')).toBeNull();
		});
	});

	describe('all method', () => {
		it('should return empty array initially', () => {
			expect(matcher.all()).toEqual([]);
		});

		it('should return all registered templates', () => {
			matcher.add('template1');
			matcher.add('template2');

			expect(matcher.all()).toEqual(['template1', 'template2']);
		});
	});

	describe('complex scenarios', () => {
		it('should handle templates with no variables', () => {
			matcher.add('api/health');
			const result = matcher.match('api/health');

			expect(result).toEqual({
				template: 'api/health',
				params: {},
			});
		});

		it.skip('should handle templates with consecutive variables', () => {
			matcher.add('api/{version}{format}');
			const result = matcher.match('api/v1json');

			expect(result).toEqual({
				template: 'api/{version}{format}',
				params: { version: 'v1json', format: '' },
			});
		});

		it('should handle partial matches correctly', () => {
			matcher.add('api/users/{id}');

			expect(matcher.match('api/users/123/extra')).toBeNull();
			expect(matcher.match('api/users')).toBeNull();
		});
	});
});
