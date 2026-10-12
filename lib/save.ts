import { Edge, Node } from "@xyflow/react";
import { Canvas, Person, Relationship } from "./types";
import { driver } from "@/lib/neo4j";

type UnitIdToPersonIdType = {
  unitId: string;
  personId: string;
};

export const saveFamilyTree = async (
  nodes: Node[],
  canvas: Canvas,
) => {
  const session = driver.session();

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

  try {
    await session.executeWrite(async (tx) => {
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
  } finally {
    await session.close();
  }
};
