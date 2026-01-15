"use client";

import { useState, useEffect } from "react";

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
                  href={`/watch/${encodeURIComponent(episodeId)}?server=${currentServer}&category=${cat.key}`}
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
          {(servers[currentCategory as keyof ServersData] || []).map((server) => (
            <a
              key={`${currentCategory}-${server.serverId}-${server.serverName}`}
              href={`/watch/${encodeURIComponent(episodeId)}?server=${server.serverName}&category=${currentCategory}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-center ${
                currentServer === server.serverName
                  ? "bg-[#f5c518] text-black"
                  : "bg-[#0f1729] text-gray-300 hover:bg-[#232d3f] hover:text-white"
              }`}
              style={{ minWidth: "96px" }}
            >
              {server.serverName.toUpperCase()}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
