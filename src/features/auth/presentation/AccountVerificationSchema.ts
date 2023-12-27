import { z } from "zod";

const AccountVerificationSchema = z.object({
  otp: z.string().length(5),
  mode: z.enum(["email", "sms", "watsapp"]),
});

export default AccountVerificationSchema;
