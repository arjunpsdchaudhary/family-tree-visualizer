import { decrypt, encrypt } from "paseto-ts/v4";

export type PasetoPayload = {
  sub: string;
  email: string;
  exp: string;
};

const localKey = process.env.PASETO_LOCAL_KEY!;

export function createToken(payload: PasetoPayload): string {
  return encrypt(localKey, payload);
}

export function verifyToken(token: string): PasetoPayload | null {
  try {
    const { payload } = decrypt<PasetoPayload>(localKey, token);

    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
