"use client";

import { useRef, useState } from "react";

type DraggableSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function DraggableSwitch({
  checked,
  onChange,
}: DraggableSwitchProps) {
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const handlePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    startX.current = e.clientX;
    setDragging(true);

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    const distance = e.clientX - startX.current;

    if (Math.abs(distance) > 20) {
      // Drag right = ON
      // Drag left = OFF
      onChange(distance > 0);
    } else {
      // Simple click
      onChange(!checked);
    }

    setDragging(false);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`
        relative h-8 w-14 rounded-full p-1
        transition-colors
        ${checked ? "bg-green-500" : "bg-gray-300"}
        ${dragging ? "cursor-grabbing" : "cursor-grab"}
      `}
    >
      <span
        className={`
          block h-6 w-6 rounded-full bg-white shadow
          transition-transform
          ${checked ? "translate-x-6" : "translate-x-0"}
        `}
      />
    </button>
  );
}