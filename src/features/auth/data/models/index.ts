import prisma from "../../../../../prisma/client";

export { default as User } from "./User";
export { default as Person } from "./Person";
export { default as AccountVerification } from "./AccountVerification";

export const UserModel = prisma.user;
export const PersonModel = prisma.person;
export const AccountVerificationModel = prisma.accountVerification;
