import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/user/history — list user's watch history
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const animeId = request.nextUrl.searchParams.get("anime_id");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

  let query = supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", user.id)
    .order("watched_at", { ascending: false })
    .limit(limit);

  if (animeId) {
    query = query.eq("anime_id", animeId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/user/history — add/update watch history
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { anime_id, anime_title, anime_poster, episode_id, episode_number } = body;

  if (!anime_id || !episode_id) {
    return NextResponse.json({ error: "anime_id and episode_id are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("watch_history")
    .upsert(
      {
        user_id: user.id,
        anime_id,
        anime_title: anime_title || "Unknown",
        anime_poster: anime_poster || null,
        episode_id,
        episode_number: episode_number || 1,
        watched_at: new Date().toISOString(),
      },
      { onConflict: "user_id,anime_id,episode_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/user/history — clear history (all or specific anime)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const animeId = request.nextUrl.searchParams.get("anime_id");

  let query = supabase
    .from("watch_history")
    .delete()
    .eq("user_id", user.id);

  if (animeId) {
    query = query.eq("anime_id", animeId);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
