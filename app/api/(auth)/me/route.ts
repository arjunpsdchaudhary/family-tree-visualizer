import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, getSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid or expired token",
          success: "false",
          authenticated: "false",
        },
        { status: 401 },
      );
    }
    // const payload = await getSession();

    // if (!payload) {
    //   return NextResponse.json(
    //     {
    //       message: "Invalid or expired token",
    //       success: "false",
    //       authenticated: "false",
    //     },
    //     { status: 401 },
    //   );
    // }

    // const user = await db
    //   .select()
    //   .from(users)
    //   .where(eq(users.email, payload.email))
    //   .limit(1);

    // if (!user[0]) {
    //   console.log("no user exists");
    // }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: user,
        // user: {
        //   id: user[0].id,
        //   userName: user[0].userName,
        //   email: user[0].email,
        // },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        authenticated: false,
      },
      { status: 500 },
    );
  }
}
