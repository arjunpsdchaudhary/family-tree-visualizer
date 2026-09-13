import { email, string, z } from "zod";

//   id: uuid().primaryKey().defaultRandom(),
//   name: varchar().notNull(),
//   password: text().notNull(),
//   email: varchar({ length: 255 }).notNull().unique(),

export const signUpSchema = z.object({
  userName: z
    .string()
    .min(2, "userName must be at least 2 characters")
    .max(50, "Name is too long"),
  email: z.email("invalid email address"),
  password: string()
    .min(8, "password should be at least 8 characters")
    .max(100, "Password is too long"),
});
