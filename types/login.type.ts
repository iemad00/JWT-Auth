import { Type } from "@sinclair/typebox";

export const LoginType = Type.Object({
	loginToken: Type.String(),
	passcode: Type.String({ minLength: 6, maxLength: 6 }),
});
