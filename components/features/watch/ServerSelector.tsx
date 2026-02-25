"use client";

import { useState, useEffect } from "react";
import { buildWatchUrl } from "@/lib/utils/watchUrl";

interface ServerSelectorProps {
  episodeId: string;
  currentServer: string;
  currentCategory: string;
}

interface Server {
  serverId: number;
  serverName: string;
}

interface ServersData {
  sub: Server[];
  dub: Server[];
  raw: Server[];
}

export default function ServerSelector({ episodeId, currentServer, currentCategory }: ServerSelectorProps) {
  const [servers, setServers] = useState<ServersData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/watch/servers?episodeId=${encodeURIComponent(episodeId)}`);
        if (response.ok) {
          const result = await response.json();
          setServers(result.data);
        }
      } catch (error) {
        console.error("Error fetching servers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();
  }, [episodeId]);

  const categories = [
    { key: "sub", label: "SUB", color: "bg-[#f5c518] text-black" },
    { key: "dub", label: "DUB", color: "bg-blue-500 text-white" },
    { key: "raw", label: "RAW", color: "bg-gray-500 text-white" },
  ];

  if (isLoading) {
    return (
      <div className="px-4 py-4 bg-[#1a2332]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading servers...</span>
        </div>
      </div>
    );
  }

  if (!servers) {
    return null;
  }

  return (
    <div className="px-4 py-4 bg-[#1a2332] border-b border-[#2a3441]">
      <div className="flex flex-col gap-4">
        {/* Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-gray-400 text-sm font-medium">SERVERS:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const serverList = servers[cat.key as keyof ServersData] || [];
              if (serverList.length === 0) return null;
              
              return (
                <a
                  key={cat.key}
                  href={buildWatchUrl(episodeId, { server: currentServer, category: cat.key })}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    currentCategory === cat.key
                      ? cat.color
                      : "bg-[#0f1729] text-gray-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Server Buttons */}
        <div className="flex flex-wrap gap-2">
          {(servers[currentCategory as keyof ServersData] || [])
            .sort((a, b) => {
              // Put HD-2 first since HD-1 (Megacloud) is often blocked
              if (a.serverName.toLowerCase() === 'hd-2') return -1;
              if (b.serverName.toLowerCase() === 'hd-2') return 1;
              return 0;
            })
            .map((server) => {
              const isUnstable = server.serverName.toLowerCase() === 'hd-1';
              return (
                <a
                  key={`${currentCategory}-${server.serverId}-${server.serverName}`}
                  href={buildWatchUrl(episodeId, { server: server.serverName, category: currentCategory })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-center relative ${
                    currentServer === server.serverName
                      ? "bg-[#f5c518] text-black"
                      : isUnstable
                        ? "bg-[#0f1729] text-gray-500 hover:bg-[#232d3f] hover:text-gray-300"
                        : "bg-[#0f1729] text-gray-300 hover:bg-[#232d3f] hover:text-white"
                  }`}
                  style={{ minWidth: "96px" }}
                  title={isUnstable ? "This server may be unstable" : undefined}
                >
                  {server.serverName.toUpperCase()}
                  {isUnstable && (
                    <span className="ml-1 text-[10px] text-yellow-500">⚠</span>
                  )}
                </a>
              );
            })}
        </div>
      </div>
    </div>
  );
}
