
import { auth } from "@/lib/auth";
import { driver } from "@/lib/neo4j";
import { headers } from "next/headers";

import { NextRequest, NextResponse } from "next/server";

export async function POST() {

   const session = await auth.api.getSession({
      headers: await headers()
    });

    if(!session){
      return NextResponse.json({ error: "Unauthorized: Please log in" },
        { status: 401 })
    }

    const userId = session.user.id;
    
  const db_session = driver.session();
  const currentTime = Date.now();

  try {

   


    // const user = await getCurrentUser();
    // if (!user) {
    //   return NextResponse.json(
    //     {
    //       message: "Invalid or expired token",
    //       success: "false",
    //       authenticated: "false",
    //     },
    //     { status: 401 },
    //   );
    // }

    const result = await db_session.run(
      `
    

      CREATE (c:Canvas {
        id: randomUUID(),
        name: $name,
        ownerId: $ownerId,
        createdAt: $currentTime,
        isPublic: false
      })

     

      RETURN c
      `,
      {
        ownerId: userId,
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
        ownerId: userId,
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
    db_session.close();
  }
}

export async function GET(request: NextRequest) {

  

  const db_session = driver.session();
  try {

    
    const id = new URL(request.url).searchParams.get("id")?.trim();

   

    if (!id) {
      return NextResponse.json({ message: "no id given" }, { status: 200 });
    }

    const result = await db_session.run(`MATCH(c {id:$id} ) RETURN c`, {
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


    if(canvas.isPublic){

      console.log("--------------public canvas-------------")

    return NextResponse.json(
      {
        id: canvas.id,
        name: canvas.name,
        ownerId: canvas.ownerId,
        createdAt: canvas.createdAt,
        isPublic: canvas.isPublic,

      },
      { status: 201 },
    );

    }

     console.log("--------------setp 2 canvas-------------")

       const session = await auth.api.getSession({
      headers: await headers()
    });

    if(!session){
      return NextResponse.json({ error: "Unauthorized: Please log in" },
        { status: 401 })
    }

    const userId = session.user.id;

    if(!canvas.isPublic && canvas.ownerId === userId)
    {
      return NextResponse.json(
      {
        id: canvas.id,
        name: canvas.name,
        ownerId: canvas.ownerId,
        createdAt: canvas.createdAt,
        isPublic: canvas.isPublic,

      },
      { status: 201 },
    );

    }

    return NextResponse.json(
      {
        id: canvas.id,
        name: canvas.name,
        ownerId: canvas.ownerId,
        createdAt: canvas.createdAt,
        isPublic: canvas.isPublic,

      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  } finally {
    db_session.close();
  }
}
