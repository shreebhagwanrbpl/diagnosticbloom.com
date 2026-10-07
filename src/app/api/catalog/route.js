import { NextResponse } from "next/server";
import { adminFetch } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req) {
  const q = Object.fromEntries(req.nextUrl.searchParams.entries());
  try {
    const data = await adminFetch("/api/catalog", {}, q);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 502 });
  }
}
