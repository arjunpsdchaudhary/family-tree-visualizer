"use client";

import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { FamilyUnit, Person } from "@/lib/types";
import {
  CircleMinus,
  CirclePlus,
  Mail,
  Mars,
  Phone,
  Venus,
} from "lucide-react";
import { useData } from "@/contexts/DataContextProvider";
import { useState } from "react";

/*
 * =========================================================
 * REACT FLOW HANDLE STYLE
 * =========================================================
 *
 * Handles are still present so React Flow can use them,
 * but they are visually hidden to keep the node UI clean.
 */

const handleStyle = {
  width: 1,
  height: 1,
  background: "transparent",
  border: "none",
  opacity: 0,
};

/*
 * =========================================================
 * DATE HELPER
 * =========================================================
 *
 * Gets only the year from a YYYY-MM-DD date.
 *
 * Example:
 * "1992-04-15" → "1992"
 */

const getYear = (date?: string | null): string | undefined => {
  if (!date) {
    return undefined;
  }

  const year = date.slice(0, 4);

  return /^\d{4}$/.test(year) ? year : undefined;
};

/*
 * =========================================================
 * PERSON CARD
 * =========================================================
 */

function PersonCard({ person }: { person: Person }) {
  const { setSelectedPerson, selectedPerson } = useData();

  const isSelected = selectedPerson?.id === person.id;

  const isMale = person.gender === "male";

  const isFemale = person.gender === "female";

  /*
   * Get only the birth and death years.
   */

  const birthYear = getYear(person.dob);

  const deathYear = getYear(person.dod);

  return (
    <div
      onClick={() => setSelectedPerson(person)}
      className={`
        group
        relative
        flex
        h-33
        w-[270px]
        cursor-pointer
        select-none
        overflow-hidden
        rounded-2xl
        border
        bg-white
        transition-all
        duration-200
        ease-out
        ${
          isSelected
            ? "border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-100"
            : "border-slate-200 shadow-md shadow-slate-200/60 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200"
        }
      `}
    >
      {/* =================================================
          PROFILE IMAGE
      ================================================== */}

      <div className="ml-4 flex shrink-0 items-center">
        <div
          className="
            h-[78px]
            w-[78px]
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            shadow-sm
          "
        >
          {person.imageUrl ? (
            <img
              src={person.imageUrl}
              alt={person.name}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-300
                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                bg-slate-100
                text-3xl
                font-semibold
                text-slate-400
              "
            >
              {person.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          PERSON INFORMATION
      ================================================== */}

      <div className="flex min-w-0 flex-1 flex-col justify-center pl-4 pr-10">
        {/* Name */}

        <h3
          title={person.name}
          className={`
            truncate
            text-[15px]
            font-semibold
            leading-5
            transition-colors
            ${
              isSelected
                ? "text-blue-600"
                : "text-slate-800 group-hover:text-blue-600"
            }
          `}
        >
          {person.name}
        </h3>

        {/* =================================================
            CONTACT INFORMATION
        ================================================== */}

        <div className="mt-2 space-y-1">
          {person.email && (
            <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-slate-500">
              <Mail
                size={11}
                strokeWidth={1.8}
                className="shrink-0 text-slate-400"
              />

              <span className="truncate" title={person.email}>
                {person.email}
              </span>
            </div>
          )}

          {person.phone && (
            <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-slate-500">
              <Phone
                size={11}
                strokeWidth={1.8}
                className="shrink-0 text-slate-400"
              />

              <span className="truncate" title={person.phone}>
                {person.phone}
              </span>
            </div>
          )}
        </div>

        {/* =================================================
            BIRTH / DEATH INFORMATION
        ================================================== */}

        {/*
         * Display rules:
         *
         * No DOB + No DOD:
         *   Birth year unknown
         *
         * DOB only:
         *   Born on 1992 • Alive
         *
         * DOD only:
         *   Died on 2025
         *
         * DOB + DOD:
         *   Born on 1992 • Died on 2025
         *
         * All information intentionally uses neutral
         * slate colors.
         */}

        <div className="mt-1 min-w-0 text-[11px] font-medium text-slate-400">
          {!birthYear && !deathYear && <span>Birth year unknown</span>}

          {birthYear && !deathYear && (
            <div className="truncate">
              <span>Born on {birthYear}</span>

              <span className="mx-1 text-slate-300">•</span>

              <span>Alive</span>
            </div>
          )}

          {!birthYear && deathYear && (
            <div className="truncate">
              <span>Died on {deathYear}</span>
            </div>
          )}

          {birthYear && deathYear && (
            <div className="truncate">
              <span>Born on {birthYear}</span>

              <span className="mx-1 text-slate-300">•</span>

              <span>Died on {deathYear}</span>
            </div>
          )}
        </div>

        {/* =================================================
            GENDER BADGE
        ================================================== */}

        {/* <div className="mt-2">
          {isMale && (
            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-blue-50
                px-2
                py-0.5
                text-[10px]
                font-medium
                text-blue-600
              "
            >
              <Mars className="h-3 w-3" />
              Male
            </span>
          )}

          {isFemale && (
            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-pink-50
                px-2
                py-0.5
                text-[10px]
                font-medium
                text-pink-600
              "
            >
              <Venus className="h-3 w-3" />
              Female
            </span>
          )}

          {!isMale && !isFemale && (
            <span
              className="
                inline-flex
                rounded-full
                bg-slate-100
                px-2
                py-0.5
                text-[10px]
                font-medium
                text-slate-500
              "
            >
              Gender not specified
            </span>
          )}
        </div> */}
      </div>

      {/* =================================================
          GENDER ICON
      ================================================== */}

      <div className="absolute right-3 top-3">
        {isMale && (
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-blue-50
              text-blue-500
            "
          >
            <Mars className="h-4 w-4" />
          </div>
        )}

        {isFemale && (
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-pink-50
              text-pink-500
            "
          >
            <Venus className="h-4 w-4" />
          </div>
        )}

        {!isMale && !isFemale && (
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-slate-50
              text-slate-300
            "
          >
            <span className="text-xs">—</span>
          </div>
        )}
      </div>
    </div>
  );
}

/*
 * =========================================================
 * FAMILY TOGGLE
 * =========================================================
 *
 * This button is shown for every FamilyUnit,
 * even if the FamilyUnit does not have a spouse.
 */

function FamilyToggle({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="
        relative
        flex
        h-[132px]
        w-12
        shrink-0
        items-center
        justify-center
      "
    >
      {/* Connection line */}

      {/* <div
        className="
          absolute
          left-0
          right-0
          top-1/2
          h-[2px]
          -translate-y-1/2
          bg-slate-200
        "
      /> */}

      {/* Circular toggle button */}

      <button
        type="button"
        onClick={(event) => {
          /*
           * Prevent the click from bubbling into
           * surrounding React Flow elements.
           */

          event.stopPropagation();

          onToggle();
        }}
        aria-label={expanded ? "Collapse descendants" : "Expand descendants"}
        title={expanded ? "Collapse descendants" : "Expand descendants"}
        className={`
          relative
          z-10
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          bg-white
          shadow-sm
          transition-all
          duration-200
          hover:scale-110
          hover:shadow-md
          active:scale-95
          ${
            expanded
              ? "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              : "border-blue-200 text-blue-500 hover:border-blue-300 hover:bg-blue-50"
          }
        `}
      >
        {expanded ? (
          <CircleMinus className="h-4 w-4" />
        ) : (
          <CirclePlus className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

/*
 * =========================================================
 * FAMILY UNIT NODE
 * =========================================================
 */

export default function FamilyUnitNode({
  id,
  data,
}: {
  id: string;
  data: FamilyUnit;
}) {
  const { person, spouse } = data;

  const { getNode } = useReactFlow();

  const { ToogleNodes } = useData();

  /*
   * true  = descendants are visible
   * false = descendants are hidden
   */

  const [toogle, setToogle] = useState(true);

  /*
   * =======================================================
   * TOGGLE DESCENDANTS
   * =======================================================
   */

  const onClickHandler = () => {
    const node = getNode(id);

    if (!node) {
      return;
    }

    /*
     * Save the current state before changing it.
     */

    const currentState = toogle;

    setToogle(!currentState);

    /*
     * Your existing ToogleNodes function expects
     * the current toggle state.
     */

    ToogleNodes(node, currentState);
  };

  return (
    <div
      className="
        relative
        flex
        w-fit
        items-center
      "
    >
      {/* =================================================
          TOP HANDLE
      ================================================== */}

      <Handle
        type="target"
        position={Position.Top}
        id="parent-in"
        style={handleStyle}
      />

      {/* =================================================
          MAIN PERSON
      ================================================== */}

      <PersonCard person={person} />

      {/* =================================================
          FAMILY TOGGLE
      ================================================== */}

      {spouse && <FamilyToggle expanded={toogle} onToggle={onClickHandler} />}

      {/* =================================================
          SPOUSE
      ================================================== */}

      {spouse && <PersonCard person={spouse} />}

      {/* =================================================
          BOTTOM HANDLE
      ================================================== */}

      <Handle
        type="source"
        position={Position.Bottom}
        id="children-out"
        style={handleStyle}
      />
    </div>
  );
}
