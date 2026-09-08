import NavBar from "@/components/NavBar";
import { CanvasContexProvider } from "@/contexts/CanvasContextProvider";
import React from "react";

const CanvasLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <CanvasContexProvider>
        <NavBar />
        {children}
      </CanvasContexProvider>
    </div>
  );
};

export default CanvasLayout;
