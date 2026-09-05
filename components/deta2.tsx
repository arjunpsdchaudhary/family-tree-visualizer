"use client";

import { Handle, Node, Position, useReactFlow } from "@xyflow/react";
import type { FamilyUnit, Person } from "@/lib/types";
import { CircleMinus, CirclePlus, Mars, Venus } from "lucide-react";
import { useData } from "@/contexts/DataContextProvider";
import { useState } from "react";

function PersonCard({ person }: { person: Person }) {
  const { setSelectedPerson } = useData();
  return (
    <div
      className={`
        group relative flex items-center w-64 h-30 p-2.5 bg-white 
        rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ease-in-out
        border ${false ? "border-indigo-600 ring-2 ring-indigo-100" : "border-slate-200 hover:border-slate-300"}
        cursor-pointer select-none overflow-hidden shadow-xl shadow-blue-300s
      `}
      onClick={() => setSelectedPerson(person)}
    >
      {person.gender === "male" && (
        <Mars className="absolute top-2 right-2 text-blue-500 text-sm" />
      )}
      {person.gender === "female" && (
        <Venus className="absolute top-2 right-2 text-pink-500 text-sm" />
      )}

      {/* <Mars className="absolute top-2 right-2 text-blue-500 text-sm" /> */}
      {/* Accent Line Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 `} />

      {/* Avatar Container */}
      <div className="relative shrink-0 ml-1.5 mr-3">
        {person.imageUrl !== undefined ? (
          <img
            src={person.imageUrl}
            className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-inner"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-medium text-lg">
            {person.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Node Details */}
      <div className="flex flex-col justify-center min-w-0 pr-1">
        <h3 className="text-sm font-semibold text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">
          {person.name}
        </h3>
        <p className="text-xs font-medium text-slate-400 mt-1 tracking-wide">
          {"birthYear"} – {false || "Present"}
        </p>
      </div>

      {/* Optional Branch Connection Pin Point (Right Center) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-slate-300 rounded-l-sm" />
    </div>
    // <div className="flex gap-2 w-[170px] h-16 p-2 items-center justify-center rounded-md border border-ink/10 bg-card px-2 text-center shadow-[0_1px_2px_rgba(0,0,0,0.25)] hover:border-blue-400">
    //   <div className=" bg-green-500 h-full w-full flex-1 rounded-sm"></div>
    //   <div className="bg-yellow-100 h-full w-full flex-2">
    //     <span className="font-serif text-[8px] font-semibold leading-tight text-ink">
    //       Name:{person.name}
    //     </span>
    //     {person.age && (
    //       <span className="mt-0.5 font-mono text-[10px] tracking-wide text-ink/50">
    //         {person.age}
    //       </span>
    //     )}
    //   </div>
    // </div>
  );
}

const handleStyle = {
  width: 6,
  height: 6,
  background: "#5B7088",
  border: "none",
};

export default function FamilyUnitNode({
  id,
  data,
}: {
  id: string;
  data: FamilyUnit;
}) {
  const {} = useData();
  const { person, spouse } = data;

  const { getNode } = useReactFlow();
  const node = getNode(id);

  const { ToogleNodes } = useData();
  const [toogle, setToogle] = useState(true);

  const onClickHandler = () => {
    if (node !== undefined) {
      setToogle(!toogle);
      ToogleNodes(node, toogle);
    }
  };
  return (
    <div className="relative flex items-center w-fit">
      <Handle
        type="target"
        position={Position.Top}
        id="parent-in"
        style={handleStyle}
      />

      <PersonCard person={person} />

      {spouse && (
        <>
          <div className="flex justify-center shrink-0">
            <div className="border-y-4 w-8 h-3 border-pink-300" />

            <button
              className="absolute text-3xl bottom-1 m-0 p-0"
              onClick={onClickHandler}
            >
              {toogle === false ? (
                <CirclePlus className="text-blue-500" />
              ) : (
                <CircleMinus className="text-red-600" />
              )}
            </button>
          </div>

          <PersonCard person={spouse} />
        </>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        id="children-out"
        style={handleStyle}
      />
    </div>
  );
}
