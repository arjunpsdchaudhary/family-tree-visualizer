"use client";

import Link from "next/link";
import { ArrowRight, Download, GitBranch } from "lucide-react";

// import FamilyTree from "@/components/FamilyTree";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <GitBranch className="h-4 w-4 text-white" />
            </div>

            <span className="font-semibold">FamilyTree</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link
              href="/public"
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Public Trees
            </Link>

            <Link
              href="/signin"
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:block"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <div>
            <h1 className="max-w-lg text-4xl font-bold tracking-tight sm:text-5xl">
              Create your family tree.
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-slate-500">
              Connect parents, children, siblings, and ancestors in one simple,
              interactive family tree.
            </p>

            {/* Buttons */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Tree
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/create"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Try without signing in
              </Link>
            </div>

            {/* Public trees */}
            <Link
              href="/public"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
            >
              Explore public family trees
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Export */}
            <div className="mt-9 flex items-center gap-2 text-sm text-slate-400">
              <Download className="h-4 w-4" />

              <span>Export as</span>

              <span className="font-medium text-slate-600">
                PNG · SVG · PDF · JSON
              </span>
            </div>
          </div>

          {/* Right - Tree */}
          <div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {/* Your FamilyTree component goes here */}

              <div className="h-[400px] w-full sm:h-[500px]">
                {/* <FamilyTree /> */}

                <FamilyTreePlaceholder />
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              Interactive family tree
            </p>
          </div>
        </div>
      </section>

      {/* Small public trees section */}
      <section className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Public Family Trees</h2>

            <p className="mt-1 text-sm text-slate-500">
              Explore trees shared by other users.
            </p>
          </div>

          <Link
            href="/public"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-900"
          >
            Browse trees
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} FamilyTree
          </p>
        </div>
      </footer>
    </main>
  );
}

/* Temporary placeholder */

function FamilyTreePlaceholder() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex flex-col items-center">
        <TreeNode name="Grandfather" />

        <div className="h-8 w-px bg-slate-300" />

        <TreeNode name="Father" active />

        <div className="h-8 w-px bg-slate-300" />

        <div className="flex gap-3">
          <TreeNode name="Sibling" />
          <TreeNode name="You" active />
          <TreeNode name="Sibling" />
        </div>

        <div className="h-8 w-px bg-slate-300" />

        <TreeNode name="Child" />
      </div>
    </div>
  );
}

function TreeNode({
  name,
  active = false,
}: {
  name: string;
  active?: boolean;
}) {
  return (
    <div
      className={`min-w-[80px] rounded-lg border px-3 py-2 text-center text-xs font-medium ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {name}
    </div>
  );
}
