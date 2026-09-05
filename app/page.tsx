import DetailsBar from "@/components/DetailsBar";
import FamilyTree from "@/components/FamilyTree";
import React from "react";

const page = () => {
  return (
    <main className="flex flex-1 min-h-0 min-w-0 flex-row">
      <FamilyTree />
      <DetailsBar />
    </main>
  );
};

export default page;
