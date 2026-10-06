// // src/neo4j/family-repository.ts

// import { Driver, Session } from "neo4j-driver";

// import { FamilyGraph, Person, Relationship } from "../family/";

// export class FamilyRepository {
//   constructor(private readonly driver: Driver) {}

//   /*
//    * =======================================================
//    * SAVE
//    * =======================================================
//    */

//   async saveFamilyGraph(graph: FamilyGraph): Promise<void> {
//     const session = this.driver.session();

//     try {
//       const tx = session.beginTransaction();

//       try {
//         /*
//          * -------------------------------------------------
//          * 1. FamilyTree
//          * -------------------------------------------------
//          */

//         await tx.run(
//           `
//           MERGE (tree:FamilyTree {
//             id: $treeId
//           })

//           SET tree.updatedAt = datetime()
//           `,
//           {
//             treeId: graph.treeId,
//           },
//         );

//         /*
//          * -------------------------------------------------
//          * 2. Persons
//          * -------------------------------------------------
//          */

//         await tx.run(
//           `
//           MATCH (tree:FamilyTree {
//             id: $treeId
//           })

//           UNWIND $persons AS person

//           MERGE (p:Person {
//             id: person.id
//           })

//           SET
//             p.name = person.name,
//             p.gender = person.gender,
//             p.dob = person.dob,
//             p.dod = person.dod,
//             p.email = person.email,
//             p.phone = person.phone,
//             p.imageUrl = person.imageUrl

//           MERGE (tree)-[:CONTAINS]->(p)
//           `,
//           {
//             treeId: graph.treeId,

//             persons: graph.persons.map(toNeo4jPerson),
//           },
//         );

//         /*
//          * -------------------------------------------------
//          * 3. Relationships
//          * -------------------------------------------------
//          */

//         await tx.run(
//           `
//           UNWIND $relationships AS rel

//           MATCH (from:Person {
//             id: rel.from
//           })

//           MATCH (to:Person {
//             id: rel.to
//           })

//           FOREACH (_ IN CASE
//             WHEN rel.type = "PARENT_OF"
//             THEN [1]
//             ELSE []
//           END |
//             MERGE (from)-[:PARENT_OF]->(to)
//           )

//           FOREACH (_ IN CASE
//             WHEN rel.type = "SPOUSE_OF"
//             THEN [1]
//             ELSE []
//           END |
//             MERGE (from)-[:SPOUSE_OF]->(to)
//           )
//           `,
//           {
//             relationships: graph.relationships,
//           },
//         );

//         /*
//          * -------------------------------------------------
//          * 4. Remove old relationships
//          *
//          * This makes Neo4j reflect the current
//          * saved FamilyGraph.
//          * -------------------------------------------------
//          */

//         await tx.run(
//           `
//           MATCH (tree:FamilyTree {
//             id: $treeId
//           })

//           MATCH (tree)-[:CONTAINS]->(person:Person)

//           MATCH (person)-[r:PARENT_OF|SPOUSE_OF]->(other:Person)

//           WITH
//             r,
//             person.id AS fromId,
//             other.id AS toId,
//             type(r) AS relationshipType

//           WHERE NOT any(rel IN $relationships
//             WHERE
//               rel.from = fromId
//               AND rel.to = toId
//               AND rel.type = relationshipType
//           )

//           DELETE r
//           `,
//           {
//             treeId: graph.treeId,

//             relationships: graph.relationships,
//           },
//         );

//         /*
//          * -------------------------------------------------
//          * 5. Remove people that are no longer part
//          *    of this family tree.
//          *
//          * IMPORTANT:
//          *
//          * We only remove CONTAINS.
//          *
//          * We don't delete Person because the same person
//          * might eventually belong to another tree.
//          * -------------------------------------------------
//          */

//         await tx.run(
//           `
//           MATCH (tree:FamilyTree {
//             id: $treeId
//           })

//           MATCH (tree)-[contains:CONTAINS]->(person:Person)

//           WHERE NOT person.id IN $personIds

//           DELETE contains
//           `,
//           {
//             treeId: graph.treeId,

//             personIds: graph.persons.map((person) => person.id),
//           },
//         );

//         /*
//          * -------------------------------------------------
//          * Everything succeeded.
//          * -------------------------------------------------
//          */

//         await tx.commit();
//       } catch (error) {
//         await tx.rollback();

//         throw error;
//       }
//     } finally {
//       await session.close();
//     }
//   }

//   /*
//    * =======================================================
//    * LOAD
//    * =======================================================
//    */

//   async getFamilyGraph(treeId: string): Promise<FamilyGraph> {
//     const session = this.driver.session();

//     try {
//       /*
//        * -------------------------------------------------
//        * Load people
//        * -------------------------------------------------
//        */

//       const peopleResult = await session.run(
//         `
//           MATCH (tree:FamilyTree {
//             id: $treeId
//           })

//           MATCH (tree)-[:CONTAINS]->(person:Person)

//           RETURN
//             person.id AS id,
//             person.name AS name,
//             person.gender AS gender,
//             person.dob AS dob,
//             person.dod AS dod,
//             person.email AS email,
//             person.phone AS phone,
//             person.imageUrl AS imageUrl
//           `,
//         {
//           treeId,
//         },
//       );

//       const persons: Person[] = peopleResult.records.map((record) => ({
//         id: record.get("id"),

//         name: record.get("name"),

//         gender: record.get("gender") ?? "unknown",

//         dob: record.get("dob") ?? undefined,

//         dod: record.get("dod") ?? undefined,

//         email: record.get("email") ?? undefined,

//         phone: record.get("phone") ?? undefined,

//         imageUrl: record.get("imageUrl") ?? undefined,
//       }));

//       /*
//        * -------------------------------------------------
//        * Load relationships
//        * -------------------------------------------------
//        */

//       const relationshipResult = await session.run(
//         `
//           MATCH (tree:FamilyTree {
//             id: $treeId
//           })

//           MATCH (tree)-[:CONTAINS]->(from:Person)

//           MATCH (from)-[r:PARENT_OF|SPOUSE_OF]->(to:Person)

//           MATCH (tree)-[:CONTAINS]->(to)

//           RETURN
//             from.id AS from,
//             to.id AS to,
//             type(r) AS type
//           `,
//         {
//           treeId,
//         },
//       );

//       const relationships: Relationship[] = relationshipResult.records.map(
//         (record) => ({
//           from: record.get("from"),

//           to: record.get("to"),

//           type: record.get("type") as Relationship["type"],
//         }),
//       );

//       return {
//         treeId,

//         persons,

//         relationships,
//       };
//     } finally {
//       await session.close();
//     }
//   }
// }

// function toNeo4jPerson(person: Person) {
//   return {
//     id: person.id,

//     name: person.name,

//     gender: person.gender ?? null,

//     dob: person.dob ?? null,

//     dod: person.dod ?? null,

//     email: person.email ?? null,

//     phone: person.phone ?? null,

//     imageUrl: person.imageUrl ?? null,
//   };
// }
