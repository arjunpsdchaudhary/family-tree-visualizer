import type { FamilyUnit } from "./types";

/**
 * Whitfield family — sample dataset.
 *
 * 20 people / 14 family units / 4 generations, deliberately mixing:
 *  - a wide sibling group (6 children in generation 1)
 *  - single (unmarried) people who never gain children
 *  - married couples with and without children
 *  - asymmetric branch depth (some lines stop at gen 2, others reach gen 3)
 *
 * Replace this with data transformed from your own DB (Neo4j or otherwise) —
 * the only contract the layout/rendering code relies on is the FamilyUnit shape.
 */
export const familyUnits: FamilyUnit[] = [
  // ---- Generation 0 ----
  {
    id: "u1",

    person: {
      id: "p1",
      name: "Robert Whitfield",
      email: "arjun@gmail.com",
      phone: "873409389040",
      age: 23,
      imageUrl:
        "https://media.istockphoto.com/id/598065088/photo/handsome-teenage-boy-with-stylish-haircut-and-bright-clever-eyes.jpg?s=1024x1024&w=is&k=20&c=HkfD1jLynu_ZZtonhs572J98ovLZx7pM33c-4T2iNbw=",
    },
    spouse: { id: "p2", name: "Eleanor Whitfield", age: 23 },
    childUnitIds: ["u3", "u4", "u5", "u6", "u12", "u26"],
  },

  // ---- Generation 1 (6 siblings) ----

  {
    id: "u26",

    person: { id: "p39", name: "Michael Whitfield", age: 23, gender: "male" },
    childUnitIds: [],
  },

  {
    id: "u3",

    person: { id: "p4", name: "David Whitfield", age: 23 },
    spouse: { id: "p5", name: "Sarah Whitfield", age: 23, gender: "female" },
    childUnitIds: ["u7", "u8"],
  },
  {
    id: "u4",

    person: { id: "p6", name: "Jennifer Whitfield", age: 23 },
    childUnitIds: ["u101"],
  },
  {
    id: "u101",

    person: { id: "p101", name: "test child", age: 23 },
    childUnitIds: [],
  },
  {
    id: "u5",

    person: { id: "p7", name: "James Whitfield", age: 23 },
    spouse: { id: "p8", name: "Linda Whitfield", age: 23 },
    childUnitIds: ["u9"],
  },

  {
    id: "u6",

    person: { id: "p9", name: "Patricia Whitfield", age: 23 },
    childUnitIds: [],
  },

  {
    id: "u12",

    person: { id: "p10", name: "William Whitfield", age: 23 },
    spouse: { id: "p11", name: "Amanda Whitfield", age: 23 },
    childUnitIds: ["u13"],
  },

  // ---- Generation 2 ----
  {
    id: "u7",

    person: { id: "p12", name: "Emma Whitfield", age: 23 },
    childUnitIds: [],
  },
  {
    id: "u8",

    person: { id: "p13", name: "Daniel Whitfield", age: 23 },
    spouse: { id: "p14", name: "Olivia Whitfield", age: 23 },
    childUnitIds: ["u10", "u11"],
  },
  {
    id: "u9",

    person: { id: "p15", name: "Sophia Whitfield", age: 23 },
    spouse: { id: "p16", name: "Ryan Carter", age: 23 },
    childUnitIds: ["u14"],
  },
  {
    id: "u13",

    person: { id: "p17", name: "Noah Whitfield", age: 23 },
    childUnitIds: [],
  },

  // ---- Generation 3 ----
  {
    id: "u10",

    person: { id: "p18", name: "Lucas Whitfield", age: 23 },
    childUnitIds: [],
  },
  {
    id: "u11",

    person: { id: "p19", name: "Mia Whitfield", age: 23 },
    childUnitIds: [],
  },
  {
    id: "u14",

    person: { id: "p20", name: "Ava Carter", age: 23 },
    childUnitIds: [],
  },
];
