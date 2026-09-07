"use client";

import {
  applyEdgeChanges,
  applyNodeChanges,
  Controls,
  Edge,
  MiniMap,
  MiniMapNode,
  Node,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import FamilyUnitNode from "./FamilyUnitNode";
import { useCallback, useContext, useEffect, useState } from "react";
import { layoutFamilyTree } from "@/lib/elkLayout";
// import { familyUnits } from "@/lib/familyData";
import { Target } from "lucide-react";
import { useData } from "@/contexts/DataContextProvider";
import FamilyTreeExport from "./FamilyTreeExport";

const nodeTypes = { familyUnit: FamilyUnitNode };

const FamilyTree = () => {
  const { nodes, setNodes, edges, setEdges } = useData();

  const ToogleNodes = (node: Node) => {
    console.log("node", node);

    const findChildrenOf = (node: Node) => {
      edges
        .filter((edge) => edge.source === node.id)
        .forEach((edge) => {
          let nextNode = null;

          nodes.forEach((node) => {
            edge.target === node.id ? (nextNode = node) : (nextNode = null);
          });

          setNodes((nodes) =>
            nodes.map((n) =>
              edge.target === n.id ? { ...n, hidden: !node.hidden } : node,
            ),
          );

          nextNode !== null && findChildrenOf(nextNode);
        });
    };

    findChildrenOf(node);
  };

  const getDescendants = (nodeId: string): Set<string> => {
    const descendants = new Set<string>();

    const findChildrenOf = (nodeId: string) => {
      edges
        .filter((edge) => nodeId === edge.source)
        .forEach((edge) => {
          descendants.add(edge.target);
          findChildrenOf(edge.target);
        });
    };

    findChildrenOf(nodeId);

    return descendants;
  };

  useEffect(() => {
    // layoutFamilyTree(familyUnits).then(({ nodes, edges }) => {
    //   setNodes(
    //     nodes.map((node) => ({
    //       ...node,
    //       data: {
    //         ...node.data,
    //         onToogle: ToogleNodes,
    //       },
    //     })),
    //   );
    //   setEdges(edges);
    //   console.log(nodes);
    //   console.log(edges);
    // });
  }, []);

  return (
    <>
      {/* Normal visible React Flow */}
      <div className="flex-1 min-w-0 min-h-0 ">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          minZoom={0.05}
          maxZoom={2}
          className="bg-blue-50! family-tree-flow"
          fitView
        >
          <Controls
            position={"bottom-right"}
            className="text-black bottom-2!"
          />
        </ReactFlow>
      </div>

      {/* Hidden export React Flow */}
      <FamilyTreeExport nodes={nodes} edges={edges} />
    </>
  );
};

export default FamilyTree;
