"use client";
import DetailsBar from "@/components/DetailsBar";
import FamilyTree from "@/components/FamilyTree";
import { useData } from "@/contexts/DataContextProvider";
import React from "react";

const page = () => {
  return (
    <main className=" flex-1 flex flex-col lg:flex-row min-h-0 min-w-0">
      <FamilyTree />
      <DetailsBar />
    </main>
  );
};

export default page;
