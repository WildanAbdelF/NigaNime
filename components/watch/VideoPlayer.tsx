"use client";

import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  episodeId: string;
  server: string;
  category: string;
}

interface StreamingSource {
  url: string;
  isM3U8: boolean;
  quality?: string;
}

interface Track {
  url: string;
  lang: string;
}

interface StreamingData {
  sources: StreamingSource[];
  tracks?: Track[];
  headers?: Record<string, string>;
}

const STREAM_PROXY_BASE =
  process.env.NEXT_PUBLIC_STREAM_PROXY ?? "https://niganime-proxy-production.up.railway.app";

export default function VideoPlayer({ episodeId, server, category }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamingData, setStreamingData] = useState<StreamingData | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");
  const [useEmbed, setUseEmbed] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<number>(0);

  // Get subtitle tracks (filter out thumbnails)
  const subtitleTracks = streamingData?.tracks?.filter(
    (track) => track.lang.toLowerCase() !== "thumbnails"
  ) || [];

  // Generate embed URL based on episode ID
  const getEmbedUrl = () => {
    // Using 2embed as fallback
    const animeId = episodeId.split("?")[0];
    const epMatch = episodeId.match(/ep=(\d+)/);
    const epNum = epMatch ? epMatch[1] : "1";
    return `https://2anime.xyz/embed/${animeId}-episode-${epNum}`;
  };

  useEffect(() => {
    const fetchSources = async () => {
      setIsLoading(true);
      setError(null);

      // Validate episodeId format
      if (!episodeId || !episodeId.includes("?ep=")) {
        console.error("Invalid episodeId format:", episodeId);
        setError("Invalid episode ID format. Please select an episode from the list.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/watch/sources?episodeId=${encodeURIComponent(episodeId)}&server=${encodeURIComponent(server)}&category=${encodeURIComponent(category)}`
        );
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error("API Error:", result);
          // If server returns error, suggest trying external player
          throw new Error(result.error || `API error: ${response.status}`);
        }
        
        // Handle response - the API returns { status: 200, data: { sources, subtitles, ... } }
        const data = result.data || result;
        
        if (data?.sources && data.sources.length > 0) {
          setStreamingData(data);
        } else {
          console.error("No sources in response:", result);
          throw new Error("No streaming sources available. Try a different server.");
        }
      } catch (err) {
        console.error("Error fetching sources:", err);
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSources();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [episodeId, server, category]);

  useEffect(() => {
    if (!streamingData || !videoRef.current) return;

    const video = videoRef.current;
    const source = streamingData.sources[0];

    if (!source) return;

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Use proxy URL to avoid CORS issues
    const proxyUrl = `${STREAM_PROXY_BASE}/stream?url=${encodeURIComponent(source.url)}`;

    if (source.isM3U8 && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });

      hlsRef.current = hls;
      hls.loadSource(proxyUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError("Video playback error");
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari) - also use proxy
      video.src = proxyUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    } else {
      setError("HLS is not supported in this browser");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamingData]);

  // Add keyboard controls for skip 10 seconds
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      const video = videoRef.current;

      // Skip forward 10 seconds with right arrow
      if (e.key === "ArrowRight") {
        e.preventDefault();
        video.currentTime = Math.min(video.currentTime + 10, video.duration);
      }
      // Skip backward 10 seconds with left arrow
      else if (e.key === "ArrowLeft") {
        e.preventDefault();
        video.currentTime = Math.max(video.currentTime - 10, 0);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Add subtitles dynamically after video is ready
  useEffect(() => {
    if (!videoRef.current || subtitleTracks.length === 0) return;

    const video = videoRef.current;
    
    // Remove existing tracks
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }

    // Find English track index (default to first if not found)
    const englishIndex = subtitleTracks.findIndex(
      (track) => track.lang.toLowerCase().includes("english")
    );
    const defaultIndex = englishIndex >= 0 ? englishIndex : 0;

    // Add subtitle tracks dynamically
    subtitleTracks.forEach((track, index) => {
      const trackElement = document.createElement("track");
      trackElement.kind = "subtitles";
      trackElement.src = `${STREAM_PROXY_BASE}/subtitle?url=${encodeURIComponent(track.url)}`;
      trackElement.srclang = track.lang.toLowerCase().slice(0, 2);
      trackElement.label = track.lang;
      if (index === defaultIndex) {
        trackElement.default = true;
      }
      video.appendChild(trackElement);
    });

    // Enable English/default track after a delay
    const enableSubtitle = () => {
      if (video.textTracks.length > 0 && video.textTracks[defaultIndex]) {
        video.textTracks[defaultIndex].mode = "showing";
        setCurrentSubtitle(defaultIndex);
      }
    };

    // Try immediately and also with delay
    enableSubtitle();
    const timer = setTimeout(enableSubtitle, 1000);

    return () => clearTimeout(timer);
  }, [subtitleTracks]);

  // If using embed fallback
  if (useEmbed) {
    return (
      <div className="relative w-full max-w-[1100px] bg-black aspect-video rounded-lg overflow-hidden">
        <iframe
          src={getEmbedUrl()}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
        />
        <button
          onClick={() => setUseEmbed(false)}
          className="absolute top-2 right-2 px-3 py-1 bg-[#1a2332]/80 hover:bg-[#232d3f] text-white text-xs rounded transition-colors"
        >
          Try Native Player
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[1100px] bg-black aspect-video rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f1729]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f1729]">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-white font-medium">{error}</p>
            <p className="text-gray-400 text-sm">The streaming source is currently unavailable.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setUseEmbed(true)}
                className="px-4 py-2 bg-[#f5c518] hover:bg-[#d4a817] text-black font-medium rounded-lg transition-colors"
              >
                Use External Player
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#1a2332] hover:bg-[#232d3f] text-white font-medium rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {!error && !isLoading && streamingData && (
        <>
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            playsInline
            crossOrigin="anonymous"
          />
        </>
      )}
    </div>
  );
}