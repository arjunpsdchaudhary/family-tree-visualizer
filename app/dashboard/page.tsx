
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
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DropdownButton } from "@/components/ui/DropdownButton";
import { Canvas } from "@/lib/types";
import { authClient } from "@/lib/auth-client";

type MyCanvas = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: number;
};

type MyCanvasApiResponse =
  | MyCanvas[]
  | {
      data: MyCanvas[];
    };


export default function DashboardPage() {
  const [myCanvases, setMyCanvases] = useState<MyCanvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [publicTrees, setPublicTrees] = useState<Canvas[]>([]);
  const {data} = authClient.useSession();
 

  const router = useRouter();

  // FETCH MY CANVASES
  const fetchUserData = async () => {
    try {
      setLoading(true);

      const response = await axios.get<MyCanvasApiResponse>(
        "/api/canvas/mycanvas"
      );

      let canvases: MyCanvas[] = [];

      if (Array.isArray(response.data)) {
        canvases = response.data;
      } else if (
        response.data &&
        Array.isArray(response.data.data)
      ) {
        canvases = response.data.data;
      }

      setMyCanvases(canvases);
    } catch (error) {
      console.error("Error fetching canvases:", error);
      setMyCanvases([]);
    } finally {
      setLoading(false);
    }
  };

  

  //fetch public trees

  const fetchPublicTrees = async()=>{
    try{

      if(!data){
        return;
      }
      
       const response = await axios.get("/api/canvas/publictrees");

       const publicCanvases:Canvas[] = response.data.trees;

       setPublicTrees(()=>publicCanvases.filter((tree)=>tree.ownerId !=data?.user.id ));


      
    }catch(error){
      console.error("Error fetching public trees", error);

    }

  }

  // FETCH ON PAGE LOAD
  useEffect(() => {
    fetchUserData();
   
  }, []);

  useEffect(()=>{
    fetchPublicTrees();

  },[data])

  // CREATE NEW CANVAS
  const createCanvas = async () => {
    try {
      const response = await axios.post("/api/canvas");
      const canvasId = response.data.id;

      router.push(`/canvas?id=${canvasId}`);
    } catch (error) {
      console.error("Error while creating canvas:", error);
    }
  };

  // DELETE CANVAS
  const deleteCanvas = async (canvasId: string): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this family tree?"
    );

    if (!confirmed) return;

    try {
       await axios.delete(`/api/canvas/${canvasId}`);

      setMyCanvases((prev) =>
        prev.filter((canvas) => canvas.id !== canvasId)
      );
    } catch (error) {
      console.error("Error deleting canvas:", error);
      alert("Failed to delete the family tree. Please try again.");
      throw error;
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900">
      {/* NAVBAR */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <GitBranch className="h-4 w-4 text-white" />
            </div>

            <span className="font-semibold">FamilyTree</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/publictrees"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 sm:block"
            >
              Public Trees
            </Link>

            <DropdownButton />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* PAGE HEADING */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Your Family Trees
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Create and manage your family trees.
            </p>
          </div>

          <button
            type="button"
            onClick={createCanvas}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            New Canvas
          </button>
        </div>

        {/* SEARCH */}
        <div className="mt-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search your family trees..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* MY CANVASES */}
        <section className="mt-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : myCanvases.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myCanvases.map((canvas) => (
                <CanvasCard
                  key={canvas.id}
                  canvas={canvas}
                  onDelete={deleteCanvas}
                />
              ))}
            </div>
          ) : (
            <EmptyCanvas createCanvas={createCanvas} />
          )}
        </section>

        {/* PUBLIC TREES */}
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
              href="/publictrees"
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
            href="/publictrees"
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
  onDelete,
}: {
  canvas: MyCanvas;
  onDelete: (canvasId: string) => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // CLOSE MENU ON OUTSIDE CLICK OR ESCAPE
  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  // HANDLE DELETE
  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setDeleting(true);

    try {
      await onDelete(canvas.id);
    } catch {
      // Error is handled by deleteCanvas.
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  return (
    <Link
      href={`/canvas?id=${canvas.id}`}
      className="group relative block overflow-visible rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
    >
      {/* PREVIEW */}
      <div className="flex h-36 items-center justify-center rounded-t-xl border-b border-slate-100 bg-slate-50">
        <MiniTree />
      </div>

      {/* INFO */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {canvas.name}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Family Tree
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Created{" "}
              {new Date(canvas.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* THREE-DOT MENU */}
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              aria-label="Canvas options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* DROPDOWN */}
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
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
  tree: Canvas
}) {


const date = new Date(tree.createdAt);
const formattedDate = date.toISOString().split("T")[0];

  return (
    <Link
      href={`/publictrees/${tree.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex h-32 items-center justify-center bg-slate-50">
        <MiniTree />
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold">{tree.name}</h3>

        

         <div className=" flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="h-3.5 w-3.5" />
          <p className="mt-1 text-xs text-slate-500">family tree</p>
        </div> 
        <p className="mt-1 text-xs text-slate-500">
          CreatedAt :{formattedDate}
        </p>
      </div>
    </Link>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyCanvas({
  createCanvas,
}: {
  createCanvas: () => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <FolderTree className="h-5 w-5 text-slate-500" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        No family trees yet
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Create your first family tree and start connecting your family.
      </p>

      <button
        type="button"
        onClick={createCanvas}
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        Create Tree
      </button>
    </div>
  );
}

/* =========================================================
   MINI TREE PREVIEW
========================================================= */

function MiniTree() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2">
        <div className="h-4 w-12 rounded bg-slate-200" />
        <div className="h-4 w-12 rounded bg-slate-200" />
      </div>

      <div className="h-3 w-px bg-slate-300" />

      <div className="h-4 w-16 rounded bg-slate-300" />

      <div className="h-3 w-px bg-slate-300" />

      <div className="flex gap-2">
        <div className="h-4 w-10 rounded bg-slate-200" />
        <div className="h-4 w-10 rounded bg-slate-900" />
        <div className="h-4 w-10 rounded bg-slate-200" />
      </div>
    </div>
  );
}
