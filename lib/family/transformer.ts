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
    const person = row.person;
    const spouse = row.spouse ?? undefined;

    if (spouse) {
      // Use the NEWEST (larger ULID) as the canonical family anchor 
      // so the last created person is treated as the primary person.
      const primaryId = person.id > spouse.id ? person.id : spouse.id;
      personToUnit.set(person.id, `family-${primaryId}`);
      personToUnit.set(spouse.id, `family-${primaryId}`);
    } else {
      personToUnit.set(person.id, `family-${person.id}`);
    }
  }

  // --------------------------------------------------
  // 2. Build FamilyUnits (Deduplicating bidirectional spouse rows)
  // --------------------------------------------------

  const familyUnits: FamilyUnit[] = [];
  const processedCouples = new Set<string>();
  const processedSingles = new Set<string>();

  for (const row of rows) {
    const person = row.person;
    const spouse = row.spouse ?? undefined;

    if (spouse) {
      // Sort IDs descending so the NEWER person is `p1` (main person)
      // and the OLDER person is `p2` (spouse)
      const [p1, p2] = person.id > spouse.id ? [person, spouse] : [spouse, person];
      const coupleKey = `${p1.id}-${p2.id}`;

      if (processedCouples.has(coupleKey)) {
        continue;
      }
      processedCouples.add(coupleKey);

      const childUnitIds = row.children
        .map((child) => personToUnit.get(child.id))
        .filter((id): id is string => Boolean(id));

      familyUnits.push({
        id: `family-${p1.id}`,
        person: p1,
        spouse: p2,
        childUnitIds: Array.from(new Set(childUnitIds)),
      });
    } else {
      if (processedSingles.has(person.id)) {
        continue;
      }
      processedSingles.add(person.id);

      const childUnitIds = row.children
        .map((child) => personToUnit.get(child.id))
        .filter((id): id is string => Boolean(id));

      familyUnits.push({
        id: `family-${person.id}`,
        person,
        childUnitIds: Array.from(new Set(childUnitIds)),
      });
    }
  }

  return familyUnits;
}