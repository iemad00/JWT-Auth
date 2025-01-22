import { type Static, Type } from "@sinclair/typebox";

export const UserInfoType = Type.Object({
	name: Type.Optional(Type.String()),
	email: Type.Optional(Type.String({ format: "email" })),
});

export type UserInfo = Static<typeof UserInfoType>;
