import { layoutFamilyTree } from "@/lib/elkLayout";

import { FamilyUnit, Person } from "@/lib/types";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

type FamilyTreeContextType = {
  nodes: Node[];
  edges: Edge[];
  //   familyUnits: FamilyUnit[];
  //   setFamilyUnits: React.Dispatch<React.SetStateAction<FamilyUnit[]>>;

  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;

  selectedPerson: Person | undefined;

  setSelectedPerson: Dispatch<SetStateAction<Person | undefined>>;

  toogleNodes: (node: Node, toogle: boolean) => void;
};
const FamilyTreeViewContext = createContext<FamilyTreeContextType | undefined>(
  undefined,
);
const FamilyTreeViewContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);

  const [edges, setEdges] = useState<Edge[]>([]);

  //   const [familyUnits, setFamilyUnits] = useState<FamilyUnit[]>([]);

  const [selectedPerson, setSelectedPerson] = useState<Person>();

  const { getNode, setCenter, getZoom } = useReactFlow();

  const getHandlers = () => {
    return { selectedPerson, setSelectedPerson };
  };

  const toogleNodes = (node: Node, toogle: boolean) => {
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
            console.log(nextNode);
          }
        });
    };

    findDescendentsOf(node);
  };

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
  return (
    <FamilyTreeViewContext.Provider
      value={{
        nodes,
        edges,
        setNodes,
        setEdges,

        toogleNodes,
        selectedPerson,
        setSelectedPerson,
      }}
    >
      {children}
    </FamilyTreeViewContext.Provider>
  );
};

export const useFamilyTreeView = () => {
  const context = useContext(FamilyTreeViewContext);

  if (!context) {
    throw new Error(
      "useFamilyTreeView must be inside FamilyTreeViewContextProvider",
    );
  }

  return context;
};

export default FamilyTreeViewContextProvider;
