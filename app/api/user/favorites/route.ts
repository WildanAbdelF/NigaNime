import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/user/favorites — list user's favorites
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/user/favorites — add a favorite
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { anime_id, anime_title, anime_poster, anime_type, anime_rating } = body;

  if (!anime_id || !anime_title) {
    return NextResponse.json({ error: "anime_id and anime_title are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("favorites")
    .upsert(
      {
        user_id: user.id,
        anime_id,
        anime_title,
        anime_poster: anime_poster || null,
        anime_type: anime_type || null,
        anime_rating: anime_rating || null,
      },
      { onConflict: "user_id,anime_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/user/favorites?anime_id=xxx — remove a favorite
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const animeId = request.nextUrl.searchParams.get("anime_id");

  if (!animeId) {
    return NextResponse.json({ error: "anime_id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("anime_id", animeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
