import { auth } from "@/lib/auth";
import { driver } from "@/lib/neo4j";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const db_session = driver.session();

  try {
   // 1. Validate the session automatically using Better Auth & incoming headers
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // 2. Authorization Check: If no session exists, reject immediately
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    // 3. Extract the verified user ID from the session
    const userId = session.user.id;


    const result = await db_session.run(
      `
        MATCH (c:Canvas {ownerId: $ownerId})
        RETURN c
        LIMIT 25
      `,
      {
        ownerId: userId,
      },
    );

    const nodes = result.records.map((record) => {
      const node = record.get("c");

      return node.properties;
    });

    return NextResponse.json(
      {
        msg: "successfully fetched",
        data: nodes,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        msg: "internal server error",
      },
      { status: 500 },
    );
  } finally {
    await db_session.close();
  }
}
