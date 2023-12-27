import { z } from "zod";

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(4),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

export default ChangePasswordSchema;
