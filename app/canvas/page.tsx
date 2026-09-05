"use client";
import FamilyTree from "@/components/FamilyTree";
import { useData } from "@/contexts/DataContextProvider";
import React from "react";

const page = () => {
  const { selectedPerson } = useData();
  return (
    <main className=" border-blue-300 border flex-1 relative">
      <FamilyTree />
      <section
        className="w-120 h-4/5 bg-blue-50 shadow-xl shadow-green-300  border-gray-50 border-2  absolute top-1/2   -translate-y-1/2  
        right-5 rounded-2xl px-4 py-8
      hover:shadow-md transition-all duration-200 ease-in-out flex flex-col  gap-4"
      >
        <div className="w-full h-64 bg-green-300 rounded-2xl overflow-hidden flex justify-center items-center relative">
          {selectedPerson?.imageUrl !== undefined ? (
            <img src={selectedPerson?.imageUrl} alt="" />
          ) : (
            <div className="w-48 h-48 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-medium text-8xl ">
              <h1>{selectedPerson?.name.charAt(0)}</h1>
            </div>
          )}

          {/* Avatar Container */}
          {/* <div className="relative shrink-0 ml-1.5 mr-3">
            {selectedPerson?.imageUrl !== undefined ? (
              <img
                src={selectedPerson?.imageUrl}
                className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-inner"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-medium text-lg">
                {selectedPerson?.name.charAt(0)}
              </div>
            )}
          </div> */}
        </div>
        <div className="text-black">
          <details open>
            <summary>Details</summary>

            <ul>
              <li>Name:{selectedPerson?.name}</li>
              <li>DOB:{selectedPerson?.age}</li>
              <li>Gender:{selectedPerson?.gender}</li>
              <li>Location:</li>
            </ul>
          </details>
        </div>
      </section>
    </main>
  );
};

export default page;
