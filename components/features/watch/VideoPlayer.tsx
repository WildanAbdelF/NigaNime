"use client";

import { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import type { ReactNode, Dispatch, SetStateAction, RefObject } from "react";
import Hls from "hls.js";
import { markEpisodeWatched, markEpisodeVisited } from "@/lib/utils/watchedHistory";

interface VideoPlayerProps {
  episodeId: string;
  server: string;
  category: string;
  children?: ReactNode;
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

interface SegmentRange {
  start: number;
  end: number;
}

interface StreamingData {
  sources: StreamingSource[];
  tracks?: Track[];
  intro?: SegmentRange | null;
  outro?: SegmentRange | null;
  headers?: Record<string, string>;
}

interface VideoPlayerContextValue {
  videoRef: RefObject<HTMLVideoElement | null>;
  isLoading: boolean;
  isSwitchingQuality: boolean;
  error: string | null;
  streamingData: StreamingData | null;
  useEmbed: boolean;
  setUseEmbed: Dispatch<SetStateAction<boolean>>;
  getEmbedUrl: () => string;
  captionBackground: string;
  captionFontScale: number;
  introRange: SegmentRange | null;
  outroRange: SegmentRange | null;
  showIntroPrompt: boolean;
  showOutroPrompt: boolean;
  handleSkip: (segment: "intro" | "outro") => void;
  autoSkipIntro: boolean;
  setAutoSkipIntro: Dispatch<SetStateAction<boolean>>;
  autoSkipOutro: boolean;
  setAutoSkipOutro: Dispatch<SetStateAction<boolean>>;
  availableQualities: string[];
  currentQuality: string;
  handleQualityChange: (quality: string) => void;
  subtitleTracks: Track[];
  selectedSubtitle: number | "off";
  handleSubtitleChange: (index: number | "off") => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

const useVideoPlayerContext = () => {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error("useVideoPlayerContext must be used within VideoPlayer");
  }
  return context;
};

const STREAM_PROXY_BASE =
  process.env.NEXT_PUBLIC_STREAM_PROXY ?? "/api/proxy";

const hexToRgba = (hex: string, opacity: number) => {
  const sanitized = hex.replace("#", "");
  const bigint = Number.parseInt(sanitized, 16);
  if (Number.isNaN(bigint)) {
    return `rgba(255, 255, 255, ${opacity})`;
  }
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const DEFAULT_CAPTION_COLOR = "#000000";
const DEFAULT_CAPTION_OPACITY = 0.45;
const DEFAULT_CAPTION_SCALE = 1;

const normalizeQualityLabel = (quality?: string | null) => {
  if (!quality) return null;
  const trimmed = quality.trim().toLowerCase();
  const numericMatch = trimmed.match(/(\d{3,4})/);
  if (numericMatch) {
    return `${numericMatch[1]}p`;
  }
  if (trimmed === "auto" || trimmed === "source") {
    return trimmed;
  }
  return trimmed;
};

const getQualitySortValue = (quality: string) => {
  const numericMatch = quality.match(/(\d{3,4})/);
  if (numericMatch) {
    return Number(numericMatch[1]);
  }
  if (quality === "auto") return Number.MAX_SAFE_INTEGER;
  return -1;
};

export default function VideoPlayer({ episodeId, server, category, children }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const subtitleTrackRefs = useRef<HTMLTrackElement[]>([]);
  const introSkippedRef = useRef(false);
  const outroSkippedRef = useRef(false);
  const hlsQualityMapRef = useRef<Record<string, number>>({});
  const watchedMarkedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingQuality, setIsSwitchingQuality] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingData, setStreamingData] = useState<StreamingData | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");
  const [useEmbed, setUseEmbed] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<number | "off">("off");
  const [hlsQualityLabels, setHlsQualityLabels] = useState<string[]>([]);
  const currentQualityRef = useRef(currentQuality);
  const [autoSkipIntro, setAutoSkipIntro] = useState(true);
  const [autoSkipOutro, setAutoSkipOutro] = useState(false);
  const [showIntroPrompt, setShowIntroPrompt] = useState(false);
  const [showOutroPrompt, setShowOutroPrompt] = useState(false);

  const subtitleTracks = useMemo(
    () => streamingData?.tracks?.filter((track) => track.lang.toLowerCase() !== "thumbnails") || [],
    [streamingData]
  );

  const availableQualities = useMemo(() => {
    if (!streamingData?.sources || streamingData.sources.length === 0) return [];

    const hasHlsSource = streamingData.sources.some((source) => source.isM3U8);

    if (hlsQualityLabels.length > 0) {
      const sorted = [...hlsQualityLabels].sort((a, b) => getQualitySortValue(b) - getQualitySortValue(a));
      return ["auto", ...sorted.filter((label, index, self) => self.indexOf(label) === index)];
    }

    if (hasHlsSource) {
      return ["auto"];
    }

    const labels = streamingData.sources
      .map((source) => normalizeQualityLabel(source.quality) ?? (source.isM3U8 ? "auto" : "source"))
      .filter((label): label is string => Boolean(label));

    const unique = labels.filter((value, index, self) => self.indexOf(value) === index);
    return unique.sort((a, b) => getQualitySortValue(b) - getQualitySortValue(a));
  }, [hlsQualityLabels, streamingData]);

  const selectedSource = useMemo(() => {
    if (!streamingData?.sources || streamingData.sources.length === 0) return null;

    const hlsSource = streamingData.sources.find((src) => src.isM3U8);
    if (hlsSource) {
      return hlsSource;
    }

    if (currentQuality === "auto") {
      return streamingData.sources[0];
    }

    return (
      streamingData.sources.find((src) => normalizeQualityLabel(src.quality) === currentQuality) || streamingData.sources[0]
    );
  }, [streamingData, currentQuality]);

  const introRange = streamingData?.intro || null;
  const outroRange = streamingData?.outro || null;
  const captionFontScale = DEFAULT_CAPTION_SCALE;
  const captionBackground = hexToRgba(DEFAULT_CAPTION_COLOR, DEFAULT_CAPTION_OPACITY);

  useEffect(() => {
    if (availableQualities.length === 0) return;
    if (!availableQualities.includes(currentQuality)) {
      setCurrentQuality(availableQualities[0]);
    }
  }, [availableQualities, currentQuality]);

  useEffect(() => {
    // reset per-episode marker so we only mark watch completion once per load
    watchedMarkedRef.current = false;
  }, [episodeId]);

  useEffect(() => {
    const animeId = episodeId.split("?")[0];
    const epMatch = episodeId.match(/ep=(\d+)/);
    const episodeNumber = epMatch ? Number(epMatch[1]) : 0;

    markEpisodeVisited(animeId, {
      episodeId,
      episodeNumber,
      visitedAt: Date.now(),
    });
  }, [episodeId]);

  const getEmbedUrl = () => {
    const animeId = episodeId.split("?")[0];
    const epMatch = episodeId.match(/ep=(\d+)/);
    const epNum = epMatch ? epMatch[1] : "1";
    return `https://2anime.xyz/embed/${animeId}-episode-${epNum}`;
  };

  useEffect(() => {
    const fetchSources = async () => {
      setIsLoading(true);
      setError(null);

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
          throw new Error(result.error || `API error: ${response.status}`);
        }

        const data = result.data || result;

        if (data?.sources && data.sources.length > 0) {
          setStreamingData(data);
          setCurrentQuality("auto");
        } else {
          console.error("No sources in response:", result);
          throw new Error("No streaming sources available. Try a different server.");
        }
      } catch (err) {
        console.error("Error fetching sources:", err);
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setIsLoading(false);
        setIsSwitchingQuality(false);
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
    if (!selectedSource || !videoRef.current) return;

    const video = videoRef.current;
    const cleanupFns: Array<() => void> = [];
    const resetHlsQualities = () => {
      setHlsQualityLabels([]);
      hlsQualityMapRef.current = {};
    };

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const proxyUrl = `${STREAM_PROXY_BASE}/stream?url=${encodeURIComponent(selectedSource.url)}`;

    if (selectedSource.isM3U8 && Hls.isSupported()) {
      resetHlsQualities();
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

      const handleManifestParsed = () => {
        const qualityMap: Record<string, number> = {};
        const labels = hls.levels.map((level, index) => {
          const label = normalizeQualityLabel(level.height ? `${level.height}p` : level.name || `${index + 1}`) || `${index + 1}`;
          qualityMap[label] = index;
          return label;
        });
        const uniqueSorted = labels
          .filter((label, index, self) => self.indexOf(label) === index)
          .sort((a, b) => getQualitySortValue(b) - getQualitySortValue(a));
        hlsQualityMapRef.current = qualityMap;
        setHlsQualityLabels(uniqueSorted);

        const previouslySelectedQuality = currentQualityRef.current;
        if (previouslySelectedQuality !== "auto") {
          const targetLevel = qualityMap[previouslySelectedQuality];
          if (typeof targetLevel === "number") {
            hls.currentLevel = targetLevel;
          } else {
            hls.currentLevel = -1;
          }
        } else {
          hls.currentLevel = -1;
        }

        video.play().catch(() => {});
        setIsSwitchingQuality(false);
      };

      const handleLevelSwitched = () => setIsSwitchingQuality(false);

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

      hls.on(Hls.Events.MANIFEST_PARSED, handleManifestParsed);
      hls.on(Hls.Events.LEVEL_SWITCHED, handleLevelSwitched);

      cleanupFns.push(() => {
        hls.off(Hls.Events.MANIFEST_PARSED, handleManifestParsed);
        hls.off(Hls.Events.LEVEL_SWITCHED, handleLevelSwitched);
        resetHlsQualities();
      });
    } else if (selectedSource.isM3U8 && video.canPlayType("application/vnd.apple.mpegurl")) {
      resetHlsQualities();
      video.src = proxyUrl;
      video.addEventListener(
        "loadedmetadata",
        () => {
          video.play().catch(() => {});
          setIsSwitchingQuality(false);
        },
        { once: true }
      );
    } else {
      resetHlsQualities();
      video.src = proxyUrl;
      video.load();
      video.addEventListener(
        "canplay",
        () => setIsSwitchingQuality(false),
        { once: true }
      );
      video.play().catch(() => {});
    }

    introSkippedRef.current = false;
    outroSkippedRef.current = false;

    return () => {
      cleanupFns.forEach((fn) => fn());
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedSource]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      const video = videoRef.current;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        video.currentTime = Math.min(video.currentTime + 10, video.duration);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        video.currentTime = Math.max(video.currentTime - 10, 0);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const animeId = episodeId.split("?")[0];
    const epMatch = episodeId.match(/ep=(\d+)/);
    const episodeNumber = epMatch ? Number(epMatch[1]) : 0;

    const markWatchedOnProgress = () => {
      if (watchedMarkedRef.current) return;
      if (!Number.isFinite(video.duration) || video.duration === 0) return;

      const progress = video.currentTime / video.duration;
      if (progress >= 0.8) {
        watchedMarkedRef.current = true;
        markEpisodeWatched(animeId, {
          episodeId,
          episodeNumber,
          watchedAt: Date.now(),
        });
      }
    };

    const handleEnded = () => {
      if (watchedMarkedRef.current) return;
      watchedMarkedRef.current = true;
      markEpisodeWatched(animeId, {
        episodeId,
        episodeNumber,
        watchedAt: Date.now(),
      });
    };

    video.addEventListener("timeupdate", markWatchedOnProgress);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", markWatchedOnProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, [episodeId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    subtitleTrackRefs.current.forEach((track) => track.remove());
    subtitleTrackRefs.current = [];

    if (subtitleTracks.length === 0) {
      setSelectedSubtitle("off");
      return;
    }

    subtitleTracks.forEach((track) => {
      const trackElement = document.createElement("track");
      trackElement.kind = "subtitles";
      trackElement.src = `${STREAM_PROXY_BASE}/subtitle?url=${encodeURIComponent(track.url)}`;
      trackElement.srclang = track.lang.toLowerCase().slice(0, 2);
      trackElement.label = track.lang;
      video.appendChild(trackElement);
      subtitleTrackRefs.current.push(trackElement);
    });

    const englishIndex = subtitleTracks.findIndex((track) => track.lang.toLowerCase().includes("english"));
    const defaultIndex = englishIndex >= 0 ? englishIndex : 0;
    setSelectedSubtitle(defaultIndex);

    return () => {
      subtitleTrackRefs.current.forEach((track) => track.remove());
      subtitleTrackRefs.current = [];
    };
  }, [subtitleTracks]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i += 1) {
      tracks[i].mode = selectedSubtitle === i ? "showing" : "disabled";
    }
    if (selectedSubtitle === "off") {
      for (let i = 0; i < tracks.length; i += 1) {
        tracks[i].mode = "disabled";
      }
    }
  }, [selectedSubtitle]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTime = () => {
      const current = video.currentTime;

      if (introRange) {
        const withinIntro = current >= introRange.start && current < introRange.end - 0.25;
        setShowIntroPrompt(withinIntro && !autoSkipIntro);

        if (autoSkipIntro && withinIntro && !introSkippedRef.current) {
          video.currentTime = introRange.end + 0.1;
          introSkippedRef.current = true;
          setShowIntroPrompt(false);
        }

        if (current < introRange.start - 1) {
          introSkippedRef.current = false;
        }
      }

      if (outroRange) {
        const withinOutro = current >= outroRange.start && current < outroRange.end - 0.25;
        setShowOutroPrompt(withinOutro && !autoSkipOutro);

        if (autoSkipOutro && withinOutro && !outroSkippedRef.current) {
          video.currentTime = Math.min(outroRange.end + 0.1, video.duration - 0.2);
          outroSkippedRef.current = true;
          setShowOutroPrompt(false);
        }

        if (current < outroRange.start - 1) {
          outroSkippedRef.current = false;
        }
      }
    };

    video.addEventListener("timeupdate", handleTime);
    return () => video.removeEventListener("timeupdate", handleTime);
  }, [autoSkipIntro, autoSkipOutro, introRange, outroRange]);

  const handleSkip = (segment: "intro" | "outro") => {
    const video = videoRef.current;
    if (!video) return;

    if (segment === "intro" && introRange) {
      video.currentTime = introRange.end + 0.05;
      introSkippedRef.current = true;
      setShowIntroPrompt(false);
    }

    if (segment === "outro" && outroRange) {
      video.currentTime = Math.min(outroRange.end + 0.05, video.duration - 0.2);
      outroSkippedRef.current = true;
      setShowOutroPrompt(false);
    }
  };

  const handleQualityChange = (quality: string) => {
    if (quality === currentQuality) return;
    setCurrentQuality(quality);

    if (hlsRef.current && hlsQualityLabels.length > 0) {
      if (quality === "auto") {
        hlsRef.current.currentLevel = -1;
        setIsSwitchingQuality(false);
        return;
      }

      setIsSwitchingQuality(true);
      const levelIndex = hlsQualityMapRef.current[quality];
      if (typeof levelIndex === "number") {
        // If we are already on the requested level, avoid getting stuck in a loading state
        if (hlsRef.current.currentLevel === levelIndex) {
          setIsSwitchingQuality(false);
          return;
        }
        hlsRef.current.currentLevel = levelIndex;
      } else {
        setIsSwitchingQuality(false);
      }
      return;
    }

    setIsSwitchingQuality(true);
  };

  useEffect(() => {
    currentQualityRef.current = currentQuality;
  }, [currentQuality]);

  const handleSubtitleChange = (index: number | "off") => {
    setSelectedSubtitle(index);
  };

  const contextValue: VideoPlayerContextValue = {
    videoRef,
    isLoading,
    isSwitchingQuality,
    error,
    streamingData,
    useEmbed,
    setUseEmbed,
    getEmbedUrl,
    captionBackground,
    captionFontScale,
    introRange,
    outroRange,
    showIntroPrompt,
    showOutroPrompt,
    handleSkip,
    autoSkipIntro,
    setAutoSkipIntro,
    autoSkipOutro,
    setAutoSkipOutro,
    availableQualities,
    currentQuality,
    handleQualityChange,
    subtitleTracks,
    selectedSubtitle,
    handleSubtitleChange,
  };

  return (
    <VideoPlayerContext.Provider value={contextValue}>
      {children ?? <DefaultVideoLayout />}
    </VideoPlayerContext.Provider>
  );
}

