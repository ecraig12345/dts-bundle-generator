export interface PrimitiveValues {
	boolean: false;
	requiredBoolean: true;
	string: '';
	requiredString: 'REQUIRED';
	function: () => void;
}

export type PrimitiveValue = PrimitiveValues[keyof PrimitiveValues];

export interface OneOf {
	oneOf: [PrimitiveValue | SchemeDescriptor<unknown>, PrimitiveValue | SchemeDescriptor<unknown>];
}

export function oneOf(
	schema1: PrimitiveValue | SchemeDescriptor<unknown>,
	schema2: PrimitiveValue | SchemeDescriptor<unknown>
): OneOf {
	return { oneOf: [schema1, schema2] };
}

export type SchemeDescriptor<T> = {
	[P in keyof T]-?: T[P] extends unknown[] ? [SchemeDescriptor<T[P][number]>] : SchemeDescriptor<T[P]> | OneOf;
};

export const schemaPrimitiveValues: Readonly<PrimitiveValues> = {
	boolean: false,
	requiredBoolean: true,
	string: '',
	requiredString: 'REQUIRED',
	function: () => {},
};

const schemaRequiredValues = new Set([
	schemaPrimitiveValues.requiredBoolean,
	schemaPrimitiveValues.requiredString,
]);

export function checkSchemaMatch<T>(value: unknown, schema: SchemeDescriptor<T>, errors: string[]): value is T {
	if (value === undefined) {
		errors.push('Root value is undefined');
		return false;
	}

	return checkSchemaMatchRecursively(value, schema, '', errors);
}

// eslint-disable-next-line complexity
function checkSchemaMatchRecursively<T>(value: unknown, schema: SchemeDescriptor<T> | [SchemeDescriptor<T>] | OneOf, prefix: string, errors: string[]): value is T {
	if (typeof schema === 'boolean' || typeof schema === 'string' || typeof schema === 'function') {
		const schemeType = typeof schema;
		if (value === undefined && schemaRequiredValues.has(schema)) {
			errors.push(`Value for "${prefix}" is required and must have type "${schemeType}"`);
			return false;
		}

		const valueType = typeof value;
		if (value !== undefined && typeof schema !== valueType) {
			errors.push(`Type of values for "${prefix}" is not the same, expected=${schemeType}, actual=${valueType}`);
			return false;
		}

		return true;
	}

	if (value === undefined) {
		return true;
	}

	if (Array.isArray(schema)) {
		if (!Array.isArray(value)) {
			errors.push(`Value for "${prefix}" must be an array`);
			return false;
		}

		let result = true;
		for (let i = 0; i < value.length; ++i) {
			if (!checkSchemaMatchRecursively(value[i], schema[0], `${prefix}[${i}]`, errors)) {
				result = false;
			}
		}

		return result;
	}

	if (isOneOf(schema)) {
		const [schema1, schema2] = schema.oneOf;
		// Use separate error arrays since we throw away the errors if at least one schema matches
		const errors1: string[] = [];
		const errors2: string[] = [];
		const isMatch1 = checkSchemaMatchRecursively(value, schema1, prefix, errors1);
		const isMatch2 = checkSchemaMatchRecursively(value, schema2, prefix, errors2);
		if (!isMatch1 && !isMatch2) {
			errors.push(`Value for "${prefix}" does not match any possible schema:`);
			if (errors1.length) {
				errors.push('  Option 1:', ...errors1.map(error => `  - ${error}`));
			}
			if (errors2.length) {
				errors.push('  Option 2:', ...errors2.map(error => `  - ${error}`));
			}
			return false;
		}

		return true;
	}

	type SchemeKey = keyof SchemeDescriptor<T>;
	type SchemeSubValue = SchemeDescriptor<T[keyof T]>;

	let result = true;
	for (const valueKey of Object.keys(value as object)) {
		if (schema[valueKey as keyof T] === undefined) {
			errors.push(`Excess property "${valueKey}" found in ${prefix.length === 0 ? 'the root' : prefix}`);
			result = false;
		}
	}

	for (const schemaKey of Object.keys(schema)) {
		const isSubValueSchemeMatched = checkSchemaMatchRecursively(
			(value as Record<string, unknown>)[schemaKey],
			schema[schemaKey as SchemeKey] as SchemeSubValue,
			prefix.length === 0 ? schemaKey : `${prefix}.${schemaKey}`,
			errors
		);

		result = result && isSubValueSchemeMatched;
	}

	return result;
}

function isOneOf(schema: SchemeDescriptor<unknown> | OneOf): schema is OneOf {
	return (schema as OneOf).oneOf !== undefined;
}
