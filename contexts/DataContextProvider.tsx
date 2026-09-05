"use client";

import { FamilyUnit, Person } from "@/lib/types";
import { familyUnits } from "@/lib/familyData";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { toPng, toSvg } from "html-to-image";
import { layoutFamilyTree } from "@/lib/elkLayout";

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

type DataContextType = {
  nodes: Node[];
  edges: Edge[];

  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;

  ToogleNodes: (node: Node, toogle: boolean) => void;

  selectedPerson: Person | undefined;

  setSelectedPerson: Dispatch<SetStateAction<Person | undefined>>;

  createFirstNode: (person: Person) => Promise<void>;

  addNode: (params: AddNodeParams) => Promise<void>;

  updatePerson: (person: Person) => Promise<void>;

  deletePerson: (personId: string) => Promise<void>;

  loadTestFamilyTree: () => Promise<void>;

  exportPNG: () => Promise<void>;

  exportSVG: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataContextProvider = ({ children }: { children: ReactNode }) => {
  const [nodes, setNodes] = useState<Node[]>([]);

  const [edges, setEdges] = useState<Edge[]>([]);

  const [selectedPerson, setSelectedPerson] = useState<Person>();

  const { getNode, setCenter, getZoom } = useReactFlow();

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
   * CREATE FIRST NODE
   * =========================================================
   */

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

    setSelectedPerson(person);
  };

  /*
   * =========================================================
   * LOAD TEST FAMILY TREE
   * =========================================================
   */

  const loadTestFamilyTree = async () => {
    const testUnits: FamilyUnit[] = familyUnits.map((unit) => ({
      ...unit,

      person: {
        ...unit.person,
      },

      spouse: unit.spouse
        ? {
            ...unit.spouse,
          }
        : undefined,

      childUnitIds: [...unit.childUnitIds],
    }));

    const result = await layoutFamilyTree(testUnits);

    setNodes(result.nodes);

    setEdges(result.edges);

    if (testUnits.length > 0) {
      setSelectedPerson({
        ...testUnits[0].person,
      });
    }
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

      setSelectedPerson({
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

      setSelectedPerson({
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

    setSelectedPerson({
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

        setSelectedPerson(undefined);

        return;
      }

      const result = await layoutFamilyTree(cleanedUnits);

      setNodes(result.nodes);

      setEdges(result.edges);

      setSelectedPerson(undefined);

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

        setSelectedPerson(undefined);

        return;
      }

      const result = await layoutFamilyTree(cleanedUnits);

      setNodes(result.nodes);

      setEdges(result.edges);

      setSelectedPerson(undefined);

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

      setSelectedPerson(undefined);

      return;
    }

    /*
     * Recalculate layout.
     */

    const result = await layoutFamilyTree(remainingUnits);

    setNodes(result.nodes);

    setEdges(result.edges);

    setSelectedPerson(undefined);
  };

  /*
   * =========================================================
   * TOGGLE DESCENDANTS
   * =========================================================
   */

  const ToogleNodes = (node: Node, toogle: boolean) => {
    const findDescendentsOf = (currentNode: Node) => {
      edges
        .filter((edge) => edge.source === currentNode.id)
        .forEach((edge) => {
          const nextNode = getNode(edge.target);

          if (nextNode) {
            setNodes((currentNodes) =>
              currentNodes.map((n) =>
                n.id === nextNode.id
                  ? {
                      ...n,
                      hidden: toogle,
                    }
                  : n,
              ),
            );

            findDescendentsOf(nextNode);
          }
        });
    };

    findDescendentsOf(node);
  };

  /*
   * =========================================================
   * KEYBOARD NAVIGATION
   * =========================================================
   *
   * IMPORTANT:
   *
   * React Flow has ONE node for a FamilyUnit.
   *
   * A FamilyUnit can contain:
   *
   *   person
   *   spouse
   *
   * Therefore we create "virtual navigation targets".
   *
   * Example:
   *
   * FamilyUnit A:
   *
   *   Person A  ->  Spouse A
   *
   * FamilyUnit B:
   *
   *   Person B  ->  Spouse B
   *
   * Keyboard navigation works with all four people,
   * even though React Flow only has two actual nodes.
   * =========================================================
   */

  useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      /*
       * =======================================================
       * DO NOT INTERFERE WITH FORM INPUTS
       * =======================================================
       */

      const target = event.target as HTMLElement | null;

      if (target) {
        const tagName = target.tagName.toLowerCase();

        const isTypingElement =
          tagName === "input" ||
          tagName === "textarea" ||
          tagName === "select" ||
          target.isContentEditable;

        if (isTypingElement) {
          return;
        }
      }

      /*
       * =======================================================
       * ESC
       * =======================================================
       */

      if (event.key === "Escape") {
        if (selectedPerson) {
          event.preventDefault();

          setSelectedPerson(undefined);
        }

        return;
      }

      /*
       * =======================================================
       * ONLY ARROW KEYS
       * =======================================================
       */

      const navigationKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ];

      if (!navigationKeys.includes(event.key)) {
        return;
      }

      /*
       * We need an active person.
       */

      if (!selectedPerson) {
        return;
      }

      /*
       * =======================================================
       * NODE DIMENSIONS
       * =======================================================
       */

      const getNodeDimensions = (node: Node) => {
        const width = node.measured?.width ?? node.width ?? 0;

        const height = node.measured?.height ?? node.height ?? 0;

        return {
          width,
          height,
        };
      };

      /*
       * =======================================================
       * BUILD VIRTUAL PERSON TARGETS
       * =======================================================
       *
       * Every FamilyUnit becomes:
       *
       *   [person]
       *
       * or
       *
       *   [person] [spouse]
       *
       * The important part is that person and spouse have
       * different virtual X coordinates.
       * =======================================================
       */

      type NavigationTarget = {
        node: Node;

        person: Person;

        isSpouse: boolean;

        x: number;

        y: number;
      };

      const navigationTargets: NavigationTarget[] = [];

      nodes
        .filter((node) => !node.hidden)
        .forEach((node) => {
          const person = node.data?.person as Person | undefined;

          const spouse = node.data?.spouse as Person | undefined;

          if (!person) {
            return;
          }

          const { width, height } = getNodeDimensions(node);

          /*
           * ---------------------------------------------------
           * SINGLE PERSON FAMILY UNIT
           * ---------------------------------------------------
           */

          if (!spouse) {
            navigationTargets.push({
              node,

              person,

              isSpouse: false,

              x: node.position.x + width / 2,

              y: node.position.y + height / 2,
            });

            return;
          }

          /*
           * ---------------------------------------------------
           * FAMILY UNIT WITH PERSON + SPOUSE
           * ---------------------------------------------------
           *
           * We intentionally divide the FamilyUnit into
           * two horizontal navigation areas.
           *
           * This means:
           *
           *   person = left half
           *   spouse = right half
           *
           * This matches the usual visual arrangement of
           * spouses inside a FamilyUnit.
           */

          navigationTargets.push({
            node,

            person,

            isSpouse: false,

            x: node.position.x + width * 0.25,

            y: node.position.y + height / 2,
          });

          navigationTargets.push({
            node,

            person: spouse,

            isSpouse: true,

            x: node.position.x + width * 0.75,

            y: node.position.y + height / 2,
          });
        });

      if (navigationTargets.length === 0) {
        return;
      }

      /*
       * =======================================================
       * FIND CURRENT TARGET
       * =======================================================
       */

      const currentTarget = navigationTargets.find(
        (target) => target.person.id === selectedPerson.id,
      );

      if (!currentTarget) {
        return;
      }

      /*
       * =======================================================
       * SAME FAMILY UNIT PERSON <-> SPOUSE NAVIGATION
       * =======================================================
       *
       * This is the important fix.
       *
       * Because person and spouse share the same React Flow
       * node ID, we explicitly check them as separate targets.
       *
       * LEFT:
       *
       *   spouse -> person
       *
       * RIGHT:
       *
       *   person -> spouse
       *
       * We only use this shortcut when the spouse exists.
       * =======================================================
       */

      const sameFamilyTargets = navigationTargets.filter(
        (target) =>
          target.node.id === currentTarget.node.id &&
          target.person.id !== currentTarget.person.id,
      );

      /*
       * -------------------------------------------------------
       * RIGHT: PERSON -> SPOUSE
       * -------------------------------------------------------
       */

      if (event.key === "ArrowRight" && !currentTarget.isSpouse) {
        const spouseTarget = sameFamilyTargets.find(
          (target) => target.isSpouse,
        );

        if (spouseTarget) {
          event.preventDefault();

          setSelectedPerson({
            ...spouseTarget.person,
          });

          /*
           * Keep the same zoom.
           *
           * We only move the viewport center.
           */

          try {
            setCenter(spouseTarget.x, spouseTarget.y, {
              zoom: getZoom(),
              duration: 250,
            });
          } catch (error) {
            console.warn("Could not center spouse target:", error);
          }

          return;
        }
      }

      /*
       * -------------------------------------------------------
       * LEFT: SPOUSE -> PERSON
       * -------------------------------------------------------
       */

      if (event.key === "ArrowLeft" && currentTarget.isSpouse) {
        const personTarget = sameFamilyTargets.find(
          (target) => !target.isSpouse,
        );

        if (personTarget) {
          event.preventDefault();

          setSelectedPerson({
            ...personTarget.person,
          });

          try {
            setCenter(personTarget.x, personTarget.y, {
              zoom: getZoom(),
              duration: 250,
            });
          } catch (error) {
            console.warn("Could not center person target:", error);
          }

          return;
        }
      }

      /*
       * =======================================================
       * FIND OTHER FAMILY UNIT TARGETS
       * =======================================================
       *
       * Remove the current FamilyUnit because we already
       * handled person <-> spouse navigation above.
       * =======================================================
       */

      const otherTargets = navigationTargets.filter(
        (target) => target.node.id !== currentTarget.node.id,
      );

      if (otherTargets.length === 0) {
        return;
      }

      /*
       * =======================================================
       * DIRECTIONAL CANDIDATES
       * =======================================================
       */

      type Candidate = {
        target: NavigationTarget;

        primaryDistance: number;

        secondaryDistance: number;

        score: number;
      };

      const candidates: Candidate[] = [];

      otherTargets.forEach((candidateTarget) => {
        const dx = candidateTarget.x - currentTarget.x;

        const dy = candidateTarget.y - currentTarget.y;

        const horizontalDistance = Math.abs(dx);

        const verticalDistance = Math.abs(dy);

        let isCandidate = false;

        let primaryDistance = 0;

        let secondaryDistance = 0;

        /*
         * -----------------------------------------------------
         * LEFT
         * -----------------------------------------------------
         */

        if (event.key === "ArrowLeft" && dx < 0) {
          isCandidate = true;

          primaryDistance = horizontalDistance;

          secondaryDistance = verticalDistance;
        }

        /*
         * -----------------------------------------------------
         * RIGHT
         * -----------------------------------------------------
         */

        if (event.key === "ArrowRight" && dx > 0) {
          isCandidate = true;

          primaryDistance = horizontalDistance;

          secondaryDistance = verticalDistance;
        }

        /*
         * -----------------------------------------------------
         * UP
         * -----------------------------------------------------
         */

        if (event.key === "ArrowUp" && dy < 0) {
          isCandidate = true;

          primaryDistance = verticalDistance;

          secondaryDistance = horizontalDistance;
        }

        /*
         * -----------------------------------------------------
         * DOWN
         * -----------------------------------------------------
         */

        if (event.key === "ArrowDown" && dy > 0) {
          isCandidate = true;

          primaryDistance = verticalDistance;

          secondaryDistance = horizontalDistance;
        }

        if (!isCandidate) {
          return;
        }

        /*
         * =====================================================
         * NAVIGATION SCORE
         * =====================================================
         *
         * Primary axis is more important than secondary axis.
         *
         * A node directly above/below should therefore win
         * over a node that is far to the side.
         */

        const score = primaryDistance + secondaryDistance * 2.5;

        candidates.push({
          target: candidateTarget,

          primaryDistance,

          secondaryDistance,

          score,
        });
      });

      if (candidates.length === 0) {
        return;
      }

      /*
       * =======================================================
       * SORT CANDIDATES
       * =======================================================
       */

      candidates.sort((a, b) => {
        if (a.score !== b.score) {
          return a.score - b.score;
        }

        if (a.primaryDistance !== b.primaryDistance) {
          return a.primaryDistance - b.primaryDistance;
        }

        return a.secondaryDistance - b.secondaryDistance;
      });

      const nextTarget = candidates[0]?.target;

      if (!nextTarget) {
        return;
      }

      /*
       * =======================================================
       * PREVENT PAGE SCROLL
       * =======================================================
       */

      event.preventDefault();

      /*
       * =======================================================
       * SELECT PERSON OR SPOUSE
       * =======================================================
       */

      setSelectedPerson({
        ...nextTarget.person,
      });

      /*
       * =======================================================
       * CENTER WITHOUT ZOOMING
       * =======================================================
       *
       * This is intentionally different from:
       *
       *   fitView()
       *
       * or:
       *
       *   zoom: 1
       *
       * We preserve the user's current zoom level.
       *
       * The viewport simply moves enough to put the selected
       * person near the center.
       * =======================================================
       */

      try {
        setCenter(nextTarget.x, nextTarget.y, {
          zoom: getZoom(),
          duration: 250,
        });
      } catch (error) {
        console.warn("Could not center React Flow node:", error);
      }
    };

    window.addEventListener("keydown", handleKeyboardNavigation);

    return () => {
      window.removeEventListener("keydown", handleKeyboardNavigation);
    };
  }, [nodes, selectedPerson, setCenter, getZoom]);

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

  /*
   * =========================================================
   * PROVIDER
   * =========================================================
   */

  return (
    <DataContext.Provider
      value={{
        nodes,

        edges,

        setNodes,

        setEdges,

        ToogleNodes,

        selectedPerson,

        setSelectedPerson,

        createFirstNode,

        addNode,

        updatePerson,

        deletePerson,

        loadTestFamilyTree,

        exportPNG,

        exportSVG,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

/*
 * ===========================================================
 * USE DATA
 * ===========================================================
 */

export const useData = () => {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData must be used inside DataContextProvider");
  }

  return context;
};
