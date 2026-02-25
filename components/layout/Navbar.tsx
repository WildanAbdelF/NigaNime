"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, FormEvent } from "react";
import { useUser } from "@/lib/hooks/useUser";

interface Suggestion {
  id: string;
  name: string;
  poster: string;
  jname?: string;
  moreInfo?: string[];
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Anime List", href: "/anime" },
  { name: "Movie", href: "/movie" },
  { name: "Trending", href: "/trending" },
  { name: "Schedule", href: "/schedule" },
  { name: "Genre", href: "/genre" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: userLoading, signOut } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const mobileSuggestionsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Check if a link is active
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Fetch suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data?.data?.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle search submit
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/anime?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Desktop search
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setShowSuggestions(false);
      }
      
      // Mobile search
      if (
        mobileSuggestionsRef.current &&
        !mobileSuggestionsRef.current.contains(target) &&
        mobileInputRef.current &&
        !mobileInputRef.current.contains(target)
      ) {
        setShowSuggestions(false);
      }

      // User menu
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Suggestion item component
  const SuggestionItem = ({ suggestion }: { suggestion: Suggestion }) => (
    <Link
      href={`/anime/${suggestion.id}`}
      onClick={() => {
        setShowSuggestions(false);
        setSearchQuery("");
        setIsMobileMenuOpen(false);
      }}
      className="flex items-center gap-3 px-4 py-2 hover:bg-[#232d3f] transition-colors"
    >
      <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0">
        {suggestion.poster ? (
          <Image
            src={suggestion.poster}
            alt={suggestion.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-[#0f1729] flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium line-clamp-1">
          {suggestion.name}
        </h4>
        {suggestion.jname && (
          <p className="text-gray-500 text-xs line-clamp-1">
            {suggestion.jname}
          </p>
        )}
        {suggestion.moreInfo && suggestion.moreInfo.length > 0 && (
          <p className="text-gray-400 text-xs mt-0.5">
            {suggestion.moreInfo.join(" • ")}
          </p>
        )}
      </div>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#0f1729]/95 backdrop-blur-sm border-b border-[#2a3441]">
      <nav className="px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold text-white">
              Niga<span className="text-[#f5c518]">Nime</span>
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-8 mr-auto ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-colors font-medium ${
                isActiveLink(link.href)
                  ? "text-[#f5c518]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search & Profile */}
        <div className="flex items-center gap-4">
          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
              className="w-48 lg:w-64 bg-[#1a2332] border border-[#2a3441] rounded-full px-4 py-2 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c518] transition-colors"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-4 h-4 text-gray-500 hover:text-[#f5c518] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Desktop Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isLoading) && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-[#1a2332] border border-[#2a3441] rounded-lg shadow-xl z-[100] max-h-[400px] overflow-y-auto min-w-[320px]"
              >
                {isLoading ? (
                  <div className="p-4 text-center text-gray-400">
                    <div className="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2">Searching...</span>
                  </div>
                ) : (
                  <div className="py-2">
                    {suggestions.map((suggestion) => (
                      <SuggestionItem key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            {userLoading ? (
              <div className="w-10 h-10 rounded-full bg-[#1a2332] border border-[#2a3441] animate-pulse" />
            ) : user ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full bg-[#f5c518] border-2 border-[#f5c518] flex items-center justify-center hover:opacity-90 transition-opacity overflow-hidden"
                >
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-black font-bold text-sm">
                      {(user.user_metadata?.name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a2332] border border-[#2a3441] rounded-lg shadow-xl z-[100] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#2a3441]">
                      <p className="text-white text-sm font-medium truncate">
                        {user.user_metadata?.name || user.email?.split("@")[0]}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[#232d3f] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        My Favorites
                      </Link>
                      <Link
                        href="/profile?tab=history"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[#232d3f] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Watch History
                      </Link>
                    </div>
                    <div className="border-t border-[#2a3441] py-1">
                      <button
                        onClick={() => { setShowUserMenu(false); signOut(); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-[#232d3f] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-[#f5c518] hover:bg-[#d4a817] text-black font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden absolute left-0 right-0 top-16 z-50 bg-[#0f1729] border-b border-[#2a3441] overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col p-4 space-y-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <input
              ref={mobileInputRef}
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-[#1a2332] border border-[#2a3441] rounded-full px-4 py-3 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c518] transition-colors"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 text-gray-500 hover:text-[#f5c518] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Mobile Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isLoading) && (
              <div
                ref={mobileSuggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-[#1a2332] border border-[#2a3441] rounded-lg shadow-xl z-[100] max-h-[300px] overflow-y-auto"
              >
                {isLoading ? (
                  <div className="p-4 text-center text-gray-400">
                    <div className="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2">Searching...</span>
                  </div>
                ) : (
                  <div className="py-2">
                    {suggestions.map((suggestion) => (
                      <SuggestionItem key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Mobile Nav Links */}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg ${
                isActiveLink(link.href)
                  ? "bg-[#f5c518] text-black"
                  : "text-gray-300 hover:text-white bg-[#1a2332] hover:bg-[#232d3f]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
