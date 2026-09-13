import { db } from "@/db";
import { users } from "@/db/schema";
import { PasetoPayload } from "@/lib/auth/auth";
import { setSession } from "@/lib/auth/session";
import { signInSchema } from "@/validationSchemas/signInSchema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = signInSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Vaidation Error",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const { email, password } = result.data;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user[0]) {
      return NextResponse.json(
        { message: "Invalid credentials..." },
        { status: 401 },
      );
    }

    const { id } = user[0];

    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (isPasswordValid) {
      const payload: PasetoPayload = {
        sub: id,
        email,
      };

      await setSession(payload);

      return NextResponse.json(
        { message: "user signin successfully" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: "Invalid credentials..." },
      { status: 401 },
    );
  } catch (error: any) {
    console.log("error :", error);
  }
}
