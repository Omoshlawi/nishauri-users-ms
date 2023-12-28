import { z } from "zod";

const RegisterSchema = z
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

export default RegisterSchema;
