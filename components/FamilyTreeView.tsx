"use client";
import { useData } from "@/contexts/DataContextProvider";
import FamilyTreeViewContextProvider, {
  useFamilyTreeView,
} from "@/contexts/FamilyTreeViewContextProvider";
import { FamilyUnit, Person } from "@/lib/types";
import { Controls, Node, Edge, ReactFlow } from "@xyflow/react";
import React, { useEffect, useState } from "react";
import FamilyUnitNode from "./FamilyUnitNode";
import "@xyflow/react/dist/style.css";
import { layoutFamilyTree } from "@/lib/elkLayout";

const nodeTypes = { familyUnit: FamilyUnitNode };

type FamilyTreeViewProps = {
  nodesParam?: Node[];
  edgesParam?: Edge[];
  getdata?: (
    selectedPerson: Person | undefined,
    setSelectedPerson: React.Dispatch<React.SetStateAction<Person | undefined>>,
  ) => void;
};
const FamilyTreeView = ({
  nodesParam,
  edgesParam,
  getdata,
}: FamilyTreeViewProps) => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedPerson,
    setSelectedPerson,
  } = useFamilyTreeView();

  useEffect(() => {
    if (nodesParam) {
      setNodes(nodesParam);
    }

    if (edgesParam) {
      setEdges(edgesParam);
    }
  }, [nodesParam, edgesParam]);

  useEffect(() => {
    if (getdata) {
      getdata(selectedPerson, setSelectedPerson);
    }

    console.log("selected person :", selectedPerson?.name);
  }, [selectedPerson]);

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
      {/* <FamilyTreeExport nodes={nodes} edges={edges} /> */}
    </>
  );
};

// const FamilyTreeView = ({}:FamilyTreeViewProps) => {
//   return (
//     <FamilyTreeViewContextProvider>
//       <TreeView familyUnits={familyUnits} />
//     </FamilyTreeViewContextProvider>
//   );
// };

export default FamilyTreeView;
