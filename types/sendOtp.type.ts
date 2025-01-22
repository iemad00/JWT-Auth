import { Type } from "@sinclair/typebox";

const saudiNumPattern =
	/^(009665|9665|\+9665|05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;

export const SendOtpType = Type.Object({
	phone: Type.String({
		minLength: 10,
		maxLength: 15,
		pattern: saudiNumPattern.source,
	}),
});
