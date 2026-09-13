"use client";

import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { FormEvent, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log("hello");
      const data = { email, password };

      const response = await axios.post("/api/signin", data);
      toast.success(response.data.message);
      router.push("/dashboard");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401) {
          toast.error("Invalid Credentails...");
          return;
        }

        if (status === 409) {
          toast.error("Email already exists");
        } else if (status === 400) {
          toast.error("Invalid signup information");
        } else if (status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Signup failed");
        }
      }
    }

    // Add your signin logic here
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <GitBranch className="h-4 w-4 text-white" />
            </div>

            <span className="font-semibold text-slate-900">FamilyTree</span>
          </Link>

          <Link
            href="/signup"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to your family tree.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Your password"
                autoComplete="current-password"
                required
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Signup */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-slate-900 hover:underline"
            >
              Create one
            </Link>
          </p>

          {/* Guest */}
          <div className="mt-8 border-t border-slate-200 pt-6 text-center">
            <Link
              href="/canvas"
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              Continue without signing in →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-5 py-6 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} FamilyTree
        </p>
      </footer>
    </main>
  );
}
