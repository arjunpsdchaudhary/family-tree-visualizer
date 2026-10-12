import { NextRequest, NextResponse } from "next/server";
import { driver } from "@/lib/neo4j";
import { toFamilyUnits } from "@/lib/family/transformer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {  Node } from "@xyflow/react";
import { Canvas, Person, Relationship } from "@/lib/types";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ canvasId: string }>;
  },
) {
  const { canvasId } = await context.params;

  console.log("canvas id ", canvasId);

  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });

  // Authorization check
  // if (!session) {
  //   return NextResponse.json(
  //     { error: "Unauthorized: Please log in" },
  //     { status: 401 },
  //   );
  // }

  // Extract the verified user ID from the session
  // const userId = session.user.id;

  const db_session = driver.session();

  try {

    const session = await auth.api.getSession({
    headers: await headers(),
  });


   const canvasCheck  = await db_session.run(`MATCH(c {id:$id} ) RETURN c`, {
      id: canvasId,
      
    });

    if (canvasCheck.records.length === 0) {
          return NextResponse.json(
            { error: "Unable to find Canvas", id: canvasId },
            { status: 404 },
          );
        }
    
        const canvas = canvasCheck.records[0].get("c").properties;

        
  // Authorization check
  if (!session && !canvas.isPublic) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in" },
      { status: 401 },
    );
  }

  if(session){
    const userId = session.user.id;
    if(userId !== canvas.ownerId  && !canvas.isPublic){
      return NextResponse.json(
      { error: "Unauthorized: Please log in" },
      { status: 401 },
    );
      
    }
  }



    const result = await db_session.run(
      `
      MATCH (c:Canvas {id: $canvasId})<-[:IN]-(p:Person)

      CALL {
        WITH p

        OPTIONAL MATCH (p)-[:SPOUSE]-(spouse:Person)

        RETURN collect(spouse)[0] AS spouse
      }

      CALL {
        WITH p

        OPTIONAL MATCH (p)-[:CHILD]->(child:Person)

        RETURN collect(child) AS children
      }

      RETURN
        p,
        spouse,
        children
      ORDER BY p.id
      `,
      { canvasId },
    );

    const rows = result.records.map((record) => ({
      person: record.get("p").properties,
      spouse: record.get("spouse")
        ? record.get("spouse").properties
        : null,
      children: record
        .get("children")
        .filter(Boolean)
        .map((node: any) => node.properties),
    }));

    const familyUnits = toFamilyUnits(rows);

    return NextResponse.json({
      version: 1,
      type: "family-tree",
      familyUnits,
    });
  } finally {
    await db_session.close();
  }
}


type UnitIdToPersonIdType = {
  unitId: string;
  personId: string;
};

interface PutBody {
  nodes: Node[];
  canvas: Canvas;
}

