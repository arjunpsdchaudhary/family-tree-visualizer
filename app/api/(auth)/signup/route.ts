import { db } from "@/db";
import { signUpSchema } from "@/validationSchemas/signUpSchema";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  //   const body = await request.json();

  try {
    // Get request body
    const body = await request.json();

    // Validate input
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { userName, email, password } = result.data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser[0]) {
      console.log("existing user ");
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        userName,
        email,
        password: passwordHash,
      })
      .returning({
        id: users.id,
        userName: users.userName,
        email: users.email,
      });

    if (user) {
      return NextResponse.json(
        { message: "successfully created user...", user: user },
        { status: 201 },
      );
    }
  } catch (error: any) {}

  return NextResponse.json({ message: "hello " }, { status: 200 });
}
