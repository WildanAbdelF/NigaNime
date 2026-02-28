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
  const episodeId = request.nextUrl.searchParams.get("episode_id");
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

  if (episodeId) {
    query = query.eq("episode_id", episodeId);
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
  const { anime_id, anime_title, anime_poster, episode_id, episode_number, playback_position, duration } = body;

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
        playback_position: playback_position || 0,
        duration: duration || 0,
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

// PATCH /api/user/history — update playback position only (for continue watching)
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { anime_id, episode_id, playback_position, duration } = body;

  if (!anime_id || !episode_id) {
    return NextResponse.json({ error: "anime_id and episode_id are required" }, { status: 400 });
  }

  // Update only playback position without changing watched_at
  const { data, error } = await supabase
    .from("watch_history")
    .update({
      playback_position: playback_position || 0,
      duration: duration || 0,
    })
    .eq("user_id", user.id)
    .eq("anime_id", anime_id)
    .eq("episode_id", episode_id)
    .select()
    .single();

  if (error) {
    // If the record doesn't exist yet, create it
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
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
