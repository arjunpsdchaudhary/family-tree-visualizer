import { NextRequest, NextResponse } from "next/server";
import { driver } from "@/lib/neo4j";
import { toFamilyUnits } from "@/lib/family/transformer";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ canvasId: string }>;
  },
) {
  const { canvasId } = await context.params;
  console.log("canvas id ", canvasId);

  const session = driver.session();

  try {
    const result = await session.run(
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
      spouse: record.get("spouse") ? record.get("spouse").properties : null,
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
    await session.close();
  }
}
