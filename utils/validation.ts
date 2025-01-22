import type { Static, TSchema } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export class ValidationError extends Error {
	constructor(public errors: string[]) {
		super("Validation Error");
		this.name = "ValidationError";
	}
}

export const validateRequest = <T extends TSchema>(
	data: unknown,
	schema: T,
): Static<T> => {
	const check = TypeCompiler.Compile(schema);

	if (!check.Check(data)) {
		const errorMessages = [...check.Errors(data)].map(
			(error) => `${error.path}: ${error.message}`,
		);
		throw new ValidationError(errorMessages);
	}

	return data as Static<T>;
};
