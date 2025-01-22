import { Type } from "@sinclair/typebox";

export const RefreshTokenType = Type.Object({
	refreshToken: Type.String({ minLength: 10 }),
	passcode: Type.String({ minLength: 6, maxLength: 6 }),
});
