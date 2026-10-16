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
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
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

  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    const response = await axios.get(`/api/canvas/${id}`);

    const { nodes, edges } = await layoutFamilyTree(
      response.data.familyUnits
    );

    setNodes(nodes);
    setEdges(edges);
  };

  const getCanvas = async () => {
    try {
      if (!id) {
        return;
      }

      const response = await axios.get("/api/canvas", {
        params: { id },
      });

    
      setCanvas(response.data);

      // Await so errors from getData() are caught here too
      await getData();
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        setUnauthorized(true);
      } else {
        console.error("Error fetching canvas:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCanvas();
  }, [id]);


  useEffect(()=>{
    console.log("nodes--", nodes);
    console.log("edges---", edges);

  },[nodes, edges])

 

  const handler = (
    sPerson: Person | undefined,
    setSPerson?: React.Dispatch<
      React.SetStateAction<Person | undefined>
    >
  ) => {
    setSelectedPerson(sPerson);
    setSelectedPersonRef.current = setSPerson;
  };


  if (loading) {
    return <p>Loading...</p>;
  }

  if (unauthorized) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You are not authorized to access this resource.</p>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0">
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

export default Page;