import { z } from "zod";

const UserShema = z.object({
  image: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(["U", "M", "F"]),
  email: z.string().email(),
  phoneNumber: z.string(),
  county: z.string(),
  constituency: z.string(),
  bloodGroup: z.enum(["A", "AB", "O", "B"]),
  allergies: z.array(z.string()).default([]),
  disabilities: z.array(z.string()).default([]),
  chronics: z.array(z.string()).default([]),
  weight: z.string(),
  height: z.string(),
  maritalStatus: z.enum(["married", "single", "divorced", "widow-widower"]),
  educationLevel: z.enum([
    "primary",
    "secondary",
    "post-secondary",
    "undergraduate",
    "postgraduate",
  ]),
  primaryLanguage: z.enum(["swahili", "english"]),
  occupation: z.enum(["employed", "self-employed", "unemployed"]),
});

export default UserShema;
