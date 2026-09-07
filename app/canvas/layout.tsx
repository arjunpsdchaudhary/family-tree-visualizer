import NavBar from "@/components/NavBar";
import React from "react";

const CanvasLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <NavBar />
      {children}
    </div>
  );
};

export default CanvasLayout;
