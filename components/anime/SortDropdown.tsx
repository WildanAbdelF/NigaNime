"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface SortOption {
  label: string;
  value: string;
}

interface SortDropdownProps {
  options: SortOption[];
  currentValue: string;
}

export default function SortDropdown({ options, currentValue }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const currentOption = options.find(o => o.value === currentValue) || options[0];

  // Build URL updating sort while preserving letter filter
  const buildUrl = (sort: string) => {
    const params = new URLSearchParams();
    
    // Preserve letter if present
    const letter = searchParams.get("letter");
    if (letter && letter !== "All") params.set("letter", letter);
    
    // Set sort (combine with letter filter)
    if (sort !== "default") params.set("sort", sort);
    
    // Reset page to 1 when changing sort
    // Preserve view mode
    const view = searchParams.get("view");
    if (view) params.set("view", view);
    
    const query = params.toString();
    return query ? `/anime?${query}` : "/anime";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#1e293b] text-white px-3 py-2 rounded-lg hover:bg-[#2a3441] transition-colors border border-[#2a3441] text-sm md:text-base md:px-4"
      >
        <span className="truncate max-w-[100px] md:max-w-[140px]">{currentOption.label}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#1e293b] border border-[#2a3441] rounded-lg shadow-xl z-[100] overflow-hidden">
          {options.map((option) => (
            <Link
              key={option.value}
              href={buildUrl(option.value)}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors ${
                currentValue === option.value
                  ? "bg-[#f5c518] text-black font-medium"
                  : "text-gray-300 hover:bg-[#2a3441]"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
