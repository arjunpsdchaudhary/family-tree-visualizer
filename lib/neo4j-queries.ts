import { driver } from "./neo4j";

export async function getPeople() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (p:Person)
      RETURN p
      ORDER BY p.name
    `);

    return result.records.map((record) => {
      const person = record.get("p");

      return {
        id: person.properties.id,
        name: person.properties.name,
      };
    });
  } finally {
    await session.close();
  }
}
