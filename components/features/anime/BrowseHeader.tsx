"use client";

interface BrowseHeaderProps {
  title: string;
  subtitle?: string;
}

export default function BrowseHeader({ title, subtitle }: BrowseHeaderProps) {
  return (
    <div className="mb-4 md:mb-6">
      <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-400 text-sm md:text-base">{subtitle}</p>
      )}
    </div>
  );
}
