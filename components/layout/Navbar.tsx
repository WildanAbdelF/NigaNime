"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Anime List", href: "/anime" },
  { name: "Trending", href: "/trending" },
  { name: "Schedule", href: "/schedule" },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            NigaNime
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-8 mr-auto ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search & Profile */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 bg-[#1a2332] border border-[#2a3441] rounded-full px-4 py-2 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c518] transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
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
          </div>

          {/* Profile Avatar */}
          <button className="w-10 h-10 rounded-full bg-[#1a2332] border border-[#2a3441] flex items-center justify-center hover:border-[#f5c518] transition-colors">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-[#0f1729]/98 backdrop-blur-md">
          <div className="flex flex-col p-6 space-y-2">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a2332] border border-[#2a3441] rounded-full px-4 py-3 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c518] transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
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
            </div>

            {/* Mobile Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-[#1a2332] px-4 py-3 rounded-lg transition-colors font-medium text-lg"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
