"use client";
import { layoutFamilyTree } from "@/lib/elkLayout";
import { FamilyUnit, Person } from "@/lib/types";
import {
  createContext,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import { useFamilyTreeView } from "./FamilyTreeViewContextProvider";
import { familyUnits } from "@/lib/familyData";
import { error } from "console";
import { Edge, Node } from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";

type AddNodeParams =
  | {
      type: "child";
      parentUnitId: string;
      person: Person;
    }
  | {
      type: "spouse";
      unitId: string;
      person: Person;
    };

type CanvasContextType = {
  nodes: Node[];
  edges: Edge[];

  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;

  setSelectedPerson: Dispatch<SetStateAction<Person | undefined>>;
  setSelectedPersonRef: RefObject<
    Dispatch<SetStateAction<Person | undefined>> | undefined
  >;
  selectedPerson: Person | undefined;
  addNode: (params: AddNodeParams) => Promise<void>;
  updatePerson: (person: Person) => Promise<void>;
  deletePerson: (personId: string) => Promise<void>;

  createFirstNode: (person: Person) => Promise<void>;

  loadTestFamilyTree: () => Promise<void>;
  exportPNG: () => Promise<void>;

  exportSVG: () => Promise<void>;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasContexProvider = ({ children }: { children: ReactNode }) => {
  const [nodes, setNodes] = useState<Node[]>([]);

  const [edges, setEdges] = useState<Edge[]>([]);

  const [selectedPerson, setSelectedPerson] = useState<Person>();

  const setSelectedPersonRef =
    useRef<Dispatch<SetStateAction<Person | undefined>>>(undefined);
  //  const handler = (age: number) => {
  //   set
  // };

  //   const { setNodes, setEdges, setSelectedPerson } = useFamilyTreeView();

  // const loadTestFamilyTree = async () => {
  //   const testUnits: FamilyUnit[] = familyUnits.map((unit) => ({
  //     ...unit,

  //     person: {
  //       ...unit.person,
  //     },

  //     spouse: unit.spouse
  //       ? {
  //           ...unit.spouse,
  //         }
  //       : undefined,

  //     childUnitIds: [...unit.childUnitIds],
  //   }));

  //   const result = await layoutFamilyTree(testUnits);

  //   setNodes(result.nodes);

  //   setEdges(result.edges);
  //   console.log("layouted nodes", result.nodes);

  //   if (testUnits.length > 0) {
  //     setSelectedPerson({
  //       ...testUnits[0].person,
  //     });
  //   }
  // };
  const createFirstNode = async (person: Person) => {
    const familyUnitId = `family-${crypto.randomUUID()}`;

    const firstFamilyUnit: FamilyUnit = {
      id: familyUnitId,

      person,

      spouse: undefined,

      childUnitIds: [],

      hidden: false,
    };

    const result = await layoutFamilyTree([firstFamilyUnit]);

    setNodes(result.nodes);

    setEdges(result.edges);

    setSelectedPersonRef.current?.(person);
  };

  /*
   * =========================================================
   * CONVERT REACT FLOW NODES -> FAMILY UNITS
   * =========================================================
   */

  const getFamilyUnits = (): FamilyUnit[] => {
    return nodes.map((node) => {
      const person = node.data?.person as Person;

      const spouse = node.data?.spouse as Person | undefined;

      const childUnitIds =
        (node.data?.childUnitIds as string[] | undefined) ?? [];

      return {
        id: node.id,

        person,

        spouse,

        childUnitIds: [...childUnitIds],

        hidden: node.hidden,
      };
    });
  };

  /*
   * =========================================================
   * ADD CHILD / SPOUSE
   * =========================================================
   */

  const addNode = async (params: AddNodeParams) => {
    const units = getFamilyUnits();

    /*
     * =======================================================
     * ADD CHILD
     * =======================================================
     */

    if (params.type === "child") {
      const { parentUnitId, person: child } = params;

      const parentUnit = units.find((unit) => unit.id === parentUnitId);

      if (!parentUnit) {
        console.error("Parent FamilyUnit not found:", parentUnitId);

        return;
      }

      const childUnitId = `family-${crypto.randomUUID()}`;

      const childPerson: Person = {
        ...child,
      };

      /*
       * Set parent IDs.
       */

      if (parentUnit.person.gender === "male") {
        childPerson.fatherId = parentUnit.person.id;
      }

      if (parentUnit.person.gender === "female") {
        childPerson.motherId = parentUnit.person.id;
      }

      /*
       * If FamilyUnit has spouse,
       * use spouse as the other parent.
       */

      if (parentUnit.spouse) {
        if (parentUnit.spouse.gender === "male") {
          childPerson.fatherId = parentUnit.spouse.id;
        }

        if (parentUnit.spouse.gender === "female") {
          childPerson.motherId = parentUnit.spouse.id;
        }
      }

      const childUnit: FamilyUnit = {
        id: childUnitId,

        person: childPerson,

        spouse: undefined,

        childUnitIds: [],

        hidden: false,
      };

      const updatedUnits = units.map((unit) => {
        if (unit.id !== parentUnitId) {
          return unit;
        }

        return {
          ...unit,

          childUnitIds: [...unit.childUnitIds, childUnitId],
        };
      });

      updatedUnits.push(childUnit);

      const result = await layoutFamilyTree(updatedUnits);

      setNodes(result.nodes);

      setEdges(result.edges);

      setSelectedPersonRef.current?.({
        ...childPerson,
      });

      return;
    }

    /*
     * =======================================================
     * ADD SPOUSE
     * =======================================================
     */

    if (params.type === "spouse") {
      const { unitId, person: spouse } = params;

      const unit = units.find((item) => item.id === unitId);

      if (!unit) {
        console.error("FamilyUnit not found:", unitId);

        return;
      }

      if (unit.spouse) {
        console.error("This FamilyUnit already has a spouse.");

        return;
      }

      const updatedPerson: Person = {
        ...unit.person,

        spouseId: spouse.id,
      };

      const updatedSpouse: Person = {
        ...spouse,

        spouseId: unit.person.id,
      };

      const updatedUnits = units.map((item) => {
        if (item.id !== unitId) {
          return item;
        }

        return {
          ...item,

          person: updatedPerson,

          spouse: updatedSpouse,
        };
      });

      const result = await layoutFamilyTree(updatedUnits);

      setNodes(result.nodes);

      setEdges(result.edges);

      setSelectedPersonRef.current?.({
        ...updatedSpouse,
      });
    }
  };

  /*
   * =========================================================
   * UPDATE PERSON
   * =========================================================
   */

  const updatePerson = async (updatedPerson: Person) => {
    const units = getFamilyUnits();

    let found = false;

    const updatedUnits = units.map((unit) => {
      if (unit.person.id === updatedPerson.id) {
        found = true;

        return {
          ...unit,

          person: {
            ...updatedPerson,
          },
        };
      }

      if (unit.spouse?.id === updatedPerson.id) {
        found = true;

        return {
          ...unit,

          spouse: {
            ...updatedPerson,
          },
        };
      }

      return unit;
    });

    if (!found) {
      console.error(
        "Could not update person. Person not found:",
        updatedPerson.id,
      );

      return;
    }

    /*
     * Keep spouse relationships synchronized.
     */

    const synchronizedUnits = updatedUnits.map((unit) => {
      let updatedUnit = unit;

      /*
       * Main person's spouse.
       */

      if (unit.person.spouseId) {
        const spouseExists = updatedUnits.some(
          (candidate) =>
            candidate.person.id === unit.person.spouseId ||
            candidate.spouse?.id === unit.person.spouseId,
        );

        if (!spouseExists) {
          updatedUnit = {
            ...updatedUnit,

            person: {
              ...updatedUnit.person,

              spouseId: undefined,
            },
          };
        }
      }

      /*
       * Spouse person's spouse.
       */

      if (unit.spouse?.spouseId) {
        const spouseExists = updatedUnits.some(
          (candidate) =>
            candidate.person.id === unit.spouse!.spouseId ||
            candidate.spouse?.id === unit.spouse!.spouseId,
        );

        if (!spouseExists) {
          updatedUnit = {
            ...updatedUnit,

            spouse: {
              ...updatedUnit.spouse!,

              spouseId: undefined,
            },
          };
        }
      }

      return updatedUnit;
    });

    const result = await layoutFamilyTree(synchronizedUnits);

    setNodes(result.nodes);

    setEdges(result.edges);

    setSelectedPersonRef.current?.({
      ...updatedPerson,
    });
  };

  /*
   * =========================================================
   * DELETE PERSON
   * =========================================================
   */

  const deletePerson = async (personId: string) => {
    const units = getFamilyUnits();

    const targetUnit = units.find(
      (unit) => unit.person.id === personId || unit.spouse?.id === personId,
    );

    if (!targetUnit) {
      console.error("Could not delete person. Person not found:", personId);

      return;
    }

    /*
     * =======================================================
     * CASE 1
     *
     * Main person is deleted but spouse remains.
     * =======================================================
     */

    if (targetUnit.person.id === personId && targetUnit.spouse) {
      const remainingUnits = units.map((unit) => {
        if (unit.id !== targetUnit.id) {
          return unit;
        }

        return {
          ...unit,

          spouse: undefined,

          person: {
            ...unit.person,

            spouseId: undefined,
          },
        };
      });

      const cleanedUnits = remainingUnits.map((unit) => {
        const person = {
          ...unit.person,
        };

        if (person.fatherId === personId) {
          person.fatherId = undefined;
        }

        if (person.motherId === personId) {
          person.motherId = undefined;
        }

        let spouse: Person | undefined = undefined;

        if (unit.spouse) {
          spouse = {
            ...unit.spouse,
          };

          if (spouse.fatherId === personId) {
            spouse.fatherId = undefined;
          }

          if (spouse.motherId === personId) {
            spouse.motherId = undefined;
          }
        }

        return {
          ...unit,

          person,

          spouse,
        };
      });

      if (cleanedUnits.length === 0) {
        setNodes([]);

        setEdges([]);

        setSelectedPersonRef.current?.(undefined);

        return;
      }

      const result = await layoutFamilyTree(cleanedUnits);

      setNodes(result.nodes);

      setEdges(result.edges);

      setSelectedPersonRef.current?.(undefined);

      return;
    }

    /*
     * =======================================================
     * CASE 2
     *
     * Spouse is deleted.
     * =======================================================
     */

    if (targetUnit.spouse?.id === personId) {
      const remainingUnits = units.map((unit) => {
        if (unit.id !== targetUnit.id) {
          return unit;
        }

        return {
          ...unit,

          spouse: undefined,

          person: {
            ...unit.person,

            spouseId: undefined,
          },
        };
      });

      const cleanedUnits = remainingUnits.map((unit) => {
        const person = {
          ...unit.person,
        };

        if (person.fatherId === personId) {
          person.fatherId = undefined;
        }

        if (person.motherId === personId) {
          person.motherId = undefined;
        }

        return {
          ...unit,

          person,
        };
      });

      if (cleanedUnits.length === 0) {
        setNodes([]);

        setEdges([]);

        setSelectedPersonRef.current?.(undefined);

        return;
      }

      const result = await layoutFamilyTree(cleanedUnits);

      setNodes(result.nodes);

      setEdges(result.edges);

      setSelectedPersonRef.current?.(undefined);

      return;
    }

    /*
     * =======================================================
     * CASE 3
     *
     * FamilyUnit contains only one person.
     *
     * Delete this FamilyUnit and all descendants.
     * =======================================================
     */

    const unitsToDelete = new Set<string>();

    const collectDescendants = (unitId: string) => {
      if (unitsToDelete.has(unitId)) {
        return;
      }

      unitsToDelete.add(unitId);

      const unit = units.find((item) => item.id === unitId);

      if (!unit) {
        return;
      }

      unit.childUnitIds.forEach((childId) => {
        collectDescendants(childId);
      });
    };

    collectDescendants(targetUnit.id);

    /*
     * Remove deleted units.
     */

    let remainingUnits = units.filter((unit) => !unitsToDelete.has(unit.id));

    /*
     * Remove deleted child references.
     */

    remainingUnits = remainingUnits.map((unit) => ({
      ...unit,

      childUnitIds: unit.childUnitIds.filter(
        (childId) => !unitsToDelete.has(childId),
      ),
    }));

    /*
     * Collect deleted person IDs.
     */

    const deletedPersonIds = new Set<string>();

    units
      .filter((unit) => unitsToDelete.has(unit.id))
      .forEach((unit) => {
        deletedPersonIds.add(unit.person.id);

        if (unit.spouse) {
          deletedPersonIds.add(unit.spouse.id);
        }
      });

    /*
     * Clean parent references.
     */

    remainingUnits = remainingUnits.map((unit) => {
      const person = {
        ...unit.person,
      };

      if (person.fatherId && deletedPersonIds.has(person.fatherId)) {
        person.fatherId = undefined;
      }

      if (person.motherId && deletedPersonIds.has(person.motherId)) {
        person.motherId = undefined;
      }

      let spouse: Person | undefined = undefined;

      if (unit.spouse) {
        spouse = {
          ...unit.spouse,
        };

        if (spouse.fatherId && deletedPersonIds.has(spouse.fatherId)) {
          spouse.fatherId = undefined;
        }

        if (spouse.motherId && deletedPersonIds.has(spouse.motherId)) {
          spouse.motherId = undefined;
        }
      }

      return {
        ...unit,

        person,

        spouse,
      };
    });

    /*
     * Tree is empty.
     */

    if (remainingUnits.length === 0) {
      setNodes([]);

      setEdges([]);

      setSelectedPersonRef.current?.(undefined);

      return;
    }

    /*
     * Recalculate layout.
     */

    const result = await layoutFamilyTree(remainingUnits);

    setNodes(result.nodes);

    setEdges(result.edges);

    setSelectedPersonRef.current?.(undefined);
  };

  const loadTestFamilyTree = async () => {
    const { nodes, edges } = await layoutFamilyTree(familyUnits);
    setNodes(nodes);
    setEdges(edges);
    console.log(nodes);
    console.log("fu :", familyUnits[0].person);
    setSelectedPersonRef.current?.({ ...familyUnits[0].person });
  };

  /*
   * =========================================================
   * EXPORT PNG
   * =========================================================
   */

  const exportPNG = async () => {
    const element = document.querySelector(
      ".family-tree-flow",
    ) as HTMLElement | null;

    if (!element) {
      return;
    }

    const dataUrl = await toPng(element, {
      backgroundColor: "#ffffff",

      pixelRatio: 2,
    });

    const link = document.createElement("a");

    link.download = "family-tree.png";

    link.href = dataUrl;

    link.click();
  };

  /*
   * =========================================================
   * EXPORT SVG
   * =========================================================
   */

  const exportSVG = async () => {
    const element = document.querySelector(
      ".family-tree-flow",
    ) as HTMLElement | null;

    if (!element) {
      return;
    }

    const dataUrl = await toSvg(element, {
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");

    link.download = "family-tree.svg";

    link.href = dataUrl;

    link.click();
  };

  return (
    <CanvasContext.Provider
      value={{
        nodes,
        setNodes,
        edges,
        setEdges,
        setSelectedPerson,
        loadTestFamilyTree,
        selectedPerson,
        setSelectedPersonRef,
        createFirstNode,
        addNode,
        updatePerson,
        deletePerson,
        exportPNG,
        exportSVG,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);

  if (!context) {
    throw new Error("useCanvas should be used inside CanvasContextProvider");
  }

  return context;
};
