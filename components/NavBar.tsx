"use client";

import Switch from "react-switch";
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
  Save,
} from "lucide-react";

import { useCanvas } from "@/contexts/CanvasContextProvider";
import { exportFamilyTree } from "@/lib/exportFamilyTree";
import { toast } from "sonner";
import { Canvas } from "@/lib/types";
import axios from "axios";

const NavBar = () => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    canvas,
    setCanvas,
    isPublic,
    setIsPublic,
  } = useCanvas();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [canvasName, setCanvasName] = useState("");

  const [importMessage, setImportMessage] = useState<
    "success" | "error" | null
  >(null);
  const [messageText, setMessageText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvas) {
      setCanvasName(canvas.name ?? "untitled");
    }
  }, [canvas]);

  // Handle outside clicks/touches reliably for desktop and mobile
  useEffect(() => {
    const handleOutsideAction = (event: MouseEvent | TouchEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setExportOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideAction);
    document.addEventListener("touchstart", handleOutsideAction);
    return () => {
      document.removeEventListener("mousedown", handleOutsideAction);
      document.removeEventListener("touchstart", handleOutsideAction);
    };
  }, []);

  // Clear import message notification
  useEffect(() => {
    if (!importMessage) return;

    const timeout = window.setTimeout(() => {
      setImportMessage(null);
      setMessageText("");
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [importMessage]);

  // Unified Export Handler
  const handleExport = async (
    format: "png" | "svg" | "pdf" | "json"
  ) => {
    try {
      setExporting(true);
      setExportOpen(false);

      // Brief tick delay so React paints the loading spinner state before heavy canvas processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      await exportFamilyTree(nodes, edges, format);
      toast.success(`Exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export family tree. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Save family tree
  const handleSave = async () => {
    try {
      if (canvas?.id) {
        const updatedCanvas: Canvas = {
          ...canvas,
          name: canvasName,
          isPublic,
        };

        setCanvas(updatedCanvas);

        await axios.put(`/api/canvas/${canvas.id}`, {
          nodes,
          canvas: updatedCanvas,
        });
        toast.success("Canvas Saved...");
      }
    } catch (error) {
      console.error("Saving failed:", error);
      alert("Failed to save family tree.");
    }
  };

  // Open import file picker
  const handleOpenImport = () => {
    if (importing || exporting) return;
    fileInputRef.current?.click();
  };

  // Import JSON family tree
  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

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
      const text = await file.text();

      if (!text.trim()) {
        throw new Error("The selected JSON file is empty.");
      }

      const parsed = JSON.parse(text);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray(parsed.nodes) ||
        !Array.isArray(parsed.edges)
      ) {
        throw new Error("Invalid family tree JSON format.");
      }

      if (nodes.length > 0) {
        const confirmed = window.confirm(
          "Importing this family tree will replace your current tree. Do you want to continue?"
        );
        if (!confirmed) return;
      }

      setNodes(parsed.nodes);
      setEdges(parsed.edges);

      setImportMessage("success");
      setMessageText(
        `Family tree imported successfully${
          parsed.nodes.length ? ` with \${parsed.nodes.length} nodes` : ""
        }.`
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
        relative z-50 w-full shrink-0
        border-b border-slate-200 bg-white shadow-sm
        flex flex-col gap-2.5 px-3 py-2.5
        sm:flex-row sm:items-center sm:justify-between
        sm:gap-3 sm:px-4 sm:py-0 sm:h-[68px]
        lg:px-5
      "
    >
      {/* Hidden file input shared by both mobile & desktop */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
      />

      {/* Top Bar: Brand Logo and Title */}
      <div className="flex w-full min-w-0 items-center justify-between sm:w-auto sm:shrink-0">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <div
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200
              sm:h-10 sm:w-10
            "
          >
            <TreePalmIcon size={21} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold tracking-tight text-slate-900">
              Family Tree
            </h1>
            <p className="hidden text-[11px] font-medium text-slate-400 md:block">
              Family tree visualization
            </p>
          </div>
        </div>

        {/* Mobile-Only Action Buttons (Import & Export) */}
        <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
          <button
            type="button"
            disabled={importing || exporting}
            onClick={handleOpenImport}
            className="
              inline-flex h-9 shrink-0 items-center justify-center gap-1
              rounded-lg border border-slate-200 bg-white px-2
              text-[11px] font-semibold text-slate-700 shadow-sm
              transition-all hover:border-slate-300 hover:bg-slate-50
              active:scale-[0.98]
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {importing ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            ) : (
              <Download size={14} />
            )}
            <span>{importing ? "Importing" : "Import"}</span>
          </button>

          {/* Export Menu Trigger (Mobile) */}
          <button
            type="button"
            disabled={exporting || importing}
            onClick={() => setExportOpen((prev) => !prev)}
            className="
              inline-flex h-9 shrink-0 items-center justify-center gap-1
              rounded-lg bg-blue-600 px-2
              text-[11px] font-semibold text-white
              shadow-sm shadow-blue-200 transition-all
              hover:bg-blue-700 active:scale-[0.98]
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {exporting ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Upload size={14} />
            )}
            <span>{exporting ? "Exporting" : "Export"}</span>
            {!exporting && (
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${
                  exportOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Actions Group */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-600">
          <span>Public</span>
          <Switch checked={isPublic} onChange={setIsPublic} />
        </label>

        <input
          type="text"
          value={canvasName}
          onChange={(event) => setCanvasName(event.target.value)}
          aria-label="Canvas name"
          className="
            h-9 min-w-0 rounded-md
            border border-slate-200 bg-white px-2.5
            text-sm text-slate-700 outline-none transition
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            sm:w-28 md:w-36 lg:w-44 xl:w-48
          "
        />

        <button
          type="button"
          aria-label="Save canvas"
          title="Save canvas"
          onClick={handleSave}
          className="
            inline-flex h-9 w-9 shrink-0 items-center justify-center
            rounded-lg border border-slate-200 bg-white
            text-slate-700 shadow-sm transition
            hover:bg-slate-50 active:scale-[0.98]
          "
        >
          <Save size={16} />
        </button>

        <button
          type="button"
          disabled={importing || exporting}
          onClick={handleOpenImport}
          className="
            inline-flex h-9 shrink-0 items-center justify-center gap-2
            rounded-lg border border-slate-200 bg-white px-3
            text-xs font-semibold text-slate-700 shadow-sm
            transition-all hover:border-slate-300 hover:bg-slate-50
            active:scale-[0.98]
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {importing ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          ) : (
            <Download size={15} />
          )}
          <span>{importing ? "Importing" : "Import"}</span>
        </button>

        {/* Desktop Export Button */}
        <button
          type="button"
          disabled={exporting || importing}
          onClick={() => setExportOpen((prev) => !prev)}
          className="
            inline-flex h-9 shrink-0 items-center justify-center gap-2
            rounded-lg bg-blue-600 px-3.5
            text-xs font-semibold text-white
            shadow-sm shadow-blue-200 transition-all
            hover:bg-blue-700 active:scale-[0.98]
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {exporting ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Upload size={15} />
          )}
          <span>{exporting ? "Exporting" : "Export"}</span>

          {!exporting && (
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                exportOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
      </div>

      {/* SINGLE UNIFIED EXPORT DROPDOWN MENU */}
      {exportOpen && !exporting && (
        <div
          ref={exportMenuRef}
          className="
            absolute right-3 top-12 z-50
            w-52 max-w-[calc(100vw-1.5rem)]
            overflow-hidden rounded-xl border border-slate-200
            bg-white p-1.5 shadow-xl shadow-slate-900/10
            sm:right-5 sm:top-14
          "
        >
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

      {/* Mobile Row 2: Public toggle, Canvas name input, Save button */}
      <div
        className="
          flex w-full min-w-0 items-center gap-2 pt-1 border-t border-slate-100
          sm:hidden
        "
      >
        <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-600">
          <span>Public</span>
          <Switch checked={isPublic} onChange={setIsPublic} />
        </label>

        <input
          type="text"
          value={canvasName}
          onChange={(event) => setCanvasName(event.target.value)}
          aria-label="Canvas name"
          className="
            h-9 min-w-0 flex-1 rounded-md
            border border-slate-200 bg-white px-2
            text-sm text-slate-700 outline-none transition
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          "
        />

        <button
          type="button"
          aria-label="Save canvas"
          title="Save canvas"
          onClick={handleSave}
          className="
            inline-flex h-9 w-9 shrink-0 items-center justify-center
            rounded-lg border border-slate-200 bg-white
            text-slate-700 shadow-sm transition
            hover:bg-slate-50 active:scale-[0.98]
          "
        >
          <Save size={16} />
        </button>
      </div>

      {/* Import Notification Banner */}
      {importMessage && (
        <div
          role="status"
          className="
            absolute right-2 top-full z-50 mt-2
            flex w-[calc(100vw-1rem)] max-w-[340px]
            items-start gap-3 rounded-xl border border-slate-200
            bg-white px-3.5 py-3 shadow-lg shadow-slate-900/10
            sm:right-5
          "
        >
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              importMessage === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {importMessage === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800">
              {importMessage === "success"
                ? "Import successful"
                : "Import failed"}
            </p>
            <p className="mt-0.5 break-words text-[11px] leading-4 text-slate-500">
              {messageText}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setImportMessage(null);
              setMessageText("");
            }}
            className="
              flex h-6 w-6 shrink-0 items-center justify-center
              rounded-md text-slate-400 transition
              hover:bg-slate-100 hover:text-slate-600
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
        group flex w-full items-center gap-3
        rounded-lg px-2.5 py-2.5 text-left
        transition-all hover:bg-slate-50
      "
    >
      <div
        className="
          flex h-8 w-8 shrink-0 items-center justify-center
          rounded-lg bg-slate-100 text-slate-500
          transition group-hover:bg-blue-50 group-hover:text-blue-600
        "
      >
        {icon}
      </div>

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