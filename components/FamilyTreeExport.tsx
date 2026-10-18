"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
} from "@xyflow/react";

import FamilyUnitNode from "./FamilyUnitNode";

import "@xyflow/react/dist/style.css";

const nodeTypes = {
  familyUnit: FamilyUnitNode,
};

type FamilyTreeExportProps = {
  nodes: Node[];
  edges: Edge[];
};

export default function FamilyTreeExport({
  nodes,
  edges,
}: FamilyTreeExportProps) {
  return (
    <div
      id="family-tree-export"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "2000px",
        height: "2000px",
        opacity: 0,
        visibility: "hidden",
        pointerEvents: "none",
        zIndex: -9999,
        overflow: "hidden",
      }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnScroll={false}
          zoomOnPinch={false}
          preventScrolling={false}
          className="bg-blue-50!"
        />
      </ReactFlowProvider>
    </div>
  );
}