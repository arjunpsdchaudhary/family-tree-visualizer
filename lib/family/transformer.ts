export interface Neo4jPerson {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  dob?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export interface FamilyUnit {
  id: string;
  person: Neo4jPerson;
  spouse?: Neo4jPerson;
  childUnitIds: string[];
}

interface FamilyQueryRow {
  person: Neo4jPerson;
  spouse?: Neo4jPerson | null;
  children: Neo4jPerson[];
}

export function toFamilyUnits(rows: FamilyQueryRow[]): FamilyUnit[] {
  const personToUnit = new Map<string, string>();

  // --------------------------------------------------
  // 1. Give every person a deterministic family unit ID
  // --------------------------------------------------

  for (const row of rows) {
    personToUnit.set(row.person.id, `family-${row.person.id}`);
  }

  // --------------------------------------------------
  // 2. Build FamilyUnits
  // --------------------------------------------------

  const familyUnits: FamilyUnit[] = [];

  for (const row of rows) {
    const person = row.person;
    const spouse = row.spouse ?? undefined;

    // If this person has a spouse, only create the
    // family unit from one side of the relationship.
    //
    // This prevents:
    //
    // Bekaru + Santi
    // Santi + Bekaru
    //
    // from becoming two units.

    if (spouse && person.id > spouse.id) {
      continue;
    }

    const childUnitIds = row.children
      .map((child) => personToUnit.get(child.id))
      .filter((id): id is string => Boolean(id));

    familyUnits.push({
      id: `family-${person.id}`,

      person,

      ...(spouse
        ? {
            spouse,
          }
        : {}),

      childUnitIds,
    });
  }

  return familyUnits;
}
