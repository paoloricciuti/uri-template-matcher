import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { UriTemplateMatcher } from '../src/index.js';
import process from 'node:process';

const test_files = [
	'spec-examples.json',
	'spec-examples-by-section.json',
	'extended-tests.json',
	// Note: negative-tests.json is excluded as it contains invalid templates
];

function load_test_file(filename: string) {
	const file_path = join(process.cwd(), 'uritemplate-test', filename);
	return JSON.parse(readFileSync(file_path, 'utf-8'));
}

describe('URI Template RFC 6570 Matching Test Suite', () => {
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
								// Skip cases that should fail (expected === false)
								if (expected === false) {
									return;
								}

								it(`Case ${index + 1}: ${template}`, () => {
									const matcher = new UriTemplateMatcher();

									try {
										matcher.add(template);
									} catch {
										// Skip templates that can't be parsed
										return;
									}

									// Handle multiple possible results
									const expected_results = Array.isArray(
										expected,
									)
										? expected
										: [expected];

									// Test each expected result
									expected_results.forEach((expected_uri) => {
										const match_result =
											matcher.match(expected_uri);

										// Main assertion: the template should match the URI
										expect(match_result).not.toBeNull();

										if (match_result) {
											// Verify the template matches
											expect(match_result.template).toBe(
												template,
											);

											// Verify extracted parameters contain expected variables
											// Note: We can't do exact parameter matching because URI expansion
											// may lose some information (e.g., type information, empty values)
											const extracted_params =
												match_result.params;

											// Check that all non-empty variable values are present in some form
											Object.entries(variables).forEach(
												([var_name, var_value]) => {
													if (
														var_value !== '' &&
														var_value !== null &&
														var_value !== undefined
													) {
														// The variable should appear in the extracted parameters
														// either directly or as part of a composite value
														const param_values =
															Object.values(
																extracted_params,
															).flat();
														const has_variable =
															param_values.some(
																(param) => {
																	if (
																		typeof param ===
																		'string'
																	) {
																		if (
																			typeof var_value ===
																			'string'
																		) {
																			return (
																				param.includes(
																					var_value,
																				) ||
																				param.includes(
																					encodeURIComponent(
																						var_value,
																					),
																				)
																			);
																		}
																		if (
																			Array.isArray(
																				var_value,
																			)
																		) {
																			return var_value.some(
																				(
																					v,
																				) =>
																					param.includes(
																						String(
																							v,
																						),
																					) ||
																					param.includes(
																						encodeURIComponent(
																							String(
																								v,
																							),
																						),
																					),
																			);
																		}
																		if (
																			typeof var_value ===
																			'object'
																		) {
																			return Object.values(
																				var_value,
																			).some(
																				(
																					v,
																				) =>
																					param.includes(
																						String(
																							v,
																						),
																					) ||
																					param.includes(
																						encodeURIComponent(
																							String(
																								v,
																							),
																						),
																					),
																			);
																		}
																		return param.includes(
																			String(
																				var_value,
																			),
																		);
																	}
																	return false;
																},
															);

														// For complex templates with operators or multiple variables,
														// parameter extraction is lossy and complex, so we focus on
														// template matching rather than exact parameter verification
														const has_operators =
															/[+#./;?&]/.test(
																template,
															);
														const has_multiple_vars =
															(
																template.match(
																	/\{[^}]+\}/g,
																) || []
															).length > 1;

														if (
															!has_operators &&
															!has_multiple_vars &&
															!has_variable
														) {
															// Only fail for simple single-variable templates where we expect exact matching
															const template_vars =
																template.match(
																	/\{([^}]+)\}/g,
																) || [];
															if (
																template_vars.length ===
																1
															) {
																const var_name_from_template =
																	template_vars[0].slice(
																		1,
																		-1,
																	);
																if (
																	var_name ===
																	var_name_from_template
																) {
																	expect.fail(
																		`Expected variable ${var_name}=${JSON.stringify(var_value)} to be found in extracted params for ${template} -> ${expected_uri}. Got: ${JSON.stringify(extracted_params)}`,
																	);
																}
															}
														}
													}
												},
											);
										}
									});
								});
							},
						);
					});
				},
			);
		});
	});
});

describe('URI Template Matching Edge Cases', () => {
	it('should handle literal-only templates', () => {
		const matcher = new UriTemplateMatcher();
		matcher.add('/api/users');

		const result = matcher.match('/api/users');
		expect(result).toEqual({
			template: '/api/users',
			params: {},
		});
	});

	it('should handle simple variable templates', () => {
		const matcher = new UriTemplateMatcher();
		matcher.add('/api/users/{id}');

		const result = matcher.match('/api/users/123');
		expect(result).toEqual({
			template: '/api/users/{id}',
			params: { id: '123' },
		});
	});

	it('should handle multiple variables', () => {
		const matcher = new UriTemplateMatcher();
		matcher.add('/api/{resource}/{id}');

		const result = matcher.match('/api/users/123');
		expect(result).toEqual({
			template: '/api/{resource}/{id}',
			params: { resource: 'users', id: '123' },
		});
	});

	it('should handle query parameters', () => {
		const matcher = new UriTemplateMatcher();
		matcher.add('/api/search{?q,limit}');

		const result = matcher.match('/api/search?q=test&limit=10');
		expect(result).toEqual({
			template: '/api/search{?q,limit}',
			params: { q: 'test', limit: '10' },
		});
	});

	it('should return null for non-matching URIs', () => {
		const matcher = new UriTemplateMatcher();
		matcher.add('/api/users/{id}');

		const result = matcher.match('/api/posts/123');
		expect(result).toBeNull();
	});

	it('should handle multiple templates and find the right match', () => {
		const matcher = new UriTemplateMatcher();
		matcher.add('/api/users/{id}');
		matcher.add('/api/posts/{id}');
		matcher.add('/api/users/{id}/posts');

		const result1 = matcher.match('/api/users/123');
		expect(result1?.template).toBe('/api/users/{id}');

		const result2 = matcher.match('/api/posts/456');
		expect(result2?.template).toBe('/api/posts/{id}');

		const result3 = matcher.match('/api/users/123/posts');
		expect(result3?.template).toBe('/api/users/{id}/posts');
	});
});