export async function PUT(request:NextRequest,
   { params }: { params: Promise<{ canvasId: string }> }
) {

  const db_session = driver.session();

  

  try{

      console.log("---------------------step 01---------------")

      const { canvasId } = await params;

    const body: PutBody = await request.json();
  const { nodes, canvas } = body;

    const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in" },
      { status: 401 },
    );
  }

   console.log("---------------------step 02---------------")

  const userId = session.user.id;

  console.log("-------------userid ----", userId)
  console.log("----canvasid--", canvas)
  
  const result = await db_session.run(`MATCH(c {id:$id, ownerId:$ownerId } ) RETURN c`, {
        id: canvasId,
        ownerId : userId,
        
      });

      console.log("---------------------step 01---------------")
      // console.log("result ", result.records[0]);
  
      if (result.records.length === 0) {
        return NextResponse.json(
          { error: "Unable to find Canvas", id:canvasId  },
          { status: 404 },
        );
      }
  
      // const canvas = result.records[0].get("c").properties;

      const Person: Person[] = [];
  const Relationship: Relationship[] = [];

  const childrensUnitId: string[] = [];

  const unitId_to_personId: UnitIdToPersonIdType[] = [];


  // --------------------------------------------------
  // Get all child unit IDs
  // --------------------------------------------------

  nodes.map((node) => {
    childrensUnitId.push(...(node.data.childUnitIds as string[]));
  });

  // --------------------------------------------------
  // Map child unit IDs to person IDs
  // --------------------------------------------------

  nodes.map((node) => {
    childrensUnitId.map((unitId) => {
      if (unitId === node.id) {
        unitId_to_personId.push({
          unitId: unitId,
          personId: (node.data.person as Person).id,
        });

        return;
      }
    });
  });

  // --------------------------------------------------
  // Build persons and relationships
  // --------------------------------------------------

  nodes.map((node) => {
    const person: Person = node.data.person as Person;
    const spouse = node.data.spouse as Person;

    Person.push(person);

    if (spouse) {
      Person.push(spouse);

      Relationship.push({
        from: person.id,
        to: spouse.id,
        label: "SPOUSE",
      });
    }

    (node.data.childUnitIds as string[]).map((unitId: string) => {
      unitId_to_personId.map((item) => {
        if (item.unitId === unitId) {
          Relationship.push({
            from: person.id,
            to: item.personId,
            label: "CHILD",
          });

          if (spouse) {
            Relationship.push({
              from: spouse.id,
              to: item.personId,
              label: "CHILD",
            });
          }
        }
      });
    });
  });


  await db_session.executeWrite(async (tx) => {
      // --------------------------------------------------
      // 1. Create/update canvas
      // --------------------------------------------------
      // Only the name is updated.
      // ownerId and createdAt remain untouched.
      // --------------------------------------------------

      await tx.run(
        `
        MERGE (c:Canvas {id: $canvasId})
        SET c.name = $canvasName,
            c.isPublic = $isPublic
        `,
        {
          canvasId: canvas.id,
          canvasName: canvas.name,
          isPublic : canvas.isPublic
        },
      );

      // --------------------------------------------------
      // 2. Delete persons that are no longer in the JSON
      // --------------------------------------------------

      await tx.run(
        `
        MATCH (p:Person)-[:IN]->(c:Canvas {id: $canvasId})

        WHERE NOT p.id IN $personIds

        DETACH DELETE p
        `,
        {
          canvasId: canvas.id,
          personIds: Person.map((p) => p.id),
        },
      );

      // --------------------------------------------------
      // 3. Create/update all persons
      // --------------------------------------------------

      await tx.run(
        `
        UNWIND $persons AS person

        MERGE (p:Person {id: person.id})

        SET p = person

        WITH p

        MATCH (c:Canvas {id: $canvasId})

        MERGE (p)-[:IN]->(c)
        `,
        {
          canvasId: canvas.id,
          persons: Person,
        },
      );

      // --------------------------------------------------
      // 4. Delete existing graph relationships
      // --------------------------------------------------

      await tx.run(
        `
        MATCH (a:Person)-[r:SPOUSE|CHILD]->(b:Person)

        MATCH (a)-[:IN]->(:Canvas {id: $canvasId})
        MATCH (b)-[:IN]->(:Canvas {id: $canvasId})

        DELETE r
        `,
        {
          canvasId: canvas.id,
        },
      );

      // --------------------------------------------------
      // 5. Separate relationships
      // --------------------------------------------------

      const spouseRelationships = Relationship.filter(
        (r) => r.label === "SPOUSE",
      );

      const childRelationships = Relationship.filter(
        (r) => r.label === "CHILD",
      );

      // --------------------------------------------------
      // 6. Re-create SPOUSE relationships
      // --------------------------------------------------

      await tx.run(
        `
        UNWIND $relationships AS rel

        MATCH (from:Person {id: rel.from})
        MATCH (to:Person {id: rel.to})

        MATCH (from)-[:IN]->(:Canvas {id: $canvasId})
        MATCH (to)-[:IN]->(:Canvas {id: $canvasId})

        MERGE (from)-[:SPOUSE]->(to)
        `,
        {
          canvasId: canvas.id,
          relationships: spouseRelationships,
        },
      );

      // --------------------------------------------------
      // 7. Re-create CHILD relationships
      // --------------------------------------------------

      await tx.run(
        `
        UNWIND $relationships AS rel

        MATCH (from:Person {id: rel.from})
        MATCH (to:Person {id: rel.to})

        MATCH (from)-[:IN]->(:Canvas {id: $canvasId})
        MATCH (to)-[:IN]->(:Canvas {id: $canvasId})

        MERGE (from)-[:CHILD]->(to)
        `,
        {
          canvasId: canvas.id,
          relationships: childRelationships,
        },
      );
    });

    return NextResponse.json({msg:"sucessfully updated "},{status:201})


  }catch{

    return NextResponse.json(
      { error: "Unexpected error came" },
      { status: 500 },
    );

  }finally{
    db_session.close();

  }


}