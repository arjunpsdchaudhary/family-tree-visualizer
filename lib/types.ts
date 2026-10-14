export interface Person {
  id: string;
  name: string;
  dob?: string;
  dod?: string;

  age?: number;
  gender?: "male" | "female" | "other";
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  imageUrl?: string;

  email?: string;
  phone?: string;
}

export interface FamilyUnit {
  id: string;
  person: Person;
  spouse?: Person;
  childUnitIds: string[];
  hidden?: boolean;
}

export interface User {
  createdAt: string,
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: null|string;
  updatedAt: string,
}

export interface Canvas {
  id: string;
  name?: string;
  ownerId: string;
  createdAt: string;
  isPublic?: boolean;
}

export interface Relationship {
  from: string;
  to: string;
  label: "SPOUSE" | "CHILD";
}
