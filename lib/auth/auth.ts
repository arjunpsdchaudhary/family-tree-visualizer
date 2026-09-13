import { decrypt, encrypt } from "paseto-ts/v4";

export type PasetoPayload = {
  sub: string;
  email: string;

  exp?: string;
};

const localKey = process.env.PASETO_LOCAL_KEY!;

export async function createToken(payload: PasetoPayload): Promise<string> {
  const token = encrypt(localKey, payload);
  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = decrypt<PasetoPayload>(localKey, token);

    return payload;
  } catch {
    return null;
  }
}
