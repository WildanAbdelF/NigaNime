"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ViewToggleProps {
  currentView: "grid" | "list";
}

export default function ViewToggle({ currentView }: ViewToggleProps) {
  const searchParams = useSearchParams();

  // Build URL preserving existing params but changing view
  const buildUrl = (view: "grid" | "list") => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "grid") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    const query = params.toString();
    return query ? `/anime?${query}` : "/anime";
  };

  return (
    <div className="flex bg-[#1e293b] rounded-lg overflow-hidden border border-[#2a3441]">
      <Link
        href={buildUrl("grid")}
        className={`p-2 md:p-2.5 transition-colors ${
          currentView === "grid"
            ? "bg-[#f5c518] text-black"
            : "text-gray-400 hover:text-white"
        }`}
        title="Grid View"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
        </svg>
      </Link>
      <Link
        href={buildUrl("list")}
        className={`p-2 md:p-2.5 transition-colors ${
          currentView === "list"
            ? "bg-[#f5c518] text-black"
            : "text-gray-400 hover:text-white"
        }`}
        title="List View"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
        </svg>
      </Link>
    </div>
  );
}
