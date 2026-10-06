import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, getSession } from "@/lib/auth/session";
import { driver } from "@/lib/neo4j";
import { Canvas } from "@/lib/types";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  const session = driver.session();
  const currentTime = Date.now();

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

    const result = await session.run(
      `
    

      CREATE (c:Canvas {
        id: randomUUID(),
        name: $name,
        ownerId: $ownerId,
        createdAt: $currentTime
      })

     

      RETURN c
      `,
      {
        ownerId: user.id,
        name: "Untitled Canvas",
        currentTime: currentTime,
      },
    );

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: "Unable to create Canvas" },
        { status: 404 },
      );
    }

    const canvas = result.records[0].get("c").properties;

    return NextResponse.json(
      {
        id: canvas.id,
        name: canvas.name,
        ownerId: user.id,
      },
      { status: 201 },
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
  } finally {
    session.close();
  }
}

export async function GET(request: NextRequest) {
  const session = driver.session();
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();

    // console.log("id:", id);
    // console.log("length:", id?.length);
    // console.log("JSON:", JSON.stringify(id));

    // const hardcoded = "5c579b69-4fd5-4293-8b85-3da20ce1b8dc";

    // console.log("hardcoded length:", hardcoded.length);
    // console.log("equal:", id === hardcoded);

    if (!id) {
      return NextResponse.json({ message: "no id given" }, { status: 200 });
    }

    const result = await session.run(`MATCH(c {id:$id}) RETURN c`, {
      id: id,
    });
    // console.log("result ", result.records[0]);

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: "Unable to find Canvas", id: id },
        { status: 404 },
      );
    }

    const canvas = result.records[0].get("c").properties;

    return NextResponse.json(
      {
        id: canvas.id,
        name: canvas.name,
        ownerId: canvas.ownerId,
        createdAt: canvas.createdAt,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  } finally {
    session.close();
  }
}
