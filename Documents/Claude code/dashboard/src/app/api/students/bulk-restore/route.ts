import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get("dashboard_auth");
  if (!authCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const auth = JSON.parse(authCookie.value);
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid auth" }, { status: 401 });
  }

  const body = await request.json();
  if (!body || !Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  try {
    const res = await fetch(`${apiBase}/api/dashboard-students/bulk-restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: body.ids }),
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: `API error: ${res.status} ${text}` },
        { status: res.status },
      );
    }
    return NextResponse.json(text ? JSON.parse(text) : { success: true, restoredCount: 0 });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to reach Railway API" }, { status: 500 });
  }
}
