import { cookies } from "next/headers";
import { createToken, PasetoPayload, verifyToken } from "./auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { User } from "../types";
import { decrypt } from "paseto-ts/v4";

const COOKIE_NAME = "tree_session";

export async function setSession(payload: PasetoPayload) {
  const token = createToken(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

const localKey = process.env.PASETO_LOCAL_KEY!;

export async function getSession(): Promise<PasetoPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;
  console.log("token ", token);

  if (!token) return null;

  try {
    const { payload } = decrypt<PasetoPayload>(localKey, token);

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const payload = await getSession();
    if (!payload) {
      return null;
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (!user[0]) {
      return null;
    }

    return {
      id: user[0].id,
      userName: user[0].userName,
      email: user[0].email,
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
