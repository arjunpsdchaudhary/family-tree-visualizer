import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("Method:", request.url);
  console.log("Path:", request.nextUrl.pathname);

  if (pathname === "/signup") {
    NextResponse.redirect(new URL("/signin", request.url));
  }
  return NextResponse.next();
}
