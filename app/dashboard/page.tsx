"use client";

import Link from "next/link";
import {
  ArrowRight,
  FolderTree,
  GitBranch,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";

const myCanvases = [
  {
    id: "1",
    name: "Family of Ram",
    members: 24,
    updated: "Updated 2 days ago",
  },
  {
    id: "2",
    name: "Family of Hari",
    members: 18,
    updated: "Updated 5 days ago",
  },
  {
    id: "3",
    name: "My Family Tree",
    members: 12,
    updated: "Updated today",
  },
];

const publicTrees = [
  {
    id: "1",
    name: "Sharma Family",
    author: "ramsharma",
    members: 42,
  },
  {
    id: "2",
    name: "Thapa Family",
    author: "suresh01",
    members: 31,
  },
  {
    id: "3",
    name: "Khan Family",
    author: "aamir",
    members: 27,
  },
];

export default function DashboardPage() {
  const fetchUserData = async () => {
    try {
      // const response = await
    } catch (error: any) {}
  };
  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Logo */}

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <GitBranch className="h-4 w-4 text-white" />
            </div>

            <span className="font-semibold">FamilyTree</span>
          </Link>

          {/* Right navigation */}

          <div className="flex items-center gap-2">
            <Link
              href="/public"
              className="hidden rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 sm:block"
            >
              Public Trees
            </Link>

            {/* User */}
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">
                A
              </div>

              <span className="hidden text-sm font-medium sm:block">
                Account
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Page heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Your Family Trees
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Create and manage your family trees.
            </p>
          </div>

          <Link
            href="/canvas/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            New Canvas
          </Link>
        </div>

        {/* Search */}
        <div className="mt-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search your family trees..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* My canvases */}
        <section className="mt-8">
          {myCanvases.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myCanvases.map((canvas) => (
                <CanvasCard key={canvas.id} canvas={canvas} />
              ))}
            </div>
          ) : (
            <EmptyCanvas />
          )}
        </section>

        {/* Public trees */}
        <section className="mt-14 border-t border-slate-200 pt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Public Family Trees
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Explore trees shared by other users.
              </p>
            </div>

            <Link
              href="/public"
              className="hidden items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950 sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicTrees.map((tree) => (
              <PublicTreeCard key={tree.id} tree={tree} />
            ))}
          </div>

          <Link
            href="/public"
            className="mt-5 flex items-center justify-center gap-1 text-sm font-medium text-slate-700 sm:hidden"
          >
            View all public trees
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   CANVAS CARD
========================================================= */

function CanvasCard({
  canvas,
}: {
  canvas: {
    id: string;
    name: string;
    members: number;
    updated: string;
  };
}) {
  return (
    <Link
      href={`/canvas/${canvas.id}`}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
    >
      {/* Preview */}
      <div className="flex h-36 items-center justify-center border-b border-slate-100 bg-slate-50">
        <MiniTree />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {canvas.name}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5" />
              {canvas.members} members
            </div>

            <p className="mt-1 text-xs text-slate-400">{canvas.updated}</p>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   PUBLIC TREE CARD
========================================================= */

function PublicTreeCard({
  tree,
}: {
  tree: {
    id: string;
    name: string;
    author: string;
    members: number;
  };
}) {
  return (
    <Link
      href={`/public/${tree.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
    >
      {/* Preview */}
      <div className="flex h-32 items-center justify-center bg-slate-50">
        <MiniTree />
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold">{tree.name}</h3>

        <p className="mt-1 text-xs text-slate-500">by @{tree.author}</p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="h-3.5 w-3.5" />
          {tree.members} members
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyCanvas() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <FolderTree className="h-5 w-5 text-slate-500" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">No family trees yet</h3>

      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Create your first family tree and start connecting your family.
      </p>

      <Link
        href="/canvas/new"
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        Create Tree
      </Link>
    </div>
  );
}

/* =========================================================
   MINI TREE PREVIEW
========================================================= */

function MiniTree() {
  return (
    <div className="flex flex-col items-center">
      {/* Top */}
      <div className="flex gap-2">
        <div className="h-4 w-12 rounded bg-slate-200" />
        <div className="h-4 w-12 rounded bg-slate-200" />
      </div>

      <div className="h-3 w-px bg-slate-300" />

      {/* Middle */}
      <div className="h-4 w-16 rounded bg-slate-300" />

      <div className="h-3 w-px bg-slate-300" />

      {/* Bottom */}
      <div className="flex gap-2">
        <div className="h-4 w-10 rounded bg-slate-200" />
        <div className="h-4 w-10 rounded bg-slate-900" />
        <div className="h-4 w-10 rounded bg-slate-200" />
      </div>
    </div>
  );
}
