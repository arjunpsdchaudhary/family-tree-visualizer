import FamilyTree from "@/components/FamilyTree";
import NavBar from "@/components/NavBar";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="min-h-screens  w-full flex flex-col">
      <NavBar />
      <FamilyTree />
      {/* {children} */}
    </section>
  );
};

export default layout;
