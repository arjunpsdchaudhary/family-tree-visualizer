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
import { layoutFamilyTree } from "@/lib/elkLayout";
import { Person } from "@/lib/types";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const page = () => {
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const {
    nodes,
    edges,
    setSelectedPerson,
    selectedPerson,
    setSelectedPersonRef,
    canvas,
    setCanvas,
    setNodes,
    setEdges,
  } = useCanvas();

  useEffect(() => {
    getCanvas();
  }, []);

  const getCanvas = async () => {
    try {
      if (!id) {
        return;
      }

      const response = await axios.get("/api/canvas", {
        params: {
          id,
        },
      });
      console.log("canvas information : ", response.data);
      setCanvas(response.data);

      getData();
    } catch {
      console.log("unable to load canvas information....");
    }
  };

  useEffect(() => {
    console.log("canvas from setter : ", canvas);
  }, [canvas]);

  const getData = async () => {
    const reponse = await axios.get(`/api/canvas/${id}`);
    //     console.log("data getting : ", reponse.data.
    // familyUnits
    // );
    console.log("node datas : ", reponse.data);

    const { nodes, edges } = await layoutFamilyTree(reponse.data.familyUnits);
    setNodes(nodes);
    setEdges(edges);
  };

  useEffect(() => {
    console.log("nodes : ", nodes);
  });

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