function DefaultVideoLayout() {
  return (
    <div className="w-full max-w-[1100px] space-y-4">
      <VideoSurface />
      <div className="rounded-2xl bg-[#0f1729] border border-white/5 shadow-2xl p-4 text-white">
        <PlayerControlRow />
      </div>
    </div>
  );
}

export function VideoSurface() {
  const {
    videoRef,
    isLoading,
    isSwitchingQuality,
    error,
    streamingData,
    useEmbed,
    setUseEmbed,
    getEmbedUrl,
    captionBackground,
    captionFontScale,
    introRange,
    outroRange,
    showIntroPrompt,
    showOutroPrompt,
    handleSkip,
  } = useVideoPlayerContext();

  if (useEmbed) {
    return (
      <div className="relative w-full bg-black aspect-video rounded-lg overflow-hidden">
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
    <div className="relative bg-black aspect-video rounded-2xl overflow-hidden shadow-2xl">
      {(isLoading || isSwitchingQuality) && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0f1729]">
          <div className="w-12 h-12 border-4 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm mt-3">
            {isSwitchingQuality ? "Switching quality..." : "Loading video..."}
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0f1729]">
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

      {!error && streamingData && (
        <>
          <video
            ref={videoRef}
            className="h-full w-full bg-black"
            controls
            playsInline
            crossOrigin="anonymous"
            style={{ fontSize: "1rem" }}
          />

          <style jsx>{`
            :global(.player-shell video::cue) {
              background: ${captionBackground};
              font-size: ${captionFontScale}rem;
              color: #fff;
              text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
              line-height: 1.4;
              padding: 0.2em 0.4em;
            }
          `}</style>

          <div className="player-shell absolute inset-0 pointer-events-none">
            {showIntroPrompt && (
              <button
                onClick={() => handleSkip("intro")}
                className="pointer-events-auto absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-[#f5c518] px-5 py-2 text-sm font-semibold text-black shadow-lg"
              >
                Skip Opening
              </button>
            )}

            {showOutroPrompt && (
              <button
                onClick={() => handleSkip("outro")}
                className="pointer-events-auto absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-black shadow-lg"
              >
                Skip Ending
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function PlayerControlRow({ className = "" }: { className?: string } = {}) {
  const {
    videoRef,
    introRange,
    outroRange,
    autoSkipIntro,
    setAutoSkipIntro,
    autoSkipOutro,
    setAutoSkipOutro,
    availableQualities,
    currentQuality,
    handleQualityChange,
    subtitleTracks,
    selectedSubtitle,
    handleSubtitleChange,
  } = useVideoPlayerContext();

  return (
    <div className={`flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 ${className}`.trim()}>
      <div className="flex flex-wrap items-center gap-2">
        {introRange && (
          <button
            onClick={() => setAutoSkipIntro((prev) => !prev)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              autoSkipIntro
                ? "bg-[#f5c518] text-black"
                : "bg-[#0f1729] text-gray-300 hover:bg-[#232d3f] hover:text-white"
            }`}
            style={{ minWidth: "140px" }}
          >
            Auto Skip OP: {autoSkipIntro ? "ON" : "OFF"}
          </button>
        )}
        {outroRange && (
          <button
            onClick={() => setAutoSkipOutro((prev) => !prev)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              autoSkipOutro
                ? "bg-[#f5c518] text-black"
                : "bg-[#0f1729] text-gray-300 hover:bg-[#232d3f] hover:text-white"
            }`}
            style={{ minWidth: "140px" }}
          >
            Auto Skip ED: {autoSkipOutro ? "ON" : "OFF"}
          </button>
        )}
      </div>

      <div className="md:ml-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 text-xs w-full md:w-auto">
        <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <span className="uppercase tracking-widest text-[10px] text-gray-400">Quality</span>
          <select
            className="rounded-xl bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5c518] w-full sm:w-[140px]"
            value={currentQuality}
            onChange={(e) => handleQualityChange(e.target.value)}
            disabled={availableQualities.length === 0}
          >
            {availableQualities.length === 0 ? (
              <option value={currentQuality} className="bg-[#0f1729] text-white">
                Loading...
              </option>
            ) : (
              availableQualities.map((quality) => (
                <option key={quality} value={quality} className="bg-[#0f1729] text-white">
                  {quality === "auto" ? "Auto" : quality.toUpperCase()}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <span className="uppercase tracking-widest text-[10px] text-gray-400">Subtitles</span>
          <select
            className="rounded-xl bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5c518] w-full sm:w-[180px]"
            value={selectedSubtitle === "off" ? "off" : String(selectedSubtitle)}
            onChange={(e) => {
              const value = e.target.value;
              handleSubtitleChange(value === "off" ? "off" : Number(value));
            }}
          >
            <option value="off" className="bg-[#0f1729] text-white">
              Off
            </option>
            {subtitleTracks.map((track, index) => (
              <option key={track.lang + index} value={index} className="bg-[#0f1729] text-white">
                {track.lang}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}