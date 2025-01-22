import { Type } from "@sinclair/typebox";

export const VerifyOtpType = Type.Object({
	phone: Type.String({ minLength: 10, maxLength: 15 }),
	otp: Type.String({ minLength: 4, maxLength: 4 }),
	name: Type.Optional(Type.String({ maxLength: 255 })),
});
