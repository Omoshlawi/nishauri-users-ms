import { string, z } from "zod";

export const Register = z
  .object({
    username: z.string().min(4),
    email: z.string().email(),
    phoneNumber: z.string().min(10).max(12),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const Login = z.object({
  identifier: z.string().min(1, { message: "Identifier required" }),
  password: z.string().min(4, { message: "Password required" }),
});

export const OauthAuthSchema = z.object({
  providerAccountId: z.string(),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().optional(),
  type: z.enum(["google", "apple"]),
  provider: z.string(),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(4),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

export const AccountVerificationSchema = z.object({
  otp: z.string().length(5),
  mode: z.enum(["email", "sms", "watsapp"]),
});
