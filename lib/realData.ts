import { FamilyUnit, Person } from "./types";

const Persons: Person[] = [
  {
    id: "1",
    name: "a",
    dob: "2024-05-03",
    gender: "male",

    spouseId: "2",
  },
  {
    id: "2",
    name: "b",
    dob: "2024-05-03",
    gender: "female",

    spouseId: "1",
  },
  {
    id: "3",
    name: "c",
    dob: "2024-05-03",
    gender: "male",
    fatherId: "1",
    motherId: "2",
  },
];

export const familyUnits: FamilyUnit[] = [];

export function createFamilyUnit(members: Person[]) {
  members.map(() => {});
}

// {
//     id: "u1",

//     person: {
//       id: "p1",
//       name: "Robert Whitfield",
//       age: 23,
//       imageUrl:
//         "https://media.istockphoto.com/id/598065088/photo/handsome-teenage-boy-with-stylish-haircut-and-bright-clever-eyes.jpg?s=1024x1024&w=is&k=20&c=HkfD1jLynu_ZZtonhs572J98ovLZx7pM33c-4T2iNbw=",
//     },
//     spouse: { id: "p2", name: "Eleanor Whitfield", age: 23 },
//     childUnitIds: ["u3", "u4", "u5", "u6", "u12", "u26"],
//   },

// export interface Person {
//   id: string;
//   name: string;
//   dob?: string;
//   age?: number;
//   gender?: "male" | "female";
//   imageUrl?: string;
// }
