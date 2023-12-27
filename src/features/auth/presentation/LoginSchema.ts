import { z } from "zod";

const LoginSchema = z
  .object({
    username: z.string().max(30).min(4),
    password: z.string(),
  });

export default LoginSchema;
