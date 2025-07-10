import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { UriTemplateExpander } from '../src/expander.js';
import process from 'node:process';

const test_files = [
	'spec-examples.json',
	'spec-examples-by-section.json',
	'extended-tests.json',
	'negative-tests.json',
];

function load_test_file(filename: string) {
	const file_path = join(process.cwd(), 'uritemplate-test', filename);
	return JSON.parse(readFileSync(file_path, 'utf-8'));
}

describe('URI Template RFC 6570 Test Suite', () => {
	test_files.forEach((filename) => {
		describe(filename, () => {
			const test_data = load_test_file(filename);

			Object.entries(test_data).forEach(
				([group_name, group]: [string, any]) => {
					describe(group_name, () => {
						const { variables, testcases } = group;

						testcases.forEach(
							(
								[template, expected]: [string, any],
								index: number,
							) => {
								it(`Case ${index + 1}: ${template}`, () => {
									try {
										const expander =
											new UriTemplateExpander(template);
										const result =
											expander.expand(variables);

										if (expected === false) {
											// This should have failed but didn't
											expect.fail(
												`Expected template "${template}" to fail, but it expanded to "${result}"`,
											);
										} else if (Array.isArray(expected)) {
											// Multiple valid results
											expect(expected).toContain(result);
										} else {
											// Single expected result
											expect(result).toBe(expected);
										}
									} catch (error) {
										if (expected === false) {
											// Expected to fail - this is correct
											expect(true).toBe(true);
										} else {
											// Unexpected failure
											throw error;
										}
									}
								});
							},
						);
					});
				},
			);
		});
	});
});
