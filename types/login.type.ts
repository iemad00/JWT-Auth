import { Type } from "@sinclair/typebox";

export const LoginType = Type.Object({
	loginToken: Type.String(),
	passcode: Type.Optional(Type.String({ minLength: 4, maxLength: 10 })),
});
