import Link from "next/link";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Anime List", href: "/anime" },
  { label: "Trending", href: "/trending" },
];

const supportLinks = [
  { label: "DMCA", href: "mailto:legal@niganime.com?subject=DMCA" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "mailto:hello@niganime.com" },
];

const socialLinks = [
  { label: "Website", href: "https://niga-nime.vercel.app", icon: "globe" },
  { label: "Community", href: "https://discord.com", icon: "chat" },
];

const renderIcon = (name: string) => {
  if (name === "chat") {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h8M8 14h5m8 1a3 3 0 01-3 3H7l-4 4V6a3 3 0 013-3h14a3 3 0 013 3v9z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10a3 3 0 100-6 3 3 0 000 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
    </svg>
  );
};

export default function Footer() {
  return (
    <footer className="bg-[#05132b] text-white border-t border-white/5">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-2xl font-extrabold">
              Niga<span className="text-[#f5c518]">Nime</span>
            </div>
            <p className="text-sm text-gray-400 mt-4 leading-relaxed">
              Disclaimer: This site does not store any files on its server. All contents are provided by non-affiliated third parties.
            </p>
          </div>

          <div>
            <h4 className="uppercase tracking-[0.3em] text-xs text-gray-400 mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-200 hover:text-[#f5c518] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-[0.3em] text-xs text-gray-400 mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-200 hover:text-[#f5c518] transition-colors"
                    target={link.href.startsWith("http") || link.href.startsWith("mailto") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") || link.href.startsWith("mailto") ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-[0.3em] text-xs text-gray-400 mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-[#f5c518] hover:text-black transition-colors"
                >
                  {renderIcon(link.icon)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-sm text-gray-400 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p>© 2026 NigaNime. All rights reserved.</p>
          <p>
            Powered by{" "}
            <Link
              href="https://niga-nime-api.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f5c518] hover:underline"
            >
              NigaNime API via Hianime
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
