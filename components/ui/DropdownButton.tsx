
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";


import { useEffect, useRef, useState } from "react";

 function DropdownButton() {
    const {data}=  authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const options = [
    "Switch Account",
    "Log Out",
  ];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  async function handleSelect(option: string) {
    if (option === "Switch Account") {
      router.push("/signin");
    }
    
    if (option === "Log Out") {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/signin");
            router.refresh(); // Ensures Next.js clears any cached Server Component states
          },
        },
      });
    }
    
    setIsOpen(false); // Close dropdown on selection
  }



  return (
    <div
      ref={dropdownRef}
      className="relative w-full max-w-xs sm:max-w-sm"
    >
      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex min-h-12 w-full items-center justify-between
                   gap-3 rounded-lg  px-2 
                   text-sm font-medium  
                   transition-colors hover:bg-blue-700
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-blue-500 focus-visible:ring-offset-2
                   active:scale-[0.99]"
      >
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold">
                {data?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <span className="hidden text-sm font-medium  sm:block">
                Account
              </span>
            </div>

        <svg
          className={`h-5 w-5 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 right-0 top-full z-50 mt-2
                     max-h-60 overflow-y-auto overscroll-contain
                     rounded-lg border border-gray-200 bg-white
                     p-1 shadow-xl"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(option)}
              className={`flex min-h-11 w-full items-center rounded-md
                          px-3 py-2.5 text-left text-sm
                          transition-colors hover:bg-gray-100
                          focus-visible:bg-gray-100
                          focus-visible:outline-none
                          ${
                            option === "Log Out"
                              ? "text-red-600"
                              : "text-gray-700"
                          }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export {DropdownButton}
