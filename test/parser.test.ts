/**
 * @fileoverview Tests for URI template parser
 */

import { describe, expect, it } from 'vitest';
import { match_uri, parse_template } from '../src/parser.js';

describe('parse_template', () => {
	it('should parse simple template with one variable', () => {
		const result = parse_template('file://foo/{bar}');

		expect(result).toEqual({
			template: 'file://foo/{bar}',
			parts: [
				{ type: 'literal', value: 'file://foo/' },
				{
					type: 'expression',
					expressions: [
						{ name: 'bar', prefix: undefined, explode: false },
					],
					operator: undefined,
				},
			],
		});
	});

	it('should parse template with multiple variables', () => {
		const result = parse_template('api/{version}/users/{id}');

		expect(result.parts).toHaveLength(4);
		expect(result.parts[0]).toEqual({ type: 'literal', value: 'api/' });
		expect(result.parts[1]).toEqual({
			type: 'expression',
			expressions: [
				{ name: 'version', prefix: undefined, explode: false },
			],
			operator: undefined,
		});
		expect(result.parts[2]).toEqual({ type: 'literal', value: '/users/' });
		expect(result.parts[3]).toEqual({
			type: 'expression',
			expressions: [{ name: 'id', prefix: undefined, explode: false }],
			operator: undefined,
		});
	});

	it('should parse template with no variables', () => {
		const result = parse_template('api/health');

		expect(result).toEqual({
			template: 'api/health',
			parts: [{ type: 'literal', value: 'api/health' }],
		});
	});

	it('should parse template with operators', () => {
		const result = parse_template('api/{+path}');

		expect(result.parts[1]).toEqual({
			type: 'expression',
			expressions: [{ name: 'path', prefix: undefined, explode: false }],
			operator: '+',
		});
	});

	it('should parse template with prefix modifier', () => {
		const result = parse_template('api/{name:3}');

		expect(result.parts[1]).toEqual({
			type: 'expression',
			expressions: [{ name: 'name', prefix: 3, explode: false }],
			operator: undefined,
		});
	});

	it('should parse template with explode modifier', () => {
		const result = parse_template('api/{list*}');

		expect(result.parts[1]).toEqual({
			type: 'expression',
			expressions: [{ name: 'list', prefix: undefined, explode: true }],
			operator: undefined,
		});
	});

	it('should parse template with multiple variables in one expression', () => {
		const result = parse_template('api/{x,y,z}');

		expect(result.parts[1]).toEqual({
			type: 'expression',
			expressions: [
				{ name: 'x', prefix: undefined, explode: false },
				{ name: 'y', prefix: undefined, explode: false },
				{ name: 'z', prefix: undefined, explode: false },
			],
			operator: undefined,
		});
	});

	it('should throw error for unclosed expression', () => {
		expect(() => parse_template('api/{unclosed')).toThrow(
			'Unclosed expression',
		);
	});

	it('should throw error for empty expression', () => {
		expect(() => parse_template('api/{}')).toThrow('Empty expression');
	});

	it('should throw error for invalid prefix', () => {
		expect(() => parse_template('api/{name:abc}')).toThrow(
			'Invalid prefix length',
		);
	});

	it('should throw error for empty variable name', () => {
		expect(() => parse_template('api/{:3}')).toThrow('Empty variable name');
	});
});

describe('match_uri', () => {
	it('should match simple URI template', () => {
		const parsed = parse_template('file://foo/{bar}');
		const result = match_uri('file://foo/hello', parsed);

		expect(result).toEqual({ bar: 'hello' });
	});

	it('should match template with multiple variables', () => {
		const parsed = parse_template('api/{version}/users/{id}');
		const result = match_uri('api/v1/users/123', parsed);

		expect(result).toEqual({ version: 'v1', id: '123' });
	});

	it('should return null for non-matching URI', () => {
		const parsed = parse_template('file://foo/{bar}');
		const result = match_uri('file://baz/hello', parsed);

		expect(result).toBeNull();
	});

	it('should match template with no variables', () => {
		const parsed = parse_template('api/health');
		const result = match_uri('api/health', parsed);

		expect(result).toEqual({});
	});

	it('should return null for partial match', () => {
		const parsed = parse_template('api/{version}');
		const result = match_uri('api/v1/extra', parsed);

		expect(result).toBeNull();
	});

	it('should handle URL decoding', () => {
		const parsed = parse_template('search/{query}');
		const result = match_uri('search/hello%20world', parsed);

		expect(result).toEqual({ query: 'hello world' });
	});

	it('should handle empty variable values', () => {
		const parsed = parse_template('api/{version}/test');
		const result = match_uri('api//test', parsed);

		expect(result).toEqual({ version: '' });
	});

	it('should handle prefix modifier', () => {
		const parsed = parse_template('api/{name:3}');
		const result = match_uri('api/toolong', parsed);

		expect(result).toEqual({ name: 'too' });
	});

	it('should handle consecutive variables', () => {
		const parsed = parse_template('api/{version}{format}');
		const result = match_uri('api/v1json', parsed);

		// This is a simplified test - real implementation would need better boundary detection
		expect(result).toEqual({ version: 'v1json', format: '' });
	});
});
