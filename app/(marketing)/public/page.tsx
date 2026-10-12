"use client";

import Link from "next/link";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  Search,
  RefreshCw,
  TreePine,
  AlertCircle,
  LoaderCircle,
  X,
  CalendarDays,
} from "lucide-react";

export interface Canvas {
  id: string;
  name?: string;
  ownerId: string;
  createdAt: string;
  isPublic?: boolean;
}

export default function PublicTreesPage() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPublicCanvases = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get("/api/canvas/public");


      console.log("---------------------------response", response)

      // if (!Array.isArray(response.data)) {
      //   throw new Error("Invalid response received from the public canvases API.");
      // }

       setCanvases(response.data.trees);
    } catch (err) {
      console.error("Failed to fetch public canvases:", err);

      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error ||
              err.message ||
              "Failed to load public trees."
          : err instanceof Error
            ? err.message
            : "Failed to load public trees.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPublicCanvases();
  }, [fetchPublicCanvases]);

  // Search by canvas name or canvas ID.
  const filteredCanvases = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return canvases;

    return canvases.filter((canvas) => {
      const name = (canvas.name || "Untitled family tree").toLowerCase();
      const id = canvas.id.toLowerCase();

      return name.includes(query) || id.includes(query);
    });
  }, [canvases, search]);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <GitBranch className="h-4 w-4 text-white" />
            </div>

            <span className="font-semibold">FamilyTree</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      {/* Heading and search */}
      <section className="border-b border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TreePine className="h-4 w-4" />
            Community
            <span>/</span>
            Public trees
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Explore public family trees
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Discover family histories shared by the community. Search by
            canvas name or canvas ID to find a specific family tree.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by canvas name or ID..."
                aria-label="Search public canvases by name or ID"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => void fetchPublicCanvases()}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {!loading && !error && (
            <p className="mt-4 text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredCanvases.length}
              </span>{" "}
              of {canvases.length} public{" "}
              {canvases.length === 1 ? "tree" : "trees"}
            </p>
          )}
        </div>
      </section>

      {/* Public canvas grid */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <LoaderCircle className="h-8 w-8 animate-spin text-slate-900" />
            <p className="text-sm">Loading public family trees...</p>
          </div>
        ) : error ? (
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />

            <h2 className="mt-4 font-semibold">
              Could not load public trees
            </h2>

            <p className="mt-2 text-sm text-slate-600">{error}</p>

            <button
              type="button"
              onClick={() => void fetchPublicCanvases()}
              className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Try again
            </button>
          </div>
        ) : filteredCanvases.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <TreePine className="h-6 w-6 text-slate-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              {search ? "No matching trees found" : "No public trees yet"}
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {search
                ? "Try another canvas name or check the canvas ID."
                : "Public family trees shared by the community will appear here."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-4"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCanvases.map((canvas) => (
              <Link
                key={canvas.id}
                href={`/canvas?id=${encodeURIComponent(canvas.id)}`}
                className="group flex min-h-64 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-lg hover:shadow-slate-200/60"
              >
                {/* Card artwork */}
                <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-slate-100 bg-slate-50">
                  <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-slate-200/60 transition duration-300 group-hover:scale-125" />

                  <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-slate-200/50" />

                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 group-hover:scale-105">
                    <GitBranch className="h-8 w-8 text-slate-800" />
                  </div>

                  <span className="absolute left-4 top-4 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    Public tree
                  </span>
                </div>

                {/* Card details */}
                <div className="flex flex-1 flex-col p-5">
                  <h2
                    className="truncate text-base font-semibold text-slate-900"
                    title={canvas.name || "Untitled family tree"}
                  >
                    {canvas.name || "Untitled family tree"}
                  </h2>

                  <p className="mt-2 text-xs text-slate-500">Canvas ID</p>

                  <p
                    className="mt-1 break-all font-mono text-xs leading-5 text-slate-500"
                    title={canvas.id}
                  >
                    {canvas.id}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Created{" "}
                    {Number.isNaN(Date.parse(canvas.createdAt))
                      ? "date unavailable"
                      : new Date(canvas.createdAt).toLocaleDateString()}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-5">
                    <span className="text-sm font-medium text-slate-700 transition group-hover:text-slate-950">
                      Explore tree
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="font-semibold text-slate-800">
            FamilyTree
          </Link>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} FamilyTree
          </p>
        </div>
      </footer>
    </main>
  );
}
