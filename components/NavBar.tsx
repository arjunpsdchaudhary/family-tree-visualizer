"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Download,
  TreePalmIcon,
  ChevronDown,
  FileImage,
  FileCode2,
  FileText,
  Braces,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useData } from "@/contexts/DataContextProvider";
import { exportFamilyTree } from "@/lib/exportFamilyTree";
import { useCanvas } from "@/contexts/CanvasContextProvider";

const NavBar = () => {
  const { nodes, edges, setNodes, setEdges } = useCanvas();

  const [exporting, setExporting] = useState(false);

  const [importing, setImporting] = useState(false);

  const [exportOpen, setExportOpen] = useState(false);

  const [importMessage, setImportMessage] = useState<
    "success" | "error" | null
  >(null);

  const [messageText, setMessageText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportMenuRef = useRef<HTMLDivElement>(null);

  /*
   * =========================================================
   * CLOSE EXPORT MENU WHEN CLICKING OUTSIDE
   * =========================================================
   */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setExportOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * =========================================================
   * CLEAR IMPORT MESSAGE
   * =========================================================
   */

  useEffect(() => {
    if (!importMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setImportMessage(null);
      setMessageText("");
    }, 3500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [importMessage]);

  /*
   * =========================================================
   * EXPORT
   * =========================================================
   */

  const handleExport = async (format: "png" | "svg" | "pdf" | "json") => {
    try {
      setExporting(true);

      setExportOpen(false);

      await exportFamilyTree(nodes, edges, format);
    } catch (error) {
      console.error("Export failed:", error);

      alert("Failed to export family tree.");
    } finally {
      setExporting(false);
    }
  };

  /*
   * =========================================================
   * OPEN IMPORT FILE PICKER
   * =========================================================
   */

  const handleOpenImport = () => {
    if (importing || exporting) {
      return;
    }

    fileInputRef.current?.click();
  };

  /*
   * =========================================================
   * IMPORT JSON
   * =========================================================
   */

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    /*
     * Reset input value so the same file can be selected again.
     */

    event.target.value = "";

    if (!file) {
      return;
    }

    /*
     * Make sure the selected file is JSON.
     */

    const isJsonFile =
      file.type === "application/json" ||
      file.name.toLowerCase().endsWith(".json");

    if (!isJsonFile) {
      setImportMessage("error");

      setMessageText("Please select a valid JSON family tree file.");

      return;
    }

    try {
      setImporting(true);

      /*
       * Read the file.
       */

      const text = await file.text();

      if (!text.trim()) {
        throw new Error("The selected JSON file is empty.");
      }

      /*
       * Parse JSON.
       */

      const parsed = JSON.parse(text);

      /*
       * =======================================================
       * VALIDATE IMPORTED DATA
       * =======================================================
       *
       * Your export format is expected to look like:
       *
       * {
       *   nodes: [...],
       *   edges: [...]
       * }
       */

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray(parsed.nodes) ||
        !Array.isArray(parsed.edges)
      ) {
        throw new Error("Invalid family tree JSON format.");
      }

      /*
       * Basic node validation.
       */

      const invalidNode = parsed.nodes.some((node: unknown) => {
        if (!node || typeof node !== "object") {
          return true;
        }

        const currentNode = node as {
          id?: unknown;
          type?: unknown;
          data?: unknown;
        };

        return (
          typeof currentNode.id !== "string" ||
          typeof currentNode.data !== "object" ||
          currentNode.data === null
        );
      });

      if (invalidNode) {
        throw new Error(
          "The imported file contains invalid family tree nodes.",
        );
      }

      /*
       * Basic edge validation.
       */

      const invalidEdge = parsed.edges.some((edge: unknown) => {
        if (!edge || typeof edge !== "object") {
          return true;
        }

        const currentEdge = edge as {
          id?: unknown;
          source?: unknown;
          target?: unknown;
        };

        return (
          typeof currentEdge.id !== "string" ||
          typeof currentEdge.source !== "string" ||
          typeof currentEdge.target !== "string"
        );
      });

      if (invalidEdge) {
        throw new Error(
          "The imported file contains invalid family tree connections.",
        );
      }

      /*
       * =======================================================
       * CONFIRM REPLACEMENT
       * =======================================================
       *
       * Do not silently destroy the current tree.
       */

      if (nodes.length > 0) {
        const confirmed = window.confirm(
          "Importing this family tree will replace your current tree. Do you want to continue?",
        );

        if (!confirmed) {
          return;
        }
      }

      /*
       * =======================================================
       * UPDATE REACT FLOW
       * =======================================================
       */

      setNodes(parsed.nodes);

      setEdges(parsed.edges);

      /*
       * =======================================================
       * SUCCESS MESSAGE
       * =======================================================
       */

      setImportMessage("success");

      setMessageText(
        `Family tree imported successfully${
          parsed.nodes.length ? ` with ${parsed.nodes.length} nodes` : ""
        }.`,
      );
    } catch (error) {
      console.error("Import failed:", error);

      setImportMessage("error");

      if (error instanceof SyntaxError) {
        setMessageText("The selected file contains invalid JSON.");
      } else if (error instanceof Error) {
        setMessageText(error.message);
      } else {
        setMessageText("Failed to import family tree.");
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <header
      className="
        relative
        z-50
        flex
        h-[68px]
        shrink-0
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white
        px-5
        shadow-sm
      "
    >
      {/* =====================================================
          BRAND
      ====================================================== */}

      <div className="flex min-w-0 items-center gap-3">
        {/* Logo */}

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-blue-600
            text-white
            shadow-sm
            shadow-blue-200
          "
        >
          <TreePalmIcon size={21} strokeWidth={2} />
        </div>

        {/* Brand text */}

        <div className="min-w-0">
          <h1
            className="
              truncate
              text-sm
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Family Tree
          </h1>

          <p
            className="
              hidden
              text-[11px]
              font-medium
              text-slate-400
              sm:block
            "
          >
            Family tree visualization
          </p>
        </div>
      </div>

      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div className="flex items-center gap-2">
        {/* Hidden JSON file input */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImport}
        />

        {/* ===================================================
            IMPORT
        ==================================================== */}

        <button
          type="button"
          disabled={importing || exporting}
          onClick={handleOpenImport}
          className="
            inline-flex
            h-9
            items-center
            gap-2
            rounded-lg
            border
            border-slate-200
            bg-white
            px-3
            text-xs
            font-semibold
            text-slate-700
            shadow-sm
            transition-all
            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-900
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {importing ? (
            <span
              className="
                h-3.5
                w-3.5
                animate-spin
                rounded-full
                border-2
                border-slate-300
                border-t-blue-600
              "
            />
          ) : (
            <Download size={15} strokeWidth={2} />
          )}

          <span>{importing ? "Importing..." : "Import"}</span>
        </button>

        {/* ===================================================
            EXPORT
        ==================================================== */}

        <div ref={exportMenuRef} className="relative">
          <button
            type="button"
            disabled={exporting || importing}
            onClick={() => setExportOpen((prev) => !prev)}
            className="
              inline-flex
              h-9
              items-center
              gap-2
              rounded-lg
              bg-blue-600
              px-3.5
              text-xs
              font-semibold
              text-white
              shadow-sm
              shadow-blue-200
              transition-all
              hover:bg-blue-700
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {exporting ? (
              <span
                className="
                  h-3.5
                  w-3.5
                  animate-spin
                  rounded-full
                  border-2
                  border-white/40
                  border-t-white
                "
              />
            ) : (
              <Upload size={15} strokeWidth={2} />
            )}

            <span>{exporting ? "Exporting..." : "Export"}</span>

            {!exporting && (
              <ChevronDown
                size={14}
                className={`
                  transition-transform
                  duration-200
                  ${exportOpen ? "rotate-180" : ""}
                `}
              />
            )}
          </button>

          {/* =================================================
              EXPORT MENU
          ================================================== */}

          {exportOpen && !exporting && (
            <div
              className="
                absolute
                right-0
                top-11
                z-50
                w-52
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                p-1.5
                shadow-xl
                shadow-slate-900/10
              "
            >
              {/* Menu header */}

              <div className="px-2.5 pb-2 pt-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Export family tree
                </p>
              </div>

              <ExportOption
                icon={<FileImage size={16} />}
                label="PNG"
                description="High-quality image"
                onClick={() => handleExport("png")}
              />

              <ExportOption
                icon={<FileCode2 size={16} />}
                label="SVG"
                description="Scalable vector image"
                onClick={() => handleExport("svg")}
              />

              <ExportOption
                icon={<FileText size={16} />}
                label="PDF"
                description="Printable document"
                onClick={() => handleExport("pdf")}
              />

              <div className="my-1 border-t border-slate-100" />

              <ExportOption
                icon={<Braces size={16} />}
                label="JSON"
                description="Family tree data"
                onClick={() => handleExport("json")}
              />
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          IMPORT STATUS MESSAGE
      ====================================================== */}

      {importMessage && (
        <div
          className="
            absolute
            right-5
            top-[76px]
            z-50
            flex
            max-w-[340px]
            items-start
            gap-3
            rounded-xl
            border
            bg-white
            px-3.5
            py-3
            shadow-lg
            shadow-slate-900/10
          "
        >
          {/* Status icon */}

          <div
            className={`
              mt-0.5
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-lg
              ${
                importMessage === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }
            `}
          >
            {importMessage === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
          </div>

          {/* Message */}

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800">
              {importMessage === "success"
                ? "Import successful"
                : "Import failed"}
            </p>

            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
              {messageText}
            </p>
          </div>

          {/* Close */}

          <button
            type="button"
            onClick={() => {
              setImportMessage(null);
              setMessageText("");
            }}
            className="
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded-md
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-600
            "
            aria-label="Close message"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </header>
  );
};

/*
 * =========================================================
 * EXPORT OPTION
 * =========================================================
 */

const ExportOption = ({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        w-full
        items-center
        gap-3
        rounded-lg
        px-2.5
        py-2.5
        text-left
        transition-all
        hover:bg-slate-50
      "
    >
      {/* Icon */}

      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-slate-100
          text-slate-500
          transition
          group-hover:bg-blue-50
          group-hover:text-blue-600
        "
      >
        {icon}
      </div>

      {/* Text */}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-800">{label}</p>

        <p className="mt-0.5 truncate text-[10px] text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
};

export default NavBar;
