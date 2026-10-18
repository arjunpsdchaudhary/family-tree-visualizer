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


export const RoyalFamilyNepal= {
  "nodes": [
    {
      "id": "family-098c0bf5-f411-4b69-b703-c3e277566e3d",
      "type": "familyUnit",
      "position": {
        "x": 342,
        "y": 822
      },
      "data": {
        "person": {
          "motherId": "21bd40dc-3cf6-441d-916b-9d4616c881d6",
          "gender": "male",
          "dob": "2002-03-01",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-098c0bf5-f411-4b69-b703-c3e277566e3d-jVQHHi5tH4783NX6dEeCHDKw7Ou53I.jpg",
          "name": "Hridayendra Bir Bikram Shah Dev",
          "id": "098c0bf5-f411-4b69-b703-c3e277566e3d"
        },
        "childUnitIds": []
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-09ad6266-7e44-4dc1-b5e6-9e1a9cc0512e",
      "type": "familyUnit",
      "position": {
        "x": 1151,
        "y": 552
      },
      "data": {
        "person": {
          "motherId": "4a7051c1-3507-461e-a369-c57f6c138f07",
          "gender": "male",
          "dob": "1971-06-27",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-09ad6266-7e44-4dc1-b5e6-9e1a9cc0512e-kFiAe7NyFckt8b9YsnjVcxBLcVIluT.jpg",
          "name": "Dipendra Bir Bikram Shah Dev",
          "dod": "2001-06-01",
          "fatherId": "e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
          "id": "09ad6266-7e44-4dc1-b5e6-9e1a9cc0512e"
        },
        "childUnitIds": []
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-62178075-2c71-4d7f-b409-34c8ae308084",
      "type": "familyUnit",
      "position": {
        "x": 193,
        "y": 552
      },
      "data": {
        "person": {
          "motherId": "74ea9ae9-3c29-4efd-b451-3cdce0a97db2",
          "spouseId": "21bd40dc-3cf6-441d-916b-9d4616c881d6",
          "gender": "male",
          "dob": "1971-12-30",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-62178075-2c71-4d7f-b409-34c8ae308084-Y1e7Nm9ixRCVtvLWQDniWLqldsfW9N.jpg",
          "name": "Paras Bir Bikram Shah Dev",
          "fatherId": "c278a4b1-2c3f-4a46-95a9-3fe269d239fb",
          "id": "62178075-2c71-4d7f-b409-34c8ae308084"
        },
        "spouse": {
          "spouseId": "62178075-2c71-4d7f-b409-34c8ae308084",
          "gender": "female",
          "dob": "1976-10-01",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-21bd40dc-3cf6-441d-916b-9d4616c881d6-3Ck0gWUSwK9lc221GwkU2ZRM1dN3WF.jpg",
          "name": "Himani Rajya Laxmi Devi Shah",
          "id": "21bd40dc-3cf6-441d-916b-9d4616c881d6"
        },
        "childUnitIds": [
          "family-eddd87c4-5728-4a20-a715-a4c11251c2dc",
          "family-098c0bf5-f411-4b69-b703-c3e277566e3d",
          "family-32522b2a-2ed3-4519-bf0c-cd62b423527f"
        ]
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-32522b2a-2ed3-4519-bf0c-cd62b423527f",
      "type": "familyUnit",
      "position": {
        "x": 672,
        "y": 822
      },
      "data": {
        "person": {
          "motherId": "21bd40dc-3cf6-441d-916b-9d4616c881d6",
          "gender": "female",
          "dob": "2004-10-16",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-32522b2a-2ed3-4519-bf0c-cd62b423527f-Eb6gjjt7BgJTpuDV9UIXcVAfDlrA7M.jpg",
          "name": "Kritika Rajya Lakshmi Devi Shah",
          "id": "32522b2a-2ed3-4519-bf0c-cd62b423527f"
        },
        "childUnitIds": []
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
      "type": "familyUnit",
      "position": {
        "x": 821,
        "y": 282
      },
      "data": {
        "person": {
          "spouseId": "4a7051c1-3507-461e-a369-c57f6c138f07",
          "gender": "male",
          "dob": "1945-12-28",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/cad9af27-3054-4bba-8bdc-dbc9cd52bf11/nodes/profile-e15bc7f7-3f62-465a-948d-6c80b6ac9d41-USmyyFdzkD0UViq7saJbGnCRA9GwMQ.jpg",
          "name": "Birendra Bir Bikram Shah Dev",
          "dod": "2001-06-01",
          "fatherId": "5673d2a7-4113-4af1-8405-da39e556f8df",
          "id": "e15bc7f7-3f62-465a-948d-6c80b6ac9d41"
        },
        "spouse": {
          "spouseId": "e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
          "gender": "female",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-4a7051c1-3507-461e-a369-c57f6c138f07-YshXOTv2qgAyA2huHDuAIuZSM3Jzfl.jpg",
          "name": "Aishwarya Rajya Lakshmi Devi Shah",
          "dod": "2001-06-01",
          "id": "4a7051c1-3507-461e-a369-c57f6c138f07"
        },
        "childUnitIds": [
          "family-d2179199-c447-44bc-8b08-351e111a4ed5",
          "family-09ad6266-7e44-4dc1-b5e6-9e1a9cc0512e",
          "family-fb2aacdc-ce9b-44d4-9796-96d3a5c537c8"
        ]
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-4ca4b8b7-952c-496d-842c-d5a4d49dd8be",
      "type": "familyUnit",
      "position": {
        "x": 1449,
        "y": 282
      },
      "data": {
        "person": {
          "gender": "male",
          "dob": "1950-01-14",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-4ca4b8b7-952c-496d-842c-d5a4d49dd8be-9fh4uQkZagoSghPiO5mntQUu8ag7NN.jpg",
          "name": "Dhirendra Bir Bikram Shah Dev",
          "dod": "2001-06-01",
          "fatherId": "5673d2a7-4113-4af1-8405-da39e556f8df",
          "id": "4ca4b8b7-952c-496d-842c-d5a4d49dd8be"
        },
        "childUnitIds": []
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-d5940eb0-86b6-49db-af16-c9a5bd1ce772",
      "type": "familyUnit",
      "position": {
        "x": 1341,
        "y": 12
      },
      "data": {
        "person": {
          "spouseId": "5673d2a7-4113-4af1-8405-da39e556f8df",
          "gender": "female",
          "dob": "1926-07-25",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-d5940eb0-86b6-49db-af16-c9a5bd1ce772-uC9o7rtvv9Cq9Rsmh0l5cJbxchJrrb.png",
          "name": "Indra Rajya Lakshmi Devi Shah",
          "dod": "1950-09-04",
          "id": "d5940eb0-86b6-49db-af16-c9a5bd1ce772"
        },
        "spouse": {
          "spouseId": "d5940eb0-86b6-49db-af16-c9a5bd1ce772",
          "gender": "male",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/cad9af27-3054-4bba-8bdc-dbc9cd52bf11/nodes/profile-5673d2a7-4113-4af1-8405-da39e556f8df-S7ZXKF0J2zvvoz2y7EzCAOJVLxXzgF.jpg",
          "name": "Mahendra Bir Bikram Shah Dev",
          "id": "5673d2a7-4113-4af1-8405-da39e556f8df"
        },
        "childUnitIds": [
          "family-c278a4b1-2c3f-4a46-95a9-3fe269d239fb",
          "family-e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
          "family-4ca4b8b7-952c-496d-842c-d5a4d49dd8be",
          "family-935deea7-b3a1-4d9c-8c97-3404c3dfcb2f",
          "family-e0799a3c-dbd0-4dab-8f77-3a5eddf2e645",
          "family-9b4f9067-5900-41f2-ae2a-9b8bf6514931"
        ]
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-c278a4b1-2c3f-4a46-95a9-3fe269d239fb",
      "type": "familyUnit",
      "position": {
        "x": 193,
        "y": 282
      },
      "data": {
        "person": {
          "spouseId": "74ea9ae9-3c29-4efd-b451-3cdce0a97db2",
          "gender": "male",
          "dob": "1947-07-07",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-c278a4b1-2c3f-4a46-95a9-3fe269d239fb-VDkC5Nxt10Rp8CYomEe4MaL8n9xsdD.jpg",
          "name": "Gyanendra Bir Bikram Shah Dev",
          "fatherId": "5673d2a7-4113-4af1-8405-da39e556f8df",
          "id": "c278a4b1-2c3f-4a46-95a9-3fe269d239fb"
        },
        "spouse": {
          "spouseId": "c278a4b1-2c3f-4a46-95a9-3fe269d239fb",
          "gender": "female",
          "dob": "1951-02-18",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-74ea9ae9-3c29-4efd-b451-3cdce0a97db2-LqaFxlSdoDnjCnti69UaMYOXXWrb6Z.jpg",
          "name": "Queen Komal Rajya Lakshmi Devi",
          "id": "74ea9ae9-3c29-4efd-b451-3cdce0a97db2"
        },
        "childUnitIds": [
          "family-62178075-2c71-4d7f-b409-34c8ae308084"
        ]
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-935deea7-b3a1-4d9c-8c97-3404c3dfcb2f",
      "type": "familyUnit",
      "position": {
        "x": 1779,
        "y": 282
      },
      "data": {
        "person": {
          "gender": "female",
          "dob": "1949-01-17",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-935deea7-b3a1-4d9c-8c97-3404c3dfcb2f-LCB7MFoegiklx29DWPyqBMG0rp9tlQ.jpg",
          "name": "Shova Rajya Lakshmi Devi Shahi",
          "dod": "2001-06-01",
          "fatherId": "5673d2a7-4113-4af1-8405-da39e556f8df",
          "id": "935deea7-b3a1-4d9c-8c97-3404c3dfcb2f"
        },
        "childUnitIds": []
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-9b4f9067-5900-41f2-ae2a-9b8bf6514931",
      "type": "familyUnit",
      "position": {
        "x": 2439,
        "y": 282
      },
      "data": {
        "person": {
          "gender": "female",
          "dob": "1940-11-20",
          "name": "Shanti Rajya Lakshmi Devi Singh",
          "dod": "2001-06-01",
          "fatherId": "5673d2a7-4113-4af1-8405-da39e556f8df",
          "id": "9b4f9067-5900-41f2-ae2a-9b8bf6514931"
        },
        "childUnitIds": []
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-d2179199-c447-44bc-8b08-351e111a4ed5",
      "type": "familyUnit",
      "position": {
        "x": 821,
        "y": 552
      },
      "data": {
        "person": {
          "motherId": "4a7051c1-3507-461e-a369-c57f6c138f07",
          "gender": "male",
          "dob": "1978-11-06",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-d2179199-c447-44bc-8b08-351e111a4ed5-1kD9AbrkcylmzJVZPbh3ZZG9ogtIk8.jpg",
          "name": "Nirajan Bir Bikram Shah Dev",
          "dod": "2001-06-01",
          "fatherId": "e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
          "id": "d2179199-c447-44bc-8b08-351e111a4ed5"
        },
        "childUnitIds": []
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-e0799a3c-dbd0-4dab-8f77-3a5eddf2e645",
      "type": "familyUnit",
      "position": {
        "x": 2109,
        "y": 282
      },
      "data": {
        "person": {
          "gender": "female",
          "dob": "1942-02-02",
          "name": "Sharada Rajya Lakshmi Devi Shah",
          "dod": "2001-06-01",
          "fatherId": "5673d2a7-4113-4af1-8405-da39e556f8df",
          "id": "e0799a3c-dbd0-4dab-8f77-3a5eddf2e645"
        },
        "childUnitIds": []
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-eddd87c4-5728-4a20-a715-a4c11251c2dc",
      "type": "familyUnit",
      "position": {
        "x": 12,
        "y": 822
      },
      "data": {
        "person": {
          "motherId": "21bd40dc-3cf6-441d-916b-9d4616c881d6",
          "gender": "female",
          "dob": "2000-12-12",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-eddd87c4-5728-4a20-a715-a4c11251c2dc-IDAo0xiAravRDK8wWg1NpXmqBC0JDN.png",
          "name": "Purnika Rajya Lakshmi Devi Shah",
          "id": "eddd87c4-5728-4a20-a715-a4c11251c2dc"
        },
        "childUnitIds": []
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    },
    {
      "id": "family-fb2aacdc-ce9b-44d4-9796-96d3a5c537c8",
      "type": "familyUnit",
      "position": {
        "x": 1481,
        "y": 552
      },
      "data": {
        "person": {
          "motherId": "4a7051c1-3507-461e-a369-c57f6c138f07",
          "gender": "female",
          "dob": "1976-10-15",
          "imageUrl": "https://wkq8mgxn79abhcsa.public.blob.vercel-storage.com/canvas/4ae02140-a6c6-44b2-99c1-02ca0c41e633/nodes/profile-fb2aacdc-ce9b-44d4-9796-96d3a5c537c8-KfTrKfg8EC6OADe8YNH8iykbSvrELq.jpg",
          "name": "Shruti Rajya Lakshmi Devi Shah",
          "dod": "2001-06-01",
          "fatherId": "e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
          "id": "fb2aacdc-ce9b-44d4-9796-96d3a5c537c8"
        },
        "childUnitIds": []
      },
      "draggable": false,
      "selectable": true,
      "hidden": false
    }
  ],
  "edges": [
    {
      "id": "e-family-62178075-2c71-4d7f-b409-34c8ae308084-family-eddd87c4-5728-4a20-a715-a4c11251c2dc",
      "source": "family-62178075-2c71-4d7f-b409-34c8ae308084",
      "sourceHandle": "children-out",
      "target": "family-eddd87c4-5728-4a20-a715-a4c11251c2dc",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-62178075-2c71-4d7f-b409-34c8ae308084-family-098c0bf5-f411-4b69-b703-c3e277566e3d",
      "source": "family-62178075-2c71-4d7f-b409-34c8ae308084",
      "sourceHandle": "children-out",
      "target": "family-098c0bf5-f411-4b69-b703-c3e277566e3d",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-62178075-2c71-4d7f-b409-34c8ae308084-family-32522b2a-2ed3-4519-bf0c-cd62b423527f",
      "source": "family-62178075-2c71-4d7f-b409-34c8ae308084",
      "sourceHandle": "children-out",
      "target": "family-32522b2a-2ed3-4519-bf0c-cd62b423527f",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-e15bc7f7-3f62-465a-948d-6c80b6ac9d41-family-d2179199-c447-44bc-8b08-351e111a4ed5",
      "source": "family-e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
      "sourceHandle": "children-out",
      "target": "family-d2179199-c447-44bc-8b08-351e111a4ed5",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-e15bc7f7-3f62-465a-948d-6c80b6ac9d41-family-09ad6266-7e44-4dc1-b5e6-9e1a9cc0512e",
      "source": "family-e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
      "sourceHandle": "children-out",
      "target": "family-09ad6266-7e44-4dc1-b5e6-9e1a9cc0512e",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-e15bc7f7-3f62-465a-948d-6c80b6ac9d41-family-fb2aacdc-ce9b-44d4-9796-96d3a5c537c8",
      "source": "family-e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
      "sourceHandle": "children-out",
      "target": "family-fb2aacdc-ce9b-44d4-9796-96d3a5c537c8",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-d5940eb0-86b6-49db-af16-c9a5bd1ce772-family-c278a4b1-2c3f-4a46-95a9-3fe269d239fb",
      "source": "family-d5940eb0-86b6-49db-af16-c9a5bd1ce772",
      "sourceHandle": "children-out",
      "target": "family-c278a4b1-2c3f-4a46-95a9-3fe269d239fb",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-d5940eb0-86b6-49db-af16-c9a5bd1ce772-family-e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
      "source": "family-d5940eb0-86b6-49db-af16-c9a5bd1ce772",
      "sourceHandle": "children-out",
      "target": "family-e15bc7f7-3f62-465a-948d-6c80b6ac9d41",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-d5940eb0-86b6-49db-af16-c9a5bd1ce772-family-4ca4b8b7-952c-496d-842c-d5a4d49dd8be",
      "source": "family-d5940eb0-86b6-49db-af16-c9a5bd1ce772",
      "sourceHandle": "children-out",
      "target": "family-4ca4b8b7-952c-496d-842c-d5a4d49dd8be",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-d5940eb0-86b6-49db-af16-c9a5bd1ce772-family-935deea7-b3a1-4d9c-8c97-3404c3dfcb2f",
      "source": "family-d5940eb0-86b6-49db-af16-c9a5bd1ce772",
      "sourceHandle": "children-out",
      "target": "family-935deea7-b3a1-4d9c-8c97-3404c3dfcb2f",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-d5940eb0-86b6-49db-af16-c9a5bd1ce772-family-e0799a3c-dbd0-4dab-8f77-3a5eddf2e645",
      "source": "family-d5940eb0-86b6-49db-af16-c9a5bd1ce772",
      "sourceHandle": "children-out",
      "target": "family-e0799a3c-dbd0-4dab-8f77-3a5eddf2e645",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-d5940eb0-86b6-49db-af16-c9a5bd1ce772-family-9b4f9067-5900-41f2-ae2a-9b8bf6514931",
      "source": "family-d5940eb0-86b6-49db-af16-c9a5bd1ce772",
      "sourceHandle": "children-out",
      "target": "family-9b4f9067-5900-41f2-ae2a-9b8bf6514931",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    },
    {
      "id": "e-family-c278a4b1-2c3f-4a46-95a9-3fe269d239fb-family-62178075-2c71-4d7f-b409-34c8ae308084",
      "source": "family-c278a4b1-2c3f-4a46-95a9-3fe269d239fb",
      "sourceHandle": "children-out",
      "target": "family-62178075-2c71-4d7f-b409-34c8ae308084",
      "targetHandle": "parent-in",
      "type": "smoothstep",
      "pathOptions": {
        "borderRadius": 2
      },
      "style": {
        "stroke": "#5B7088",
        "strokeWidth": 4
      }
    }
  ]
}