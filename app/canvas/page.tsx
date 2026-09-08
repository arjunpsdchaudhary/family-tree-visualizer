"use client";
import DetailsBar from "@/components/DetailsBar";
import FamilyTree from "@/components/FamilyTree";
import FamilyTreeExport from "@/components/FamilyTreeExport";
import FamilyTreeView from "@/components/FamilyTreeView";
import {
  CanvasContexProvider,
  useCanvas,
} from "@/contexts/CanvasContextProvider";
import { useData } from "@/contexts/DataContextProvider";
import FamilyTreeViewContextProvider from "@/contexts/FamilyTreeViewContextProvider";
import { Person } from "@/lib/types";
import React, { useEffect } from "react";

const page = () => {
  const {
    nodes,
    edges,
    setSelectedPerson,
    selectedPerson,
    setSelectedPersonRef,
  } = useCanvas();

  const handler = (
    sPerson: Person | undefined,
    setSPerson?: React.Dispatch<React.SetStateAction<Person | undefined>>,
  ) => {
    setSelectedPerson(sPerson);
    setSelectedPersonRef.current = setSPerson;
  };

  useEffect(() => {
    console.log("canvas slected :", selectedPerson);
  }, [selectedPerson]);
  return (
    <main className=" flex-1 flex flex-col lg:flex-row min-h-0 min-w-0">
      <FamilyTreeViewContextProvider>
        <FamilyTreeView
          nodesParam={nodes}
          edgesParam={edges}
          getdata={handler}
        />
        <FamilyTreeExport nodes={nodes} edges={edges} />
      </FamilyTreeViewContextProvider>

      <DetailsBar />
    </main>
  );
};

export default page;
