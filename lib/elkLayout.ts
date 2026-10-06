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
   * 1. BUILD A SET OF VALID FAMILY UNIT IDS
   * =========================================================
   */

  const unitIds = new Set(units.map((unit) => unit.id));

  /*
   * Optional but VERY useful while debugging.
   *
   * This tells you exactly which relationship is broken.
   */
  for (const unit of units) {
    for (const childId of unit.childUnitIds ?? []) {
      if (!unitIds.has(childId)) {
        console.warn(
          `[ELK] Ignoring dangling family relationship: ` +
            `${unit.id} -> ${childId}`,
        );
      }
    }
  }

  /*
   * =========================================================
   * 2. CREATE ONLY VALID ELK EDGES
   * =========================================================
   *
   * ELK requires every source and target to exist in
   * children.
   */

  const elkEdges = units.flatMap((unit) =>
    (unit.childUnitIds ?? [])
      .filter((childId) => unitIds.has(childId))
      .map((childId) => ({
        id: `e-${unit.id}-${childId}`,
        sources: [unit.id],
        targets: [childId],
      })),
  );

  /*
   * =========================================================
   * 3. CREATE ELK GRAPH
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

    edges: elkEdges,
  };

  /*
   * =========================================================
   * 4. RUN ELK
   * =========================================================
   */

  const result = await elk.layout(elkGraph);

  /*
   * =========================================================
   * 5. LOOKUP FAMILY UNITS
   * =========================================================
   */

  const unitById = new Map(units.map((unit) => [unit.id, unit]));

  /*
   * =========================================================
   * 6. CREATE REACT FLOW NODES
   * =========================================================
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
        childUnitIds: unit.childUnitIds,
      },

      draggable: false,
      selectable: true,

      hidden: unit.hidden ?? false,
    };
  });

  /*
   * =========================================================
   * 7. CREATE REACT FLOW EDGES
   * =========================================================
   *
   * Use the SAME validation here so React Flow doesn't
   * receive dangling edges either.
   */

  const edges: Edge[] = units.flatMap((unit) =>
    (unit.childUnitIds ?? [])
      .filter((childId) => unitIds.has(childId))
      .map((childId) => ({
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
