"use client";

import {
  ReactFlow,
  Background,
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
        left: "-100000px",
        top: "0",

        width: "100px",
        height: "100px",

        overflow: "hidden",

        pointerEvents: "none",
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
        >
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
