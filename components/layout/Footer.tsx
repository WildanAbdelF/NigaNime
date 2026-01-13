import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0a0f1a] border-t border-[#2a3441] py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-500 text-sm">
          © 2026 NigaNime. All rights reserved.
        </p>
        <p className="text-gray-600 text-xs mt-2">
          Powered by{" "}
          <Link
            href="https://niga-nime-api.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f5c518] hover:underline"
          >
            NigaNime API via Hianime.to
          </Link>
        </p>
      </div>
    </footer>
  );
}
