import { Type } from "@sinclair/typebox";

export const SendOtpType = Type.Object({
	phone: Type.String({ minLength: 10, maxLength: 15 }),
});
