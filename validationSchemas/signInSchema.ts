import { email, string, z } from "zod";

export const signInSchema = z.object({
  email: email(),
  password: string(),
});
