import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ message: "Token tidak ada" }, { status: 400 });
  }

  const cookieStore = await cookies();

  cookieStore.set("__session", idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ success: true });
}
