import { getCurrentUser } from "@/lib/auth/session";
import { driver } from "@/lib/neo4j";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = driver.session();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid or expired token",
          success: false,
          authenticated: false,
        },
        { status: 401 },
      );
    }
    console.log(
      "------------------------------------------------------------------------------",
    );
    console.log("owner id :", user.id);

    const result = await session.run(
      `
        MATCH (c:Canvas {ownerId: $ownerId})
        RETURN c
        LIMIT 25
      `,
      {
        ownerId: user.id,
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
    await session.close();
  }
}
