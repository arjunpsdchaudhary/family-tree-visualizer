import ELK from "elkjs/lib/elk.bundled.js";
import { FamilyUnit } from "./types";
import { Edge, Node } from "@xyflow/react";

const elk = new ELK();

export const PERSON_WIDTH = 270;
export const PERSON_HEIGHT = 160;
export const SPOUSE_GAP = 28;

export function unitWidth(unit: FamilyUnit): number {
  return unit.spouse ? PERSON_WIDTH * 2 + SPOUSE_GAP : PERSON_WIDTH;
}

const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",

  "elk.layered.spacing.nodeNodeBetweenLayers": "110",
  "elk.spacing.nodeNode": "60",

  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.layered.layering.strategy": "NETWORK_SIMPLEX",

  "elk.edgeRouting": "ORTHOGONAL",

  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
  "elk.layered.unnecessaryBendpoints": "false",

  "elk.alignment": "CENTER",
};

export async function layoutFamilyTree(units: FamilyUnit[]): Promise<{
  nodes: Node[];
  edges: Edge[];
}> {
  /*
   * =========================================================
   * CREATE ELK GRAPH
   * =========================================================
   */

  const elkGraph = {
    id: "root",

    layoutOptions,

    children: units.map((unit) => ({
      id: unit.id,
      width: unitWidth(unit),
      height: PERSON_HEIGHT,
    })),

    edges: units.flatMap((unit) =>
      unit.childUnitIds.map((childId) => ({
        id: `e-${unit.id}-${childId}`,
        sources: [unit.id],
        targets: [childId],
      })),
    ),
  };

  /*
   * =========================================================
   * RUN ELK
   * =========================================================
   */

  const result = await elk.layout(elkGraph);

  /*
   * =========================================================
   * LOOKUP FAMILY UNITS
   * =========================================================
   */

  const unitById = new Map(units.map((unit) => [unit.id, unit]));

  /*
   * =========================================================
   * CREATE REACT FLOW NODES
   * =========================================================
   *
   * IMPORTANT:
   *
   * We preserve:
   *
   * - person
   * - spouse
   * - childUnitIds
   *
   * in node.data.
   *
   * This allows the DataContextProvider to reconstruct
   * FamilyUnit[] when a new person is added.
   */

  const nodes: Node[] = (result.children ?? []).map((n) => {
    const unit = unitById.get(n.id);

    if (!unit) {
      throw new Error(`FamilyUnit not found for ELK node: ${n.id}`);
    }

    return {
      id: unit.id,

      type: "familyUnit",

      position: {
        x: n.x ?? 0,
        y: n.y ?? 0,
      },

      data: {
        person: unit.person,
        spouse: unit.spouse,

        /*
         * VERY IMPORTANT
         */
        childUnitIds: unit.childUnitIds,
      },

      draggable: false,
      selectable: true,

      /*
       * Preserve hidden state if you use it.
       */
      hidden: unit.hidden ?? false,
    };
  });

  /*
   * =========================================================
   * CREATE REACT FLOW EDGES
   * =========================================================
   */

  const edges: Edge[] = units.flatMap((unit) =>
    unit.childUnitIds.map((childId) => ({
      id: `e-${unit.id}-${childId}`,

      source: unit.id,
      sourceHandle: "children-out",

      target: childId,
      targetHandle: "parent-in",

      type: "smoothstep",

      pathOptions: {
        borderRadius: 2,
      },

      style: {
        stroke: "#5B7088",
        strokeWidth: 4,
      },
    })),
  );

  return {
    nodes,
    edges,
  };
}
