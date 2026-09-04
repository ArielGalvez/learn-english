import { NextRequest, NextResponse } from "next/server";

const API = "https://commons.wikimedia.org/w/api.php";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "missing q" }, { status: 400 });

  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${q} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: "1",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "400",
      format: "json",
      origin: "*",
    });

    const res = await fetch(`${API}?${params.toString()}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const pages: Record<string, unknown> | undefined = data?.query?.pages;
    if (!pages) return NextResponse.json({ url: null });

    const first = Object.values(pages)[0] as {
      imageinfo?: { thumburl?: string; url?: string }[];
    };
    const raw =
      first?.imageinfo?.[0]?.thumburl ?? first?.imageinfo?.[0]?.url;
    const url = raw ? raw.split("?")[0] : null;

    return NextResponse.json({ url });
  } catch (err) {
    console.error("verb-image error:", (err as Error).message);
    return NextResponse.json({ url: null });
  }
}