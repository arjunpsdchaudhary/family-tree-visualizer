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
